import { useState, useRef, useEffect, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { OnMount } from "@monaco-editor/react";
import type * as MonacoType from "monaco-editor";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";

import {
	useJoinSessionQuery,
	useOpenFileQuery,
	useMoveCursorMutation,
	useSelectTextMutation,
	useSaveFileMutation,
} from "@/store/api/collabApi";
import {
	useGetUserQuery,
	useListFilesQuery,
	useCreateFileMutation,
} from "@/store/api/api";
import { useRootSelector } from "@/store/store";
import type {
	SessionFile,
	SessionUser,
	SocketConnectionStatus,
} from "@/types/collabTypes";
import { getSocket } from "@/store/socketManager";

// Sub-components
import { SessionHeader } from "@/components/session/SessionHeader";
import { MembersSidebar } from "@/components/session/MembersSidebar";
import { FilesPanel } from "@/components/session/FilesPanel";
import { EditorArea } from "@/components/session/EditorArea";
import { NewFileDialog } from "@/components/session/NewFileDialog";
import {
	ConnectingScreen,
	ErrorScreen,
} from "@/components/session/FullPageStates";
import { langFromFilename } from "@/components/session/helpers";

/* ─── Session Room Page ───────────────────────────────────── */

const EMPTY_USERS: SessionUser[] = [];

export function SessionRoomPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();

	// ── Auth & user ──────────────────────────────────────────
	const token = useRootSelector((state) => state.auth.token);
	const { data: userData } = useGetUserQuery();
	const username = userData?.data.user.username ?? "";

	// ── Socket / session join ────────────────────────────────
	const skipJoin = !roomId || !token;
	const { data: sessionState } = useJoinSessionQuery(
		{ inviteCode: roomId ?? "", token: token ?? "" },
		{ skip: skipJoin }
	);

	const connectionStatus: SocketConnectionStatus =
		sessionState?.connectionStatus ?? (skipJoin ? "idle" : "connecting");
	const sessionName = sessionState?.session?.name ?? "";
	const users: SessionUser[] = sessionState?.users ?? EMPTY_USERS;
	const socketError = sessionState?.error ?? null;

	// ── Local UI state ───────────────────────────────────────
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [openTabs, setOpenTabs] = useState<SessionFile[]>([]);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
	const [newFileOpen, setNewFileOpen] = useState(false);

	// ── File management ───────────────────────────────────────
	const sessionId = sessionState?.session?.id;

	const { data: filesData, refetch: refetchFiles } = useListFilesQuery(
		sessionId ?? "",
		{ skip: !sessionId }
	);
	const files = filesData?.data.files ?? sessionState?.session?.files ?? [];

	// Fetch initial DB state via REST/Socket wrapper
	const { data: fileData } = useOpenFileQuery(
		{ sessionId: sessionId ?? "", fileId: activeFileId ?? "" },
		{ skip: !sessionId || !activeFileId }
	);

	const [createFile, { isLoading: isCreatingFile }] = useCreateFileMutation();
	const loadedFileIdRef = useRef<string | null>(null);

	const lastSavedBy = fileData?.lastSavedBy ?? null;
	const lastSavedAt = fileData?.lastSavedAt ?? null;

	// ── Yjs State ────────────────────────────────────────────
	const yDocsRef = useRef<Record<string, Y.Doc>>({});
	const yBindingsRef = useRef<Record<string, MonacoBinding>>({});
	const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(
		null
	);
	const monacoRef = useRef<typeof MonacoType | null>(null);
	const decorationIdsRef = useRef<string[]>([]);
	const sessionIdRef = useRef(sessionId);
	const activeFileIdRef = useRef(activeFileId);

	// ── Mutations ────────────────────────────────────────────
	const [saveFile] = useSaveFileMutation();
	const [moveCursor] = useMoveCursorMutation();
	const [selectText] = useSelectTextMutation();

	const moveCursorRef = useRef(moveCursor);
	const selectTextRef = useRef(selectText);
	const handleSaveRef = useRef<() => void>(() => {});

	useEffect(() => {
		sessionIdRef.current = sessionId;
		activeFileIdRef.current = activeFileId;
		moveCursorRef.current = moveCursor;
		selectTextRef.current = selectText;
		handleSaveRef.current = handleSave;
	});

	// ── Yjs & Monaco Binding Logic ────────────────────────────

	const bindYjsToMonaco = useCallback((fileId: string) => {
		const editor = editorRef.current;
		const doc = yDocsRef.current[fileId];
		if (!editor || !doc) return;

		// Clean up old binding
		if (yBindingsRef.current[fileId]) {
			yBindingsRef.current[fileId].destroy();
		}

		// Since we use the `path` prop in <Editor>, Monaco automatically
		// swaps the ITextModel. We get the current one.
		const model = editor.getModel();
		if (!model) return;

		const ytext = doc.getText("content");
		yBindingsRef.current[fileId] = new MonacoBinding(
			ytext,
			model,
			new Set([editor]),
			null // we can add awareness here later
		);
	}, []);

	// Handle initial file content delivery
	useEffect(() => {
		if (!fileData || fileData.fileId !== activeFileId || !sessionId) return;

		if (loadedFileIdRef.current !== activeFileId) {
			loadedFileIdRef.current = activeFileId;

			if (!yDocsRef.current[activeFileId]) {
				const doc = new Y.Doc();
				yDocsRef.current[activeFileId] = doc;

				// Listen for local updates to broadcast
				doc.on("update", (update: Uint8Array, origin: unknown) => {
					// MonacoBinding sets origin to itself when it creates an update.
					// If the origin is 'remote', we applied it from the socket, so don't re-broadcast.
					if (origin !== "remote") {
						getSocket()?.emit("update", {
							sessionId,
							fileId: activeFileId,
							update: Array.from(update),
						});
					}

					// Mark dirty if it's a local edit
					if (origin !== "remote") {
						setDirtyFiles((prev) =>
							new Set(prev).add(activeFileId)
						);
					}
				});
			}

			// If the editor is mounted, bind it immediately
			if (editorRef.current) {
				bindYjsToMonaco(activeFileId);
			}

			// Send sync-request to get missed changes
			const doc = yDocsRef.current[activeFileId];
			if (doc && getSocket()?.connected) {
				getSocket()?.emit("sync-request", {
					sessionId,
					fileId: activeFileId,
					stateVector: Array.from(Y.encodeStateVector(doc)),
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		fileData?.fileId,
		fileData?.content,
		activeFileId,
		sessionId,
		bindYjsToMonaco,
	]);

	// Socket listeners for Yjs updates
	useEffect(() => {
		const socket = getSocket();
		if (!socket || !sessionId) return;

		const onUpdate = (event: { fileId: string; update: number[] }) => {
			const doc = yDocsRef.current[event.fileId];
			if (doc) {
				Y.applyUpdate(doc, new Uint8Array(event.update), "remote");
			}
		};

		const onSyncResponse = (event: {
			fileId: string;
			update: number[];
		}) => {
			const doc = yDocsRef.current[event.fileId];
			if (doc) {
				Y.applyUpdate(doc, new Uint8Array(event.update), "remote");
			}
		};

		const onConnect = () => {
			if (activeFileIdRef.current) {
				const doc = yDocsRef.current[activeFileIdRef.current];
				if (doc) {
					socket.emit("sync-request", {
						sessionId: sessionIdRef.current,
						fileId: activeFileIdRef.current,
						stateVector: Array.from(Y.encodeStateVector(doc)),
					});
				}
			}
		};

		socket.on("update", onUpdate);
		socket.on("sync-response", onSyncResponse);
		socket.on("connect", onConnect);

		return () => {
			socket.off("update", onUpdate);
			socket.off("sync-response", onSyncResponse);
			socket.off("connect", onConnect);
		};
	}, [sessionId]); // removed activeFileId so it listens for all open tabs

	// Cursor decorators
	useEffect(() => {
		const editor = editorRef.current;
		const monaco = monacoRef.current;
		if (!editor || !monaco || !activeFileId) {
			decorationIdsRef.current =
				editor?.deltaDecorations(decorationIdsRef.current, []) ?? [];
			return;
		}

		const newDecorations: MonacoType.editor.IModelDeltaDecoration[] = [];

		for (const user of users) {
			if (!user.cursor || user.cursor.fileId !== activeFileId) continue;
			const color = user.color;
			const uid = user.userId.replace(/-/g, "");
			const cursorClass = `remote-cursor-${uid}`;
			const labelClass = `remote-cursor-label-${uid}`;

			const styleId = `cursor-style-${user.userId}`;
			if (!document.getElementById(styleId)) {
				const style = document.createElement("style");
				style.id = styleId;
				style.textContent = [
					`.${cursorClass} { border-left: 2px solid ${color}; margin-left: -1px; }`,
					`.${labelClass}::before { content: "${user.username}"; position: absolute;`,
					`  top: -18px; left: 0; background: ${color}; color: #fff;`,
					`  font-size: 10px; padding: 1px 5px; border-radius: 3px; white-space: nowrap; z-index: 10; }`,
				].join(" ");
				document.head.appendChild(style);
			}

			const line = Math.max(1, user.cursor.line);
			const col = Math.max(1, user.cursor.column);
			newDecorations.push({
				range: new monaco.Range(line, col, line, col),
				options: {
					className: cursorClass,
					beforeContentClassName: labelClass,
					stickiness:
						monaco.editor.TrackedRangeStickiness
							.NeverGrowsWhenTypingAtEdges,
				},
			});

			if (user.selection) {
				const sel = user.selection;
				const selClass = `remote-selection-${uid}`;
				const selStyleId = `sel-style-${user.userId}`;
				if (!document.getElementById(selStyleId)) {
					const style = document.createElement("style");
					style.id = selStyleId;
					style.textContent = `.${selClass} { background: ${color}33; }`;
					document.head.appendChild(style);
				}

				newDecorations.push({
					range: new monaco.Range(
						sel.startLine,
						sel.startColumn,
						sel.endLine,
						sel.endColumn
					),
					options: {
						inlineClassName: selClass,
						stickiness:
							monaco.editor.TrackedRangeStickiness
								.NeverGrowsWhenTypingAtEdges,
					},
				});
			}
		}

		decorationIdsRef.current = editor.deltaDecorations(
			decorationIdsRef.current,
			newDecorations
		);
	}, [users, activeFileId]);

	useEffect(() => {
		if (fileData?.lastSavedAt && activeFileId) {
			// eslint-disable-next-line
			setDirtyFiles((prev) => {
				const next = new Set(prev);
				next.delete(activeFileId);
				return next;
			});
		}
	}, [fileData, activeFileId]);

	const handleEditorMount = useCallback<OnMount>(
		(editor, monaco) => {
			editorRef.current = editor;
			monacoRef.current = monaco as unknown as typeof MonacoType;

			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () =>
				handleSaveRef.current()
			);

			if (
				activeFileIdRef.current &&
				yDocsRef.current[activeFileIdRef.current]
			) {
				bindYjsToMonaco(activeFileIdRef.current);
			}

			let cursorTimer: ReturnType<typeof setTimeout> | null = null;
			editor.onDidChangeCursorPosition((e) => {
				if (cursorTimer) clearTimeout(cursorTimer);
				cursorTimer = setTimeout(() => {
					const sid = sessionIdRef.current;
					const fid = activeFileIdRef.current;
					if (!sid || !fid) return;
					void moveCursorRef.current({
						sessionId: sid,
						fileId: fid,
						line: e.position.lineNumber,
						column: e.position.column,
					});
				}, 80);
			});

			let selTimer: ReturnType<typeof setTimeout> | null = null;
			editor.onDidChangeCursorSelection((e) => {
				if (selTimer) clearTimeout(selTimer);
				selTimer = setTimeout(() => {
					const sid = sessionIdRef.current;
					const fid = activeFileIdRef.current;
					if (!sid || !fid) return;
					const sel = e.selection;
					if (sel.isEmpty()) return;
					void selectTextRef.current({
						sessionId: sid,
						fileId: fid,
						selection: {
							startLine: sel.startLineNumber,
							startColumn: sel.startColumn,
							endLine: sel.endLineNumber,
							endColumn: sel.endColumn,
						},
					});
				}, 80);
			});
		},
		[bindYjsToMonaco]
	);

	if (!token) {
		return <Navigate to="/auth/login" replace />;
	}

	if (connectionStatus === "idle" || connectionStatus === "connecting") {
		return <ConnectingScreen />;
	}

	if (connectionStatus === "error" || connectionStatus === "disconnected") {
		return (
			<ErrorScreen
				message={
					socketError ??
					"The connection was lost. Please try rejoining."
				}
				onBack={() => navigate("/")}
			/>
		);
	}

	function openFile(file: SessionFile) {
		if (file.id !== activeFileId) {
			// Trigger re-bind if doc already exists
			if (yDocsRef.current[file.id] && editorRef.current) {
				// Delay binding until next frame to allow Editor's `path` prop to swap the model first
				setTimeout(() => {
					bindYjsToMonaco(file.id);
				}, 0);
			}
		}
		setActiveFileId(file.id);
		if (!openTabs.some((t) => t.id === file.id)) {
			setOpenTabs((prev) => [...prev, file]);
		}
	}

	function closeTab(fileId: string) {
		setOpenTabs((prev) => prev.filter((t) => t.id !== fileId));
		setDirtyFiles((prev) => {
			const next = new Set(prev);
			next.delete(fileId);
			return next;
		});

		if (yBindingsRef.current[fileId]) {
			yBindingsRef.current[fileId].destroy();
			delete yBindingsRef.current[fileId];
		}
		if (yDocsRef.current[fileId]) {
			yDocsRef.current[fileId].destroy();
			delete yDocsRef.current[fileId];
		}

		if (activeFileId === fileId) {
			const remaining = openTabs.filter((t) => t.id !== fileId);
			const next = remaining[remaining.length - 1] ?? null;
			setActiveFileId(next?.id ?? null);
			if (next?.id) {
				setTimeout(() => bindYjsToMonaco(next.id), 0);
			}
		}
	}

	function handleSave() {
		if (!sessionId || !activeFileId) return;
		const doc = yDocsRef.current[activeFileId];
		if (!doc) return;

		void saveFile({
			sessionId,
			fileId: activeFileId,
			content: doc.getText("content").toString(),
		});
	}

	async function handleNewFile(filename: string): Promise<boolean> {
		if (!sessionId) return false;
		const lang = langFromFilename(filename);
		try {
			const result = await createFile({
				sessionId,
				filename,
				language: lang,
			}).unwrap();
			const newFile: SessionFile = {
				id: result.data.file.id,
				filename: result.data.file.filename,
				language: result.data.file.language,
			};
			setOpenTabs((prev) => [...prev, newFile]);
			setActiveFileId(newFile.id);

			// We don't set loadedFileIdRef here because we want the query to fetch the initial empty state
			// But since we just created it, we can prepopulate Y.Doc
			const doc = new Y.Doc();
			yDocsRef.current[newFile.id] = doc;
			doc.on("update", (update: Uint8Array, origin: unknown) => {
				if (origin !== "remote") {
					getSocket()?.emit("update", {
						sessionId,
						fileId: newFile.id,
						update: Array.from(update),
					});
					setDirtyFiles((prev) => new Set(prev).add(newFile.id));
				}
			});
			loadedFileIdRef.current = newFile.id;
			setTimeout(() => bindYjsToMonaco(newFile.id), 0);

			void refetchFiles();
			return true;
		} catch {
			return false;
		}
	}

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background">
			<SessionHeader
				sessionName={sessionName}
				inviteCode={roomId ?? ""}
				connectionStatus={connectionStatus}
				username={username}
				onBack={() => navigate("/")}
			/>

			<div className="flex flex-1 overflow-hidden">
				<MembersSidebar
					users={users}
					activeFileId={activeFileId}
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed((v) => !v)}
				/>

				<FilesPanel
					files={files}
					activeFileId={activeFileId}
					users={users}
					onFileClick={openFile}
				/>

				<EditorArea
					openTabs={openTabs}
					activeFileId={activeFileId}
					dirtyFiles={dirtyFiles}
					onTabClick={openFile}
					onTabClose={closeTab}
					onNewFileClick={() => setNewFileOpen(true)}
					onSave={handleSave}
					onEditorMount={handleEditorMount}
					lastSavedBy={lastSavedBy}
					lastSavedAt={lastSavedAt}
				/>
			</div>

			<NewFileDialog
				open={newFileOpen}
				onClose={() => setNewFileOpen(false)}
				onConfirm={handleNewFile}
				isCreating={isCreatingFile}
			/>
		</div>
	);
}

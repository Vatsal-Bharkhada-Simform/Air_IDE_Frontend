import { useState, useRef, useEffect, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { OnMount } from "@monaco-editor/react";
import type * as MonacoType from "monaco-editor";

import {
	useJoinSessionQuery,
	useOpenFileQuery,
	useEditFileMutation,
	useMoveCursorMutation,
	useSelectTextMutation,
	useSaveFileMutation,
} from "@/store/api/collabApi";
import {
	useGetUserQuery,
	useListFilesQuery,
	useCreateFileMutation,
} from "@/store/api/api";
import type { EditorChanges } from "@/types/collabTypes";
import { useRootSelector } from "@/store/store";
import type {
	SessionFile,
	SessionUser,
	SocketConnectionStatus,
} from "@/types/collabTypes";

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

export function SessionRoomPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();

	// ── Auth & user ──────────────────────────────────────────
	const token = useRootSelector((state) => state.auth.token);
	const { data: userData } = useGetUserQuery();
	const username = userData?.data.user.username ?? "";

	// ── Socket / session join ────────────────────────────────
	// Skip the query entirely if we don't have both pieces yet.
	const skipJoin = !roomId || !token;
	const { data: sessionState } = useJoinSessionQuery(
		{ inviteCode: roomId ?? "", token: token ?? "" },
		{ skip: skipJoin }
	);

	const connectionStatus: SocketConnectionStatus =
		sessionState?.connectionStatus ?? (skipJoin ? "idle" : "connecting");
	const sessionName = sessionState?.session?.name ?? "";
	const users: SessionUser[] = sessionState?.users ?? [];
	const socketError = sessionState?.error ?? null;

	// ── Local UI state ───────────────────────────────────────
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [openTabs, setOpenTabs] = useState<SessionFile[]>([]);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
	// Per-file content map: preserves each file's content across tab switches
	const [fileContents, setFileContents] = useState<Record<string, string>>(
		{}
	);
	const [newFileOpen, setNewFileOpen] = useState(false);

	// Derived — the Monaco editor always reads from the active file's slot
	const editorContent =
		activeFileId !== null ? (fileContents[activeFileId] ?? "") : "";

	// ── File management (Iteration 2) ─────────────────────────
	const sessionId = sessionState?.session?.id;

	// REST file list — refreshed manually after creating a file
	const { data: filesData, refetch: refetchFiles } = useListFilesQuery(
		sessionId ?? "",
		{ skip: !sessionId }
	);
	const files = filesData?.data.files ?? sessionState?.session?.files ?? [];

	// Socket-based file content for the currently active file
	const { data: fileData } = useOpenFileQuery(
		{ sessionId: sessionId ?? "", fileId: activeFileId ?? "" },
		{ skip: !sessionId || !activeFileId }
	);

	// REST create-file mutation
	const [createFile, { isLoading: isCreatingFile }] = useCreateFileMutation();

	// Track which file's content we've already loaded to avoid
	// overwriting local edits if the socket re-delivers the same file.
	const loadedFileIdRef = useRef<string | null>(null);

	// Derived from query result
	const lastSavedBy = fileData?.lastSavedBy ?? null;
	const lastSavedAt = fileData?.lastSavedAt ?? null;

	// ── Editing, saving, and cursor mutations ────────────────
	const [editFile] = useEditFileMutation();
	const [saveFile] = useSaveFileMutation();
	const [moveCursor] = useMoveCursorMutation();
	const [selectText] = useSelectTextMutation();

	// Debounce timer for socket edits
	const editDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Suppress re-broadcasting remote edits back to the socket
	const isRemoteEditRef = useRef(false);
	// Ref mirror of fileContents — readable inside useEffect without making it a dep
	const fileContentsRef = useRef<Record<string, string>>({});
	fileContentsRef.current = fileContents;
	// Always-current ref to editorContent to avoid stale closure in Ctrl+S
	const editorContentRef = useRef(editorContent);
	editorContentRef.current = editorContent;

	// Ref that always points to the latest handleSave — lets handleEditorMount
	// register the keybinding once (empty deps) without ever going stale.
	const handleSaveRef = useRef<() => void>(() => {});
	// Mutation refs — stable handles for use inside Monaco's event listeners
	const moveCursorRef = useRef(moveCursor);
	moveCursorRef.current = moveCursor;
	const selectTextRef = useRef(selectText);
	selectTextRef.current = selectText;
	// Persisted editor + monaco instances for the decoration effect
	const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(
		null
	);
	const monacoRef = useRef<typeof MonacoType | null>(null);
	// Current decoration IDs so we can replace them on every update
	const decorationIdsRef = useRef<string[]>([]);
	// Always-current sessionId and activeFileId for use inside Monaco listeners
	const sessionIdRef = useRef(sessionId);
	sessionIdRef.current = sessionId;
	const activeFileIdRef = useRef(activeFileId);
	activeFileIdRef.current = activeFileId;

	// File content sync:
	//   - First delivery (loadedFileIdRef ≠ activeFileId): initialise the slot in fileContents
	//     ONLY if it doesn't already hold local edits (checked via fileContentsRef).
	//   - Subsequent changes while the same file is active = remote edit from another user.
	useEffect(() => {
		if (
			!fileData ||
			fileData.fileId !== activeFileId ||
			fileData.content === undefined
		)
			return;

		if (loadedFileIdRef.current !== activeFileId) {
			loadedFileIdRef.current = activeFileId;
			// Only seed from socket if we have no local content for this file yet
			if (!(activeFileId in fileContentsRef.current)) {
				setFileContents((prev) => ({
					...prev,
					[activeFileId]: fileData.content,
				}));
			}
		} else {
			// Remote edit — update our local slot and flag to skip re-broadcast
			isRemoteEditRef.current = true;
			setFileContents((prev) => ({
				...prev,
				[activeFileId]: fileData.content,
			}));
		}
	}, [fileData?.fileId, fileData?.content, activeFileId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Re-apply remote cursor/selection decorations whenever users or active file changes
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

			// Inject per-user cursor CSS once
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

			// Cursor decoration (vertical bar)
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

			// Selection decoration
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
	}, [users, activeFileId]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (fileData?.lastSavedAt && activeFileId) {
			setDirtyFiles((prev) => {
				const next = new Set(prev);
				next.delete(activeFileId);
				return next;
			});
		}
	}, [fileData?.lastSavedAt]); // eslint-disable-line react-hooks/exhaustive-deps

	// Monaco mount handler — registers Ctrl+S once and wires cursor/selection events
	const handleEditorMount = useCallback<OnMount>(
		(editor, monaco) => {
			// Store instances for the decoration effect
			editorRef.current = editor;
			monacoRef.current = monaco as unknown as typeof MonacoType;

			// Ctrl+S — delegates to ref so it's never stale
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () =>
				handleSaveRef.current()
			);

			// Cursor position — debounced 80 ms to avoid flooding
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

			// Selection — debounced 80 ms
			let selTimer: ReturnType<typeof setTimeout> | null = null;
			editor.onDidChangeCursorSelection((e) => {
				if (selTimer) clearTimeout(selTimer);
				selTimer = setTimeout(() => {
					const sid = sessionIdRef.current;
					const fid = activeFileIdRef.current;
					if (!sid || !fid) return;
					const sel = e.selection;
					if (sel.isEmpty()) return; // cursor-only move, handled above
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
		[] // stable — keybinding + listeners registered once; refs handle updates
	);

	// ── Full-page gate: ALL hooks above, early returns below ───────
	if (!token) {
		console.log("Returning");

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
			// Reset the loaded marker so the socket re-delivers if the cache expired.
			// Do NOT clear the editor — fileContents[file.id] already has any local edits.
			loadedFileIdRef.current = null;
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
		// Free the content slot for this tab
		setFileContents((prev) => {
			const next = { ...prev };
			delete next[fileId];
			return next;
		});
		if (activeFileId === fileId) {
			const remaining = openTabs.filter((t) => t.id !== fileId);
			const next = remaining[remaining.length - 1] ?? null;
			setActiveFileId(next?.id ?? null);
			// No explicit content clear needed — editorContent derives from fileContents[next?.id]
		}
	}

	function handleContentChange(
		value: string | undefined,
		ev: MonacoType.editor.IModelContentChangedEvent
	) {
		// If this change was triggered by applying a remote edit, don't re-emit it.
		if (isRemoteEditRef.current) {
			isRemoteEditRef.current = false;
			return;
		}

		setFileContents((prev) => ({ ...prev, [activeFileId]: value ?? "" }));
		if (activeFileId) {
			setDirtyFiles((prev) => new Set(prev).add(activeFileId));
		}

		// Emit debounced edit deltas via socket
		if (!sessionId || !activeFileId) return;

		if (editDebounceRef.current) clearTimeout(editDebounceRef.current);
		editDebounceRef.current = setTimeout(() => {
			for (const change of ev.changes) {
				const editorChange: EditorChanges = {
					from: {
						line: change.range.startLineNumber - 1, // Monaco is 1-based, backend expects 0-based
						ch: change.range.startColumn - 1,
					},
					to: {
						line: change.range.endLineNumber - 1,
						ch: change.range.endColumn - 1,
					},
					text: change.text.split("\n"),
				};
				void editFile({
					sessionId,
					fileId: activeFileId,
					changes: editorChange,
				});
			}
		}, 200);
	}

	function handleSave() {
		if (!sessionId || !activeFileId) return;
		void saveFile({
			sessionId,
			fileId: activeFileId,
			content: editorContentRef.current, // ref never goes stale
		});
		// Dirty flag cleared reactively via the fileData.lastSavedAt useEffect
	}
	// Keep the ref current so the Monaco Ctrl+S command always calls the latest version
	handleSaveRef.current = handleSave;

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
			// Seed an empty slot so the editor shows blank immediately
			setFileContents((prev) => ({ ...prev, [newFile.id]: "" }));
			loadedFileIdRef.current = newFile.id; // mark loaded so socket won't overwrite
			void refetchFiles();
			return true;
		} catch {
			return false;
		}
	}

	// ── Render ────────────────────────────────────────────────

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background">
			{/* Header */}
			<SessionHeader
				sessionName={sessionName}
				inviteCode={roomId ?? ""}
				connectionStatus={connectionStatus}
				username={username}
				onBack={() => navigate("/")}
			/>

			{/* Body — sidebar + editor */}
			<div className="flex flex-1 overflow-hidden">
				{/* Members sidebar */}
				<MembersSidebar
					users={users}
					activeFileId={activeFileId}
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed((v) => !v)}
				/>

				{/* File explorer */}
				<FilesPanel
					files={files}
					activeFileId={activeFileId}
					users={users}
					onFileClick={openFile}
				/>

				{/* Monaco editor + tab bar */}
				<EditorArea
					openTabs={openTabs}
					activeFileId={activeFileId}
					dirtyFiles={dirtyFiles}
					content={editorContent}
					onTabClick={openFile}
					onTabClose={closeTab}
					onNewFileClick={() => setNewFileOpen(true)}
					onContentChange={handleContentChange}
					onSave={handleSave}
					onEditorMount={handleEditorMount}
					lastSavedBy={lastSavedBy}
					lastSavedAt={lastSavedAt}
				/>
			</div>

			{/* New file dialog */}
			<NewFileDialog
				open={newFileOpen}
				onClose={() => setNewFileOpen(false)}
				onConfirm={handleNewFile}
				isCreating={isCreatingFile}
			/>
		</div>
	);
}

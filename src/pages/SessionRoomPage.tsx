import { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import type * as MonacoType from "monaco-editor";

import {
	useJoinSessionQuery,
	useOpenFileQuery,
	useDeleteFileMutation,
	useRenameFileMutation,
} from "@/store/api/collabApi";
import { useGetUserQuery, useCreateFileMutation } from "@/store/api/api";
import { useRootSelector } from "@/store/store";
import type {
	SessionFile,
	SessionUser,
	SocketConnectionStatus,
	FileDeletedEvent,
	FileRenamedEvent,
	SessionEndedEvent,
} from "@/types/collabTypes";
import { getSocket } from "@/store/socketManager";
import { useYjsSession } from "@/hooks/useYjsSession";

// Sub-components
import { SessionHeader } from "@/components/session/SessionHeader";
import { MembersSidebar } from "@/components/session/MembersSidebar";
import { FilesPanel } from "@/components/session/FilesPanel";
import { EditorArea } from "@/components/session/EditorArea";
import { NewFileDialog } from "@/components/session/NewFileDialog";
import { DeleteFileDialog } from "@/components/session/DeleteFileDialog";
import { RenameFileDialog } from "@/components/session/RenameFileDialog";
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

	// ── Auth & user ─────────────────────────────────────────────
	const token = useRootSelector((state) => state.auth.token);
	const { data: userData } = useGetUserQuery();
	const username = userData?.data.user.username ?? "";

	// ── Socket / session join ────────────────────────────────────
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
	const sessionId = sessionState?.session?.id;

	// ── File list ────────────────────────────────────────────────
	// sessionState.session.files is kept live by socket events
	// (file:created / file:deleted / file:renamed in collabApi).
	const files = sessionState?.session?.files ?? [];

	// ── Tab / editor UI state ────────────────────────────────────
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [openTabs, setOpenTabs] = useState<SessionFile[]>([]);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

	// ── Dialog state ─────────────────────────────────────────────
	const [newFileOpen, setNewFileOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<SessionFile | null>(null);
	const [renameTarget, setRenameTarget] = useState<SessionFile | null>(null);

	// ── Mutations ────────────────────────────────────────────────
	const [createFile, { isLoading: isCreatingFile }] = useCreateFileMutation();
	const [deleteFile] = useDeleteFileMutation();
	const [renameFile] = useRenameFileMutation();

	// Stabilise the onFileDirty callback with a ref so changes to setDirtyFiles
	// don't recreate the hook's memoized functions (which depend on it).
	const onFileDirtyRef = useRef((fileId: string) =>
		setDirtyFiles((prev) => new Set(prev).add(fileId))
	);

	// ── Yjs / Monaco collaboration ───────────────────────────────
	const {
		yDocsRef,
		editorRef,
		monacoRef,
		loadedFileIdsRef,
		activeFileIdRef,
		bindYjsToMonaco,
		initFileDoc,
		initNewFileDoc,
		destroyFileDoc,
		handleEditorMount,
		handleSave,
	} = useYjsSession(sessionId, (fileId) => onFileDirtyRef.current(fileId));

	// Keep the activeFileId ref in sync so Yjs closures always see the latest value
	useEffect(() => {
		activeFileIdRef.current = activeFileId;
	});

	// ── File open: initialize Yjs doc once per file ──────────────
	const { data: fileData } = useOpenFileQuery(
		{ sessionId: sessionId ?? "", fileId: activeFileId ?? "" },
		{ skip: !sessionId || !activeFileId }
	);

	useEffect(() => {
		if (!fileData || fileData.fileId !== activeFileId || !sessionId) return;
		if (!loadedFileIdsRef.current.has(activeFileId)) {
			loadedFileIdsRef.current.add(activeFileId);
			initFileDoc(activeFileId);
		}
	}, [
		fileData?.fileId,
		fileData?.content,
		activeFileId,
		sessionId,
		initFileDoc,
		loadedFileIdsRef,
	]);

	// Clear dirty flag when the server confirms a save
	useEffect(() => {
		if (fileData?.lastSavedAt && activeFileId) {
			setDirtyFiles((prev) => {
				const next = new Set(prev);
				next.delete(activeFileId);
				return next;
			});
		}
	}, [fileData?.lastSavedAt, activeFileId]);

	// ── Room-level socket events ─────────────────────────────────
	// These mutate tab state (openTabs, activeFileId) which belongs to this
	// component, so they stay here rather than inside useYjsSession.
	useEffect(() => {
		const socket = getSocket();
		if (!socket || !sessionId) return;

		const onFileDeleted = (event: FileDeletedEvent) => {
			const { fileId } = event;
			destroyFileDoc(fileId);
			setOpenTabs((prev) => {
				const remaining = prev.filter((t) => t.id !== fileId);
				setActiveFileId((current) => {
					if (current !== fileId) return current;
					const next = remaining[remaining.length - 1] ?? null;
					if (next?.id) setTimeout(() => bindYjsToMonaco(next.id), 0);
					return next?.id ?? null;
				});
				return remaining;
			});
			setDirtyFiles((prev) => {
				const next = new Set(prev);
				next.delete(fileId);
				return next;
			});
		};

		const onFileRenamed = (event: FileRenamedEvent) => {
			setOpenTabs((prev) =>
				prev.map((t) =>
					t.id === event.fileId
						? { ...t, filename: event.newFilename }
						: t
				)
			);
		};

		const onSessionEnded = (_event: SessionEndedEvent) => {
			navigate("/");
		};

		socket.on("file:deleted", onFileDeleted);
		socket.on("file:renamed", onFileRenamed);
		socket.on("session:ended", onSessionEnded);

		return () => {
			socket.off("file:deleted", onFileDeleted);
			socket.off("file:renamed", onFileRenamed);
			socket.off("session:ended", onSessionEnded);
		};
	}, [sessionId, navigate, destroyFileDoc, bindYjsToMonaco]);

	// ── Cursor decorations ───────────────────────────────────────
	const decorationIdsRef = useRef<string[]>([]);
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
			const { color } = user;
			const uid = user.userId.replace(/-/g, "");
			const glyphClass = `remote-cursor-glyph-${uid}`;

			// Inject (or update) per-user styles.
			// The glyph badge sits in the line-number gutter — it never moves
			// while the user is typing, so it doesn't hinder the editing experience.
			const styleId = `cursor-style-${user.userId}`;
			const initial = (user.username[0] ?? "?").toUpperCase();
			const styleContent = [
				// User-initial badge rendered in the glyph margin (gutter)
				`.${glyphClass} {`,
				`  display: flex; align-items: center; justify-content: center;`,
				`  width: 100%; height: 100%;`,
				`  background: ${color}; color: #fff;`,
				`  font-size: 9px; font-weight: 700; border-radius: 3px;`,
				`  cursor: default; user-select: none;`,
				`}`,
				// ::before trick used by Monaco to render glyphMarginClassName content
				`.${glyphClass}::before { content: "${initial}"; }`,
			].join(" ");

			let styleEl = document.getElementById(
				styleId
			) as HTMLStyleElement | null;
			if (!styleEl) {
				styleEl = document.createElement("style");
				styleEl.id = styleId;
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = styleContent;

			const line = Math.max(1, user.cursor.line);

			// User-initial badge in the glyph margin (stable — not affected by typing)
			newDecorations.push({
				range: new monaco.Range(line, 1, line, 1),
				options: {
					glyphMarginClassName: glyphClass,
					glyphMarginHoverMessage: { value: user.username },
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
	// editorRef and monacoRef are excluded from deps — they are refs with stable
	// identity; reading .current inside the effect is intentional and safe.

	// ── Early returns for non-connected states ───────────────────
	if (!token) return <Navigate to="/auth/login" replace />;

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

	// ── Tab handlers ─────────────────────────────────────────────
	function openFile(file: SessionFile) {
		if (
			file.id !== activeFileId &&
			yDocsRef.current[file.id] &&
			editorRef.current
		) {
			// Doc already loaded — re-bind after Monaco swaps the model
			setTimeout(() => bindYjsToMonaco(file.id), 0);
		}
		setActiveFileId(file.id);
		if (!openTabs.some((t) => t.id === file.id)) {
			setOpenTabs((prev) => [...prev, file]);
		}
	}

	function closeTab(fileId: string) {
		destroyFileDoc(fileId);
		setOpenTabs((prev) => prev.filter((t) => t.id !== fileId));
		setDirtyFiles((prev) => {
			const next = new Set(prev);
			next.delete(fileId);
			return next;
		});
		if (activeFileId === fileId) {
			const remaining = openTabs.filter((t) => t.id !== fileId);
			const next = remaining[remaining.length - 1] ?? null;
			setActiveFileId(next?.id ?? null);
			if (next?.id) setTimeout(() => bindYjsToMonaco(next.id), 0);
		}
	}

	// ── New file handler ─────────────────────────────────────────
	async function handleNewFile(filename: string): Promise<boolean> {
		if (!sessionId) return false;
		try {
			const result = await createFile({
				sessionId,
				filename,
				language: langFromFilename(filename),
			}).unwrap();

			const newFile: SessionFile = {
				id: result.data.file.id,
				filename: result.data.file.filename,
				language: result.data.file.language,
			};

			setOpenTabs((prev) => [...prev, newFile]);
			setActiveFileId(newFile.id);
			loadedFileIdsRef.current.add(newFile.id);
			initNewFileDoc(newFile.id);
			return true;
		} catch {
			return false;
		}
	}

	// ── Render ───────────────────────────────────────────────────
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
					onRenameClick={(file) => setRenameTarget(file)}
					onDeleteClick={(file) => setDeleteTarget(file)}
				/>

				<EditorArea
					openTabs={openTabs}
					activeFileId={activeFileId}
					dirtyFiles={dirtyFiles}
					onTabClick={openFile}
					onTabClose={closeTab}
					onNewFileClick={() => setNewFileOpen(true)}
					onSave={() => handleSave(activeFileId ?? "")}
					onEditorMount={handleEditorMount}
					lastSavedBy={fileData?.lastSavedBy ?? null}
					lastSavedAt={fileData?.lastSavedAt ?? null}
				/>
			</div>

			<NewFileDialog
				open={newFileOpen}
				onClose={() => setNewFileOpen(false)}
				onConfirm={handleNewFile}
				isCreating={isCreatingFile}
			/>

			<DeleteFileDialog
				open={deleteTarget !== null}
				filename={deleteTarget?.filename ?? ""}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => {
					if (!deleteTarget || !sessionId) return;
					void deleteFile({ sessionId, fileId: deleteTarget.id });
				}}
			/>

			<RenameFileDialog
				open={renameTarget !== null}
				currentFilename={renameTarget?.filename ?? ""}
				onClose={() => setRenameTarget(null)}
				onConfirm={async (newFilename) => {
					if (!renameTarget || !sessionId) return false;
					try {
						await renameFile({
							sessionId,
							fileId: renameTarget.id,
							newFilename,
						}).unwrap();
						return true;
					} catch {
						return false;
					}
				}}
			/>
		</div>
	);
}

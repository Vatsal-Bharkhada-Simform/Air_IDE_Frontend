import { useState, useRef, useEffect, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { OnMount } from "@monaco-editor/react";
import type * as MonacoType from "monaco-editor";

import {
	collabApi,
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
import type {
	EditorChanges,
	FileEditedEvent,
	TextSelection,
} from "@/types/collabTypes";
import { useRootSelector, useRootDispatch } from "@/store/store";
import type {
	SessionFile,
	SessionUser,
	SocketConnectionStatus,
} from "@/types/collabTypes";
import { getSocket } from "@/store/socketManager";
import { applyDeltaToModel } from "@/utils/applyEditorChanges";

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

/* ─── Pure helpers (outside component, no hooks) ─────────────── */

/**
 * Given a file:edit delta, shift every remote user's cursor / selection
 * that falls on or below the affected line range.
 *
 * @param users    - Current array of remote SessionUsers
 * @param changes  - The EditorChanges delta that was just applied
 * @returns        - New users array with corrected cursor / selection positions
 */
function shiftCursorsForEdit(
	users: SessionUser[],
	changes: EditorChanges
): SessionUser[] {
	const { from, to, text } = changes;
	const linesRemoved = to.line - from.line; // how many lines the range spans
	const linesAdded = text.length - 1; // how many newlines the replacement has
	const lineDelta = linesAdded - linesRemoved;

	// Same-line replacement — no line count change, cursor positions unaffected
	if (lineDelta === 0) return users;

	return users.map((u) => {
		const cursor = u.cursor;
		if (!cursor || cursor.line <= from.line + 1) {
			// Cursor is on or before the first affected line — no shift
			return u;
		}

		const shiftedLine = Math.max(from.line + 1, cursor.line + lineDelta);

		const shiftedSelection = u.selection
			? shiftSelection(u.selection, from.line, lineDelta)
			: null;

		return {
			...u,
			cursor: { ...cursor, line: shiftedLine },
			selection: shiftedSelection,
		};
	});
}

/**
 * Shift a TextSelection by `lineDelta` for lines that fall after `fromLine`.
 */
function shiftSelection(
	sel: TextSelection,
	fromLine: number,
	lineDelta: number
): TextSelection {
	return {
		startLine:
			sel.startLine > fromLine + 1
				? Math.max(fromLine + 1, sel.startLine + lineDelta)
				: sel.startLine,
		startColumn: sel.startColumn,
		endLine:
			sel.endLine > fromLine + 1
				? Math.max(fromLine + 1, sel.endLine + lineDelta)
				: sel.endLine,
		endColumn: sel.endColumn,
	};
}

/* ─── Session Room Page ───────────────────────────────────── */

export function SessionRoomPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();
	const dispatch = useRootDispatch();

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

	const pendingChangesRef = useRef<EditorChanges[]>([]);

	// Per-file last-received sequence number — used to detect & discard
	// duplicate or out-of-order deltas from the backend.
	const lastSeqRef = useRef<Record<string, number>>({});

	const MAX_WAIT_MS = 500;
	const DEBOUNCE_MS = 150;
	const batchStartRef = useRef<number | null>(null);
	// Disposable for the onDidChangeModelContent listener — cleaned up on re-mount
	const contentChangeDisposableRef = useRef<MonacoType.IDisposable | null>(
		null
	);

	/**
	 * Coalesce an array of granular EditorChanges into fewer, larger deltas
	 * to reduce socket payload size.  Handles:
	 *  1. Consecutive single-char INSERTS on the same line → merge text
	 *  2. Consecutive single-char BACKSPACES on the same line → widen range
	 *  3. Everything else → pass through as-is
	 */
	function coalesceChanges(changes: EditorChanges[]): EditorChanges[] {
		const merged: EditorChanges[] = [];
		for (const change of changes) {
			const last = merged[merged.length - 1];

			// ── Detect change types ──────────────────────────
			const isInsert =
				change.from.line === change.to.line &&
				change.from.ch === change.to.ch &&
				change.text.length === 1 &&
				change.text[0].length === 1;

			const isBackspace =
				change.text.length === 1 &&
				change.text[0] === "" &&
				change.from.line === change.to.line &&
				change.to.ch - change.from.ch === 1;

			// ── Try to merge with the previous change ─────────
			if (last) {
				const lastIsInsert =
					last.from.line === last.to.line &&
					last.from.ch === last.to.ch &&
					last.text.length === 1;

				const lastIsBackspace =
					last.text.length === 1 && last.text[0] === "";

				// Merge consecutive single-char inserts on the same line
				if (
					isInsert &&
					lastIsInsert &&
					change.from.line === last.from.line &&
					change.from.ch === last.from.ch + last.text[0].length
				) {
					last.text[0] += change.text[0];
					continue;
				}

				// Merge consecutive single-char backspaces on the same line
				// Backspace moves the cursor left, so the new `from` sits
				// one char before the previous `from`.
				if (
					isBackspace &&
					lastIsBackspace &&
					change.from.line === last.from.line &&
					change.to.ch === last.from.ch
				) {
					last.from = { ...change.from };
					continue;
				}
			}

			// No merge possible — push as a new entry
			merged.push({
				from: { ...change.from },
				to: { ...change.to },
				text: [...change.text],
			});
		}

		return merged;
	}

	function flushChanges() {
		if (editDebounceRef.current) clearTimeout(editDebounceRef.current);
		editDebounceRef.current = null;
		batchStartRef.current = null;

		const batch = coalesceChanges(pendingChangesRef.current);
		pendingChangesRef.current = [];

		const sid = sessionIdRef.current;
		const fid = activeFileIdRef.current;
		if (batch.length === 0 || !sid || !fid) return;
		void editFile({ sessionId: sid, fileId: fid, changes: batch });
	}

	// ── Remote edit listener ─────────────────────────────────
	// Listens for file:edited directly on the socket (NOT through RTK cache)
	// so we can apply deltas via editor.executeEdits(), which is incremental
	// and preserves the undo stack and cursor — unlike setting the value prop.
	useEffect(() => {
		const socket = getSocket(); // null until connectSocket() is called by useJoinSessionQuery
		if (!socket || !activeFileId || !sessionId) return;

		const onEdited = (event: FileEditedEvent) => {
			if (event.fileId !== activeFileId) return;

			// ── Sequence-number guard ──────────────────────────
			// Discard deltas that are older than what we've already applied.
			// Socket.IO guarantees FIFO per connection so this is mainly a
			// safety net for reconnect replays or batching edge-cases.
			const lastSeq = lastSeqRef.current[activeFileId] ?? 0;
			if (event.seq <= lastSeq) return;
			lastSeqRef.current[activeFileId] = event.seq;

			const editor = editorRef.current;
			if (!editor) return;

			const model = editor.getModel();
			if (!model) return;

			// ── Apply delta directly to Monaco model ───────────
			// Mark as remote so handleContentChange won't re-broadcast it.
			isRemoteEditRef.current = true;
			applyDeltaToModel(model, event.changes);

			// ── Sync fileContents mirror ───────────────────────
			// Keep our per-file content map in sync so tab-switch restores
			// and Ctrl+S always have the latest content.
			const updatedContent = model.getValue();
			setFileContents((prev) => ({
				...prev,
				[activeFileId]: updatedContent,
			}));

			// ── Shift remote cursors for line-count changes ────
			// Apply the shift for each delta in the batch sequentially.
			dispatch(
				collabApi.util.updateQueryData(
					"joinSession",
					{ inviteCode: roomId ?? "", token: token ?? "" },
					(draft) => {
						for (const change of event.changes) {
							draft.users = shiftCursorsForEdit(
								draft.users,
								change
							);
						}
					}
				)
			);
		};

		socket.on("file:edited", onEdited);
		return () => {
			socket.off("file:edited", onEdited);
		};
	}, [activeFileId, sessionId, connectionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

	// File content sync:
	//   - First delivery (loadedFileIdRef ≠ activeFileId): initialise the slot in fileContents
	//     ONLY if it doesn't already hold local edits (checked via fileContentsRef).
	//   - Subsequent changes while the same file is active = remote edit from another user.
	//   NOTE: After this change, the useEffect for remote edits above handles live deltas.
	//         This effect only seeds the initial content and no longer applies deltas.
	useEffect(() => {
		if (
			!fileData ||
			fileData.fileId !== activeFileId ||
			fileData.content === undefined
		)
			return;

		// Only seed from socket on first open. Live deltas are now handled
		// by the direct file:edited socket listener that calls applyDeltaToModel().
		if (loadedFileIdRef.current !== activeFileId) {
			loadedFileIdRef.current = activeFileId;
			if (!(activeFileId in fileContentsRef.current)) {
				setFileContents((prev) => ({
					...prev,
					[activeFileId]: fileData.content,
				}));
			}
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

	// Monaco mount handler — registers Ctrl+S, cursor/selection events,
	// AND the onDidChangeModelContent listener that captures edit deltas.
	const handleEditorMount = useCallback<OnMount>(
		(editor, monaco) => {
			// Store instances for the decoration effect
			editorRef.current = editor;
			monacoRef.current = monaco as unknown as typeof MonacoType;

			// Ctrl+S — delegates to ref so it's never stale
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () =>
				handleSaveRef.current()
			);

			// ── Content change listener ─────────────────────────
			// This is the primary mechanism for capturing edit deltas.
			// We use onDidChangeModelContent (on the editor instance) instead
			// of the <Editor onChange> prop so we get access to the structured
			// `changes[]` array with exact ranges and text for every atomic
			// edit — insertions, deletions, replacements, pastes, etc.
			if (contentChangeDisposableRef.current) {
				contentChangeDisposableRef.current.dispose();
			}
			contentChangeDisposableRef.current = editor.onDidChangeModelContent(
				(ev) => {
					// Skip remote edits — they were applied by applyDeltaToModel()
					// and must not be re-broadcast back through the socket.
					if (isRemoteEditRef.current) return;

					// Map Monaco's 1-based IModelContentChange[] → our 0-based EditorChanges[]
					for (const change of ev.changes) {
						const mapped: EditorChanges = {
							from: {
								line: change.range.startLineNumber - 1,
								ch: change.range.startColumn - 1,
							},
							to: {
								line: change.range.endLineNumber - 1,
								ch: change.range.endColumn - 1,
							},
							text: change.text.split("\n"),
						};
						pendingChangesRef.current.push(mapped);
					}

					// Debounce + max-wait flush scheduling
					if (!batchStartRef.current)
						batchStartRef.current = Date.now();
					if (editDebounceRef.current)
						clearTimeout(editDebounceRef.current);

					if (Date.now() - batchStartRef.current >= MAX_WAIT_MS) {
						flushChanges();
					} else {
						editDebounceRef.current = setTimeout(
							flushChanges,
							DEBOUNCE_MS
						);
					}
				}
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

	// Local-state-only handler — socket emission is handled by the
	// onDidChangeModelContent listener registered in handleEditorMount.
	function handleContentChange(value: string | undefined) {
		if (isRemoteEditRef.current) {
			isRemoteEditRef.current = false;
			return;
		}

		if (activeFileId) {
			setFileContents((prev) => ({
				...prev,
				[activeFileId]: value ?? "",
			}));
			setDirtyFiles((prev) => new Set(prev).add(activeFileId));
		}
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

/**
 * useYjsSession
 *
 * Encapsulates the Yjs / Monaco collaboration lifecycle for a session:
 *   - Per-file Y.Doc creation with _synced gate (prevents empty-state broadcasts)
 *   - MonacoBinding attachment, deferred until sync-response applies content
 *   - Yjs update broadcast to peers and remote update application
 *   - sync-request / sync-response round-trip on file open and reconnect
 *   - Editor mount: Ctrl+S shortcut, debounced cursor/selection broadcast
 *
 * Room-level events (file:deleted, file:renamed, session:ended) are intentionally
 * left in SessionRoomPage because they mutate tab state (openTabs, activeFileId)
 * that belongs to the page, not to the Yjs layer.
 */

import { useRef, useEffect, useCallback } from "react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type * as MonacoType from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import { getSocket } from "@/store/socketManager";
import {
	useMoveCursorMutation,
	useSelectTextMutation,
	useSaveFileMutation,
} from "@/store/api/collabApi";

// ─── Public interface ──────────────────────────────────────────────────────────

export interface UseYjsSessionReturn {
	/** All open Y.Docs, keyed by fileId */
	yDocsRef: React.MutableRefObject<Record<string, Y.Doc>>;
	/** All active MonacoBindings, keyed by fileId */
	yBindingsRef: React.MutableRefObject<Record<string, MonacoBinding>>;
	/** The Monaco editor instance (set on mount) */
	editorRef: React.MutableRefObject<MonacoType.editor.IStandaloneCodeEditor | null>;
	/** The Monaco namespace (set on mount) */
	monacoRef: React.MutableRefObject<typeof MonacoType | null>;
	/** Tracks which fileIds have already been initialized */
	loadedFileIdsRef: React.MutableRefObject<Set<string>>;
	/** Always holds the current activeFileId — safe to read from closures */
	activeFileIdRef: React.MutableRefObject<string | null>;

	/**
	 * Bind a Y.Doc to the Monaco editor model.
	 * Called automatically on sync-response. Also exposed for the
	 * editor-mount flow and file-switch (when the doc already exists).
	 */
	bindYjsToMonaco: (fileId: string) => void;

	/**
	 * Initialize a Y.Doc for an existing file.
	 * Emits sync-request; bindYjsToMonaco fires automatically on sync-response.
	 */
	initFileDoc: (fileId: string) => void;

	/**
	 * Initialize a Y.Doc for a brand-new file (no server state to sync).
	 * Marks the doc as synced immediately and binds Monaco on the next frame.
	 */
	initNewFileDoc: (fileId: string) => void;

	/**
	 * Destroy a Y.Doc and its MonacoBinding (called when closing a tab).
	 */
	destroyFileDoc: (fileId: string) => void;

	/** onMount callback to pass to <Editor> */
	handleEditorMount: OnMount;

	/** Save the current Yjs content for a file to the server */
	handleSave: (fileId: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useYjsSession(
	sessionId: string | undefined,
	/** Called whenever a local edit happens (to mark the file as dirty) */
	onFileDirty: (fileId: string) => void
): UseYjsSessionReturn {
	// ── Mutations ──────────────────────────────────────────────────────────────
	const [saveFile] = useSaveFileMutation();
	const [moveCursor] = useMoveCursorMutation();
	const [selectText] = useSelectTextMutation();

	// Stable refs so editor listeners (registered once on mount) always
	// call the latest mutation instance without triggering re-mounts.
	const moveCursorRef = useRef(moveCursor);
	const selectTextRef = useRef(selectText);
	useEffect(() => {
		moveCursorRef.current = moveCursor;
		selectTextRef.current = selectText;
	});

	// ── Yjs / Monaco refs ──────────────────────────────────────────────────────
	const yDocsRef = useRef<Record<string, Y.Doc>>({});
	const yBindingsRef = useRef<Record<string, MonacoBinding>>({});
	const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(
		null
	);
	const monacoRef = useRef<typeof MonacoType | null>(null);
	const loadedFileIdsRef = useRef<Set<string>>(new Set());
	const sessionIdRef = useRef(sessionId);
	const activeFileIdRef = useRef<string | null>(null);

	useEffect(() => {
		sessionIdRef.current = sessionId;
	});

	// ── bindYjsToMonaco ────────────────────────────────────────────────────────
	const bindYjsToMonaco = useCallback((fileId: string) => {
		const editor = editorRef.current;
		const doc = yDocsRef.current[fileId];
		if (!editor || !doc) return;

		// Destroy any stale binding before creating a fresh one
		yBindingsRef.current[fileId]?.destroy();

		const model = editor.getModel();
		if (!model) return;

		yBindingsRef.current[fileId] = new MonacoBinding(
			doc.getText("content"),
			model,
			new Set([editor]),
			null
		);
	}, []);

	// ── Shared update listener factory ─────────────────────────────────────────
	// Attach the Yjs update listener that broadcasts local edits to peers.
	// Skips remote-origin updates and pre-sync updates (empty doc guard).
	const attachUpdateListener = useCallback(
		(doc: Y.Doc, fileId: string) => {
			doc.on("update", (update: Uint8Array, origin: unknown) => {
				if (origin !== "remote" && (doc as any)._synced) {
					getSocket()?.emit("update", {
						sessionId: sessionIdRef.current,
						fileId,
						update: Array.from(update),
					});
					onFileDirty(fileId);
				}
			});
		},
		[onFileDirty]
	);

	// ── initFileDoc ────────────────────────────────────────────────────────────
	const initFileDoc = useCallback(
		(fileId: string) => {
			if (yDocsRef.current[fileId]) return; // guard against double-init

			const doc = new Y.Doc();
			// _synced = false: suppress broadcasts until sync-response delivers content.
			(doc as any)._synced = false;
			yDocsRef.current[fileId] = doc;
			attachUpdateListener(doc, fileId);

			if (getSocket()?.connected) {
				getSocket()?.emit("sync-request", {
					sessionId: sessionIdRef.current,
					fileId,
					stateVector: Array.from(Y.encodeStateVector(doc)),
				});
			} else if (editorRef.current) {
				// Socket not yet connected — bind immediately; onConnect will re-sync.
				(doc as any)._synced = true;
				bindYjsToMonaco(fileId);
			}
		},
		[attachUpdateListener, bindYjsToMonaco]
	);

	// ── initNewFileDoc ─────────────────────────────────────────────────────────
	const initNewFileDoc = useCallback(
		(fileId: string) => {
			const doc = new Y.Doc();
			(doc as any)._synced = true; // new file — nothing to sync
			yDocsRef.current[fileId] = doc;
			attachUpdateListener(doc, fileId);
			// Defer binding so Monaco's model path has updated to the new file
			setTimeout(() => bindYjsToMonaco(fileId), 0);
		},
		[attachUpdateListener, bindYjsToMonaco]
	);

	// ── destroyFileDoc ─────────────────────────────────────────────────────────
	const destroyFileDoc = useCallback((fileId: string) => {
		yBindingsRef.current[fileId]?.destroy();
		delete yBindingsRef.current[fileId];
		yDocsRef.current[fileId]?.destroy();
		delete yDocsRef.current[fileId];
		loadedFileIdsRef.current.delete(fileId);
	}, []);

	// ── Yjs socket listeners ───────────────────────────────────────────────────
	useEffect(() => {
		const socket = getSocket();
		if (!socket || !sessionId) return;

		const onUpdate = (event: { fileId: string; update: number[] }) => {
			const doc = yDocsRef.current[event.fileId];
			if (doc) Y.applyUpdate(doc, new Uint8Array(event.update), "remote");
		};

		const onSyncResponse = (event: {
			fileId: string;
			update: number[];
		}) => {
			const doc = yDocsRef.current[event.fileId];
			if (!doc) return;
			Y.applyUpdate(doc, new Uint8Array(event.update), "remote");
			// Safe to bind Monaco now — the doc has real content, so the binding's
			// initialization update won't broadcast an empty state to peers.
			if (!(doc as any)._synced) {
				(doc as any)._synced = true;
				setTimeout(() => bindYjsToMonaco(event.fileId), 0);
			}
		};

		const onConnect = () => {
			const fid = activeFileIdRef.current;
			const doc = fid ? yDocsRef.current[fid] : null;
			if (!fid || !doc) return;
			socket.emit("sync-request", {
				sessionId: sessionIdRef.current,
				fileId: fid,
				stateVector: Array.from(Y.encodeStateVector(doc)),
			});
		};

		socket.on("update", onUpdate);
		socket.on("sync-response", onSyncResponse);
		socket.on("connect", onConnect);

		return () => {
			socket.off("update", onUpdate);
			socket.off("sync-response", onSyncResponse);
			socket.off("connect", onConnect);
		};
	}, [sessionId, bindYjsToMonaco]);

	// ── handleSave ─────────────────────────────────────────────────────────────
	const handleSave = useCallback(
		(fileId: string) => {
			if (!sessionId || !fileId) return;
			const doc = yDocsRef.current[fileId];
			if (!doc) return;
			void saveFile({
				sessionId,
				fileId,
				content: doc.getText("content").toString(),
			});
		},
		[sessionId, saveFile]
	);

	// ── handleEditorMount ──────────────────────────────────────────────────────
	const handleEditorMount: OnMount = useCallback(
		(editor, monaco) => {
			editorRef.current = editor;
			monacoRef.current = monaco as unknown as typeof MonacoType;

			// Ctrl+S / Cmd+S
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () =>
				handleSave(activeFileIdRef.current ?? "")
			);

			// If a file was already active when the editor mounted, bind immediately
			const fid = activeFileIdRef.current;
			if (fid && yDocsRef.current[fid]) {
				bindYjsToMonaco(fid);
			}

			// Debounced cursor position broadcast
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

			// Debounced text selection broadcast
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
		[bindYjsToMonaco, handleSave]
	);

	return {
		yDocsRef,
		yBindingsRef,
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
	};
}

import { rootApi } from "./api";
import { connectSocket, getSocket } from "../socketManager";
import type {
	CursorMovedEvent,
	CursorSelectedEvent,
	EditFileArgs,
	FileSavedEvent,
	JoinSessionArgs,
	JoinSessionResult,
	MoveCursorArgs,
	OpenFileArgs,
	OpenFileResult,
	SaveFileArgs,
	SelectTextArgs,
	SessionUser,
	SocketErrorEvent,
	SessionMembershipEvent,
	FileCreatedEvent,
	FileDeletedEvent,
	FileRenamedEvent,
	SessionEndedEvent,
} from "../../types/collabTypes";

export interface DeleteFileArgs {
	sessionId: string;
	fileId: string;
}

export interface RenameFileArgs {
	sessionId: string;
	fileId: string;
	newFilename: string;
}

export const collabApi = rootApi.injectEndpoints({
	endpoints: (builder) => ({
		// Joins a session room and keeps active users, cursors, and connection status in sync for the page's lifetime
		joinSession: builder.query<JoinSessionResult, JoinSessionArgs>({
			// Remove the cache entry (and run onCacheEntryAdded cleanup) the
			// moment SessionRoomPage unmounts rather than after the default 60 s.
			// Without this, session:leave is not emitted until the socket times
			// out, so other users never see the member leave.
			keepUnusedDataFor: 0,
			queryFn: () => ({
				data: {
					session: null,
					users: [],
					connectionStatus: "idle",
					error: null,
				},
			}),
			async onCacheEntryAdded(
				{ inviteCode, token },
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved }
			) {
				try {
					await cacheDataLoaded;
				} catch {
					return;
				}

				const socket = connectSocket(token);
				let sessionId: string | undefined;

				const onConnect = () => {
					updateCachedData((draft) => {
						draft.connectionStatus = "connected";
					});
					socket.emit("session:join", { inviteCode });
				};

				const onConnectError = (err: Error) => {
					updateCachedData((draft) => {
						draft.connectionStatus = "error";
						draft.error = err.message;
					});
				};

				const onDisconnect = () => {
					updateCachedData((draft) => {
						draft.connectionStatus = "disconnected";
					});
				};

				const onJoined = (payload: {
					session: JoinSessionResult["session"];
					users: SessionUser[];
				}) => {
					sessionId = payload.session?.id;
					updateCachedData((draft) => {
						draft.session = payload.session;
						draft.users = payload.users;
					});
				};

				const onMembership = (event: SessionMembershipEvent) => {
					updateCachedData((draft) => {
						draft.users = event.users;
					});
				};

				const onCursorMoved = (event: CursorMovedEvent) => {
					updateCachedData((draft) => {
						const user = draft.users.find(
							(u) => u.userId === event.userId
						);
						if (user) {
							user.cursor = {
								fileId: event.fileId,
								line: event.line,
								column: event.column,
							};
							user.selection = null;
						}
					});
				};

				const onCursorSelected = (event: CursorSelectedEvent) => {
					updateCachedData((draft) => {
						const user = draft.users.find(
							(u) => u.userId === event.userId
						);
						if (user) {
							user.cursor.fileId = event.fileId;
							user.selection = event.selection;
						}
					});
				};

				const onError = (event: SocketErrorEvent) => {
					updateCachedData((draft) => {
						draft.error = event.message;
					});
				};

				const onFileCreated = (event: FileCreatedEvent) => {
					updateCachedData((draft) => {
						if (draft.session) {
							// Avoid duplicates if the creating user also receives this
							if (
								!draft.session.files.some(
									(f) => f.id === event.file.id
								)
							) {
								draft.session.files.push(event.file);
							}
						}
					});
				};

				const onFileDeleted = (event: FileDeletedEvent) => {
					updateCachedData((draft) => {
						if (draft.session) {
							draft.session.files = draft.session.files.filter(
								(f) => f.id !== event.fileId
							);
						}
					});
				};

				const onFileRenamed = (event: FileRenamedEvent) => {
					updateCachedData((draft) => {
						if (draft.session) {
							const file = draft.session.files.find(
								(f) => f.id === event.fileId
							);
							if (file) file.filename = event.newFilename;
						}
					});
				};

				const onSessionEnded = (_event: SessionEndedEvent) => {
					updateCachedData((draft) => {
						draft.connectionStatus = "disconnected";
					});
				};

				socket.on("connect", onConnect);
				socket.on("connect_error", onConnectError);
				socket.on("disconnect", onDisconnect);
				socket.on("session:joined", onJoined);
				socket.on("session:membership", onMembership);
				socket.on("session:ended", onSessionEnded);
				socket.on("file:created", onFileCreated);
				socket.on("file:deleted", onFileDeleted);
				socket.on("file:renamed", onFileRenamed);
				socket.on("cursor:moved", onCursorMoved);
				socket.on("cursor:selected", onCursorSelected);
				socket.on("error", onError);

				if (socket.connected) {
					onConnect();
				} else {
					updateCachedData((draft) => {
						draft.connectionStatus = "connecting";
					});
				}

				await cacheEntryRemoved;

				if (sessionId) {
					socket.emit("session:leave", { sessionId });
				}

				socket.off("connect", onConnect);
				socket.off("connect_error", onConnectError);
				socket.off("disconnect", onDisconnect);
				socket.off("session:joined", onJoined);
				socket.off("session:membership", onMembership);
				socket.off("session:ended", onSessionEnded);
				socket.off("file:created", onFileCreated);
				socket.off("file:deleted", onFileDeleted);
				socket.off("file:renamed", onFileRenamed);
				socket.off("cursor:moved", onCursorMoved);
				socket.off("cursor:selected", onCursorSelected);
				socket.off("error", onError);
			},
		}),

		// Opens a file and keeps its content synced with remote edits and save confirmations
		openFile: builder.query<OpenFileResult, OpenFileArgs>({
			queryFn: () => ({
				data: {
					fileId: "",
					filename: "",
					content: "",
					language: "",
					lastSavedBy: null,
					lastSavedAt: null,
				},
			}),
			async onCacheEntryAdded(
				{ sessionId, fileId },
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved }
			) {
				try {
					await cacheDataLoaded;
				} catch {
					return;
				}

				const socket = getSocket();
				if (!socket) return;

				const onContent = (payload: {
					fileId: string;
					filename: string;
					content: string;
					language: string;
				}) => {
					if (payload.fileId !== fileId) return;
					updateCachedData((draft) => {
						draft.fileId = payload.fileId;
						draft.filename = payload.filename;
						draft.content = payload.content;
						draft.language = payload.language;
					});
				};

				// file:edited is intentionally NOT handled here.
				// Remote deltas are applied directly to the Monaco model in
				// SessionRoomPage via applyDeltaToModel(), which preserves the
				// undo stack and avoids a full model reset that setting the
				// `value` prop would cause.

				const onSaved = (event: FileSavedEvent) => {
					if (event.fileId !== fileId) return;
					updateCachedData((draft) => {
						draft.lastSavedBy = event.savedBy;
						draft.lastSavedAt = event.savedAt;
					});
				};

				socket.on("file:content", onContent);
				socket.on("file:saved", onSaved);

				socket.emit("file:open", { sessionId, fileId });

				await cacheEntryRemoved;

				socket.off("file:content", onContent);
				socket.off("file:saved", onSaved);
			},
		}),

		// Broadcasts a local text change to collaborators without persisting it
		editFile: builder.mutation<null, EditFileArgs>({
			queryFn: ({ sessionId, fileId, changes }) => {
				// Server's `update` handler destructures { update }, not { changes }.
				getSocket()?.emit("update", {
					sessionId,
					fileId,
					update: changes,
				});
				return { data: null };
			},
		}),

		// Persists file content to the database and notifies all collaborators
		saveFile: builder.mutation<null, SaveFileArgs>({
			queryFn: ({ sessionId, fileId, content }) => {
				getSocket()?.emit("file:save", { sessionId, fileId, content });
				return { data: null };
			},
		}),

		// Broadcasts the local user's cursor position to collaborators
		moveCursor: builder.mutation<null, MoveCursorArgs>({
			queryFn: ({ sessionId, fileId, line, column }) => {
				getSocket()?.emit("cursor:move", {
					sessionId,
					fileId,
					line,
					column,
				});
				return { data: null };
			},
		}),

		// Broadcasts the local user's text selection to collaborators
		selectText: builder.mutation<null, SelectTextArgs>({
			queryFn: ({ sessionId, fileId, selection }) => {
				getSocket()?.emit("cursor:select", {
					sessionId,
					fileId,
					selection,
				});
				return { data: null };
			},
		}),

		// Sends file:delete to the server; all peers receive file:deleted
		deleteFile: builder.mutation<null, DeleteFileArgs>({
			queryFn: ({ sessionId, fileId }) => {
				getSocket()?.emit("file:delete", { sessionId, fileId });
				return { data: null };
			},
		}),

		// Sends file:rename to the server; all peers receive file:renamed
		renameFile: builder.mutation<null, RenameFileArgs>({
			queryFn: ({ sessionId, fileId, newFilename }) => {
				getSocket()?.emit("file:rename", {
					sessionId,
					fileId,
					newFilename,
				});
				return { data: null };
			},
		}),
	}),
});

export const {
	useJoinSessionQuery,
	useOpenFileQuery,
	useEditFileMutation,
	useSaveFileMutation,
	useMoveCursorMutation,
	useSelectTextMutation,
	useDeleteFileMutation,
	useRenameFileMutation,
} = collabApi;

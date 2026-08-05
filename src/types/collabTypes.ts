export interface SessionFile {
	id: string;
	filename: string;
	language: string;
}

export interface SessionCreator {
	id: string;
	username: string;
}

export interface SessionDetails {
	id: string;
	name: string;
	inviteCode: string;
	creator: SessionCreator;
	files: SessionFile[];
}

export interface CursorPosition {
	fileId: string | null;
	line: number;
	column: number;
}

export interface TextSelection {
	startLine: number;
	startColumn: number;
	endLine: number;
	endColumn: number;
}

export interface SessionUser {
	userId: string;
	username: string;
	avatarSeed: string | null;
	color: string;
	cursor: CursorPosition;
	selection: TextSelection | null;
}

export type SocketConnectionStatus =
	"idle" | "connecting" | "connected" | "disconnected" | "error";

export interface JoinSessionArgs {
	inviteCode: string;
	token: string;
}

export interface JoinSessionResult {
	session: SessionDetails | null;
	users: SessionUser[];
	connectionStatus: SocketConnectionStatus;
	error: string | null;
}

export interface OpenFileArgs {
	sessionId: string;
	fileId: string;
}

export interface OpenFileResult {
	fileId: string;
	filename: string;
	content: string;
	language: string;
	lastSavedBy: string | null;
	lastSavedAt: string | null;
}

export interface EditorChanges {
	from: { line: number; ch: number };
	to: { line: number; ch: number };
	text: string[];
}

export interface FileEditedEvent {
	fileId: string;
	changes: EditorChanges[]; // array — all deltas from one debounced batch
	userId: string;
	username: string;
	seq: number; // monotonic per-file counter stamped by the backend
}

export interface FileSavedEvent {
	fileId: string;
	savedBy: string;
	savedAt: string;
}

export interface EditFileArgs {
	sessionId: string;
	fileId: string;
	changes: EditorChanges[]; // full batch of deltas, sent in one socket emission
}

export interface SaveFileArgs {
	sessionId: string;
	fileId: string;
	content: string;
}

export interface MoveCursorArgs {
	sessionId: string;
	fileId: string;
	line: number;
	column: number;
}

export interface SelectTextArgs {
	sessionId: string;
	fileId: string;
	selection: TextSelection;
}

export interface CursorMovedEvent {
	userId: string;
	username: string;
	color: string;
	fileId: string;
	line: number;
	column: number;
}

export interface CursorSelectedEvent {
	userId: string;
	username: string;
	color: string;
	fileId: string;
	selection: TextSelection;
}

export interface SocketErrorEvent {
	message: string;
}

// ── New consolidated / added events ────────────────────────────

/**
 * Replaces session:user-joined, session:user-left, and session:users.
 * The `users` field always contains the full, up-to-date presence list.
 * The `actor` field identifies who joined or left (absent for full-sync)
 */
export interface SessionMembershipEvent {
	type: "joined" | "left" | "full-sync";
	users: SessionUser[];
	actor?: {
		userId: string;
		username: string;
		color: string;
	};
}

/** Emitted to all users when a file is created via REST. */
export interface FileCreatedEvent {
	file: SessionFile;
	createdBy: string;
}

/** Emitted to all users when a file is deleted. */
export interface FileDeletedEvent {
	fileId: string;
	deletedBy: string;
}

/** Emitted to all users when a file is renamed. */
export interface FileRenamedEvent {
	fileId: string;
	newFilename: string;
	renamedBy: string;
}

/** Emitted to all users when the session creator ends the session. */
export interface SessionEndedEvent {
	sessionId: string;
	endedBy: string;
}

export interface SessionData {
	id: string;
	name: string;
	inviteCode: string;
	createdBy: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	creator: SessionCreator;
}

export interface SessionDataWithCounts extends SessionData {
	_count: { files: number; participants: number };
}

export interface SessionDataWithFiles extends SessionData {
	files: (SessionFile & { updatedAt: string })[];
}

export interface CreateSessionRequest {
	name: string;
}

export interface CreateSessionResponse {
	success: boolean;
	message: string;
	data: {
		session: SessionData;
	};
}

export interface ListSessionsResponse {
	success: boolean;
	data: {
		sessions: SessionDataWithCounts[];
	};
}

export interface GetSessionResponse {
	success: boolean;
	data: {
		session: SessionDataWithFiles;
	};
}

export interface CreateFileRequest {
	sessionId: string;
	filename: string;
	language?: string;
	content?: string;
}

export interface CreateFileResponse {
	success: boolean;
	message: string;
	data: {
		file: SessionFile & {
			sessionId: string;
			content: string;
			createdAt: string;
			updatedAt: string;
		};
	};
}

export interface ListFilesResponse {
	success: boolean;
	data: {
		files: (SessionFile & {
			createdAt: string;
			updatedAt: string;
		})[];
	};
}

// ── New endpoint types ─────────────────────────────────────────

/** Full file record including content — returned by GET /sessions/:id/files/:fileId */
export interface SessionFileWithContent extends SessionFile {
	sessionId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

// PATCH /sessions/:id/status
export interface UpdateSessionStatusRequest {
	id: string;
	isActive: boolean;
}

export interface UpdateSessionStatusResponse {
	success: boolean;
	message: string;
	data: { session: SessionData };
}

// GET /sessions/:id/participants
export interface SessionParticipant {
	id: string;
	userId: string;
	joinedAt: string;
	leftAt: string | null;
	user: { id: string; username: string };
}

export interface ListParticipantsResponse {
	success: boolean;
	data: { participants: SessionParticipant[] };
}

// GET /sessions/:id/files/:fileId
export interface GetFileRequest {
	sessionId: string;
	fileId: string;
}

export interface GetFileResponse {
	success: boolean;
	data: { file: SessionFileWithContent };
}

// PATCH /sessions/:id/files/:fileId/rename
export interface RenameFileRequest {
	sessionId: string;
	fileId: string;
	newFilename: string;
}

export interface RenameFileResponse {
	success: boolean;
	message: string;
	data: { file: SessionFileWithContent };
}

// DELETE /sessions/:id/files/:fileId
export interface DeleteFileRequest {
	sessionId: string;
	fileId: string;
}

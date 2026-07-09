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

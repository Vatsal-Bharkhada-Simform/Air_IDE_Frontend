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
	changes: EditorChanges;
	userId: string;
	username: string;
}

export interface FileSavedEvent {
	fileId: string;
	savedBy: string;
	savedAt: string;
}

export interface EditFileArgs {
	sessionId: string;
	fileId: string;
	changes: EditorChanges;
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

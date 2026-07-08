import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Editor from "@monaco-editor/react";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Circle,
	FilePlus,
	Loader2,
	MoreHorizontal,
	Save,
	Users,
	Wifi,
	WifiOff,
	X,
	Zap,
	FileCode,
	Clock,
	Copy,
	Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
	SessionFile,
	SessionUser,
	SocketConnectionStatus,
} from "@/types/collabTypes";

/* ─── Mock/placeholder data (swapped for real hooks when logic lands) ── */

const MOCK_SESSION_NAME = "Backend Refactor Sprint";
const MOCK_INVITE_CODE = "XK9M2P";

const MOCK_FILES: SessionFile[] = [
	{ id: "f1", filename: "index.ts", language: "typescript" },
	{ id: "f2", filename: "server.ts", language: "typescript" },
	{ id: "f3", filename: "routes.ts", language: "typescript" },
];

const MOCK_USERS: SessionUser[] = [
	{
		userId: "u1",
		username: "vatsal",
		color: "#6366f1",
		cursor: { fileId: "f1", line: 12, column: 4 },
		selection: null,
	},
	{
		userId: "u2",
		username: "alex",
		color: "#10b981",
		cursor: { fileId: "f1", line: 25, column: 8 },
		selection: null,
	},
	{
		userId: "u3",
		username: "jordan",
		color: "#f59e0b",
		cursor: { fileId: "f2", line: 3, column: 0 },
		selection: null,
	},
];

const MOCK_STARTER_CONTENT: Record<string, string> = {
	f1: `// index.ts
import express from "express";
import { router } from "./routes";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
	f2: `// server.ts
import { createServer } from "http";
import { Server } from "socket.io";

export function createSocketServer(app: any) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });

  return httpServer;
}
`,
	f3: `// routes.ts
import { Router } from "express";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
`,
};

/* ─── Helpers ─────────────────────────────────────────────── */

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/** Map a language string to a Monaco language ID */
function toMonacoLang(lang: string): string {
	const map: Record<string, string> = {
		typescript: "typescript",
		javascript: "javascript",
		python: "python",
		go: "go",
		rust: "rust",
		css: "css",
		html: "html",
		json: "json",
		markdown: "markdown",
	};
	return map[lang.toLowerCase()] ?? "plaintext";
}

/** Derive language from filename extension when not provided */
function langFromFilename(filename: string): string {
	const ext = filename.split(".").pop()?.toLowerCase() ?? "";
	const map: Record<string, string> = {
		ts: "typescript",
		tsx: "typescript",
		js: "javascript",
		jsx: "javascript",
		py: "python",
		go: "go",
		rs: "rust",
		css: "css",
		html: "html",
		json: "json",
		md: "markdown",
	};
	return map[ext] ?? "plaintext";
}

/* ─── Connection Status Chip ──────────────────────────────── */

function ConnectionChip({ status }: { status: SocketConnectionStatus }) {
	const config = {
		idle: { label: "Idle", icon: Circle, cls: "text-muted-foreground" },
		connecting: {
			label: "Connecting…",
			icon: Loader2,
			cls: "text-amber-500 animate-spin",
		},
		connected: { label: "Live", icon: Wifi, cls: "text-emerald-500" },
		disconnected: {
			label: "Disconnected",
			icon: WifiOff,
			cls: "text-red-500",
		},
		error: { label: "Error", icon: WifiOff, cls: "text-red-500" },
	}[status];

	const Icon = config.icon;

	return (
		<div className="flex items-center gap-1.5 text-xs">
			<Icon className={`h-3.5 w-3.5 ${config.cls}`} />
			<span
				className={
					status === "connected"
						? "text-emerald-500 font-medium"
						: "text-muted-foreground"
				}
			>
				{config.label}
			</span>
		</div>
	);
}

/* ─── Invite Code badge (header) ──────────────────────────── */

function InviteCodeBadge({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	function copy() {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	}

	return (
		<Tooltip>
			<TooltipTrigger>
				<button
					onClick={copy}
					className="flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-mono tracking-wider hover:bg-muted transition-colors"
				>
					{copied ? (
						<Check className="h-3 w-3 text-emerald-500 shrink-0" />
					) : (
						<Copy className="h-3 w-3 text-muted-foreground shrink-0" />
					)}
					{code}
				</button>
			</TooltipTrigger>
			<TooltipContent>
				{copied ? "Copied!" : "Copy invite code"}
			</TooltipContent>
		</Tooltip>
	);
}

/* ─── New File Dialog ─────────────────────────────────────── */

interface NewFileDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (filename: string) => void;
}

function NewFileDialog({ open, onClose, onConfirm }: NewFileDialogProps) {
	const [filename, setFilename] = useState("");
	const [error, setError] = useState("");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const name = filename.trim();
		if (!name) {
			setError("Filename is required.");
			return;
		}
		onConfirm(name);
		setFilename("");
		setError("");
		onClose();
	}

	function handleClose() {
		setFilename("");
		setError("");
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FilePlus className="h-5 w-5 text-primary" />
						New File
					</DialogTitle>
					<DialogDescription>
						Enter a filename with its extension (e.g.{" "}
						<code className="text-xs bg-muted px-1 rounded">
							utils.ts
						</code>
						).
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="new-filename">Filename</Label>
						<Input
							id="new-filename"
							placeholder="utils.ts"
							value={filename}
							onChange={(e) => {
								setFilename(e.target.value);
								setError("");
							}}
							autoFocus
						/>
						{error && (
							<p className="text-sm text-destructive">{error}</p>
						)}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
						>
							Cancel
						</Button>
						<Button type="submit" id="new-file-submit">
							Create File
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/* ─── File Tab ────────────────────────────────────────────── */

interface FileTabProps {
	file: SessionFile;
	isActive: boolean;
	isDirty: boolean;
	onClick: () => void;
	onClose: () => void;
}

function FileTab({ file, isActive, isDirty, onClick, onClose }: FileTabProps) {
	return (
		<div
			className={`
				group flex items-center gap-1.5 px-3 py-2 border-r border-border
				text-sm cursor-pointer select-none whitespace-nowrap transition-colors
				${
					isActive
						? "bg-background text-foreground border-b-2 border-b-primary"
						: "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
				}
			`}
			onClick={onClick}
		>
			<FileCode className="h-3.5 w-3.5 shrink-0" />
			<span className="max-w-[120px] truncate">{file.filename}</span>
			{/* Dirty indicator or close button */}
			<button
				className={`
					ml-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0
					transition-opacity hover:bg-muted
					${isDirty ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
				`}
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				aria-label={
					isDirty ? "Unsaved changes" : `Close ${file.filename}`
				}
			>
				{isDirty ? (
					<Circle className="h-2 w-2 fill-current text-amber-400" />
				) : (
					<X className="h-3 w-3" />
				)}
			</button>
		</div>
	);
}

/* ─── Members Sidebar ─────────────────────────────────────── */

interface MembersSidebarProps {
	users: SessionUser[];
	activeFileId: string | null;
	collapsed: boolean;
	onToggle: () => void;
}

function MembersSidebar({
	users,
	activeFileId,
	collapsed,
	onToggle,
}: MembersSidebarProps) {
	return (
		<aside
			className={`
				flex flex-col border-r border-border bg-card transition-all duration-200 
				${collapsed ? "w-12" : "w-56"}
			`}
		>
			{/* Sidebar header */}
			<div
				className={`flex h-10 items-center border-b border-border px-2 shrink-0 ${
					collapsed ? "justify-center" : "justify-between"
				}`}
			>
				{!collapsed && (
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						<Users className="h-3.5 w-3.5" />
						Members ({users.length})
					</span>
				)}
				<Tooltip>
					<TooltipTrigger>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 shrink-0"
							onClick={onToggle}
							id="toggle-sidebar-btn"
						>
							{collapsed ? (
								<ChevronRight className="h-4 w-4" />
							) : (
								<ChevronLeft className="h-4 w-4" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						{collapsed ? "Expand sidebar" : "Collapse sidebar"}
					</TooltipContent>
				</Tooltip>
			</div>

			{/* Member list */}
			<div className="flex-1 overflow-y-auto py-2 space-y-0.5">
				{users.map((user) => {
					const isInActiveFile = user.cursor.fileId === activeFileId;

					return (
						<Tooltip key={user.userId}>
							<TooltipTrigger>
								<div
									className={`
										flex items-center gap-2.5 rounded mx-1.5 px-1.5 py-1.5
										transition-colors hover:bg-muted cursor-default
										${collapsed ? "justify-center" : ""}
									`}
								>
									{/* Avatar with online ring */}
									<div className="relative shrink-0">
										<Avatar className="h-7 w-7">
											<AvatarFallback
												className="text-xs font-semibold text-white"
												style={{
													backgroundColor: user.color,
												}}
											>
												{getInitials(user.username)}
											</AvatarFallback>
										</Avatar>
										{/* Online dot */}
										<span
											className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card"
											style={{
												backgroundColor: user.color,
											}}
										/>
									</div>

									{!collapsed && (
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium truncate leading-none">
												{user.username}
											</p>
											{isInActiveFile && (
												<p className="text-[10px] text-muted-foreground mt-0.5">
													L{user.cursor.line} · C
													{user.cursor.column}
												</p>
											)}
										</div>
									)}
								</div>
							</TooltipTrigger>
							{collapsed && (
								<TooltipContent side="right">
									<div>
										<p className="font-medium">
											{user.username}
										</p>
										{isInActiveFile && (
											<p className="text-xs text-muted-foreground">
												L{user.cursor.line} · C
												{user.cursor.column}
											</p>
										)}
									</div>
								</TooltipContent>
							)}
						</Tooltip>
					);
				})}
			</div>
		</aside>
	);
}

/* ─── Editor Area ─────────────────────────────────────────── */

interface EditorAreaProps {
	openTabs: SessionFile[];
	activeFileId: string | null;
	dirtyFiles: Set<string>;
	content: string;
	onTabClick: (file: SessionFile) => void;
	onTabClose: (fileId: string) => void;
	onNewFileClick: () => void;
	onContentChange: (value: string | undefined) => void;
	onSave: () => void;
	lastSavedBy: string | null;
	lastSavedAt: string | null;
}

function EditorArea({
	openTabs,
	activeFileId,
	dirtyFiles,
	content,
	onTabClick,
	onTabClose,
	onNewFileClick,
	onContentChange,
	onSave,
	lastSavedBy,
	lastSavedAt,
}: EditorAreaProps) {
	const activeFile = openTabs.find((f) => f.id === activeFileId);

	return (
		<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
			{/* Tab bar */}
			<div className="flex items-stretch border-b border-border bg-muted/30 overflow-x-auto shrink-0">
				{openTabs.map((file) => (
					<FileTab
						key={file.id}
						file={file}
						isActive={file.id === activeFileId}
						isDirty={dirtyFiles.has(file.id)}
						onClick={() => onTabClick(file)}
						onClose={() => onTabClose(file.id)}
					/>
				))}

				{/* New file button */}
				<Tooltip>
					<TooltipTrigger>
						<Button
							variant="ghost"
							size="icon"
							className="h-full w-9 shrink-0 rounded-none border-r border-border"
							onClick={onNewFileClick}
							id="new-file-btn"
						>
							<FilePlus className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>New file</TooltipContent>
				</Tooltip>
			</div>

			{/* Monaco Editor */}
			{activeFile ? (
				<div className="flex-1 relative overflow-hidden">
					<Editor
						height="100%"
						language={toMonacoLang(activeFile.language)}
						value={content}
						onChange={onContentChange}
						theme="vs-dark"
						options={{
							fontSize: 14,
							fontFamily:
								"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
							fontLigatures: true,
							minimap: { enabled: true },
							scrollBeyondLastLine: false,
							wordWrap: "on",
							lineNumbers: "on",
							renderLineHighlight: "all",
							bracketPairColorization: { enabled: true },
							smoothScrolling: true,
							cursorBlinking: "smooth",
							cursorSmoothCaretAnimation: "on",
							padding: { top: 12 },
							automaticLayout: true,
						}}
					/>

					{/* Save status bar */}
					<div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[#1e1e1e]/90 backdrop-blur-sm px-3 py-1 border-t border-white/5">
						<div className="flex items-center gap-3 text-xs text-white/40">
							<span>{toMonacoLang(activeFile.language)}</span>
							<Separator
								orientation="vertical"
								className="h-3 bg-white/20"
							/>
							<span>{activeFile.filename}</span>
						</div>
						<div className="flex items-center gap-3">
							{lastSavedAt && (
								<span className="flex items-center gap-1 text-xs text-white/40">
									<Clock className="h-3 w-3" />
									Saved by {lastSavedBy} ·{" "}
									{new Date(lastSavedAt).toLocaleTimeString()}
								</span>
							)}
							<Tooltip>
								<TooltipTrigger>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 gap-1.5 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
										onClick={onSave}
										id="save-file-btn"
									>
										<Save className="h-3 w-3" />
										Save
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									Save file (Ctrl+S)
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</div>
			) : (
				<NoFileOpen onNewFileClick={onNewFileClick} />
			)}
		</div>
	);
}

/* ─── No-file-open placeholder ─────────────────────────────── */

function NoFileOpen({ onNewFileClick }: { onNewFileClick: () => void }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#1e1e1e] text-white/30">
			<FileCode className="h-16 w-16" />
			<div className="text-center">
				<p className="text-sm font-medium text-white/40">
					No file open
				</p>
				<p className="text-xs mt-1">
					Select a file from the sidebar or create a new one.
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				className="border-white/20 text-white/50 hover:text-white hover:bg-white/10"
				onClick={onNewFileClick}
			>
				<FilePlus className="mr-1.5 h-4 w-4" />
				New File
			</Button>
		</div>
	);
}

/* ─── Files Panel (sidebar of session files) ──────────────── */

interface FilesPanelProps {
	files: SessionFile[];
	activeFileId: string | null;
	users: SessionUser[];
	onFileClick: (file: SessionFile) => void;
}

function FilesPanel({
	files,
	activeFileId,
	users,
	onFileClick,
}: FilesPanelProps) {
	return (
		<div className="flex flex-col w-48 border-r border-border bg-card/50 shrink-0">
			<div className="flex h-10 items-center border-b border-border px-3">
				<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Explorer
				</span>
			</div>
			<div className="flex-1 overflow-y-auto py-1">
				{files.length === 0 ? (
					<p className="px-3 py-4 text-xs text-muted-foreground text-center">
						No files yet.
					</p>
				) : (
					files.map((file) => {
						const viewers = users.filter(
							(u) => u.cursor.fileId === file.id
						);
						return (
							<button
								key={file.id}
								className={`
									group w-full flex items-center gap-2 px-3 py-1.5 text-sm
									transition-colors hover:bg-muted text-left
									${
										activeFileId === file.id
											? "bg-muted text-foreground"
											: "text-muted-foreground"
									}
								`}
								onClick={() => onFileClick(file)}
							>
								<FileCode className="h-3.5 w-3.5 shrink-0" />
								<span className="flex-1 truncate text-xs">
									{file.filename}
								</span>
								{/* Live viewers avatars */}
								{viewers.length > 0 && (
									<div className="flex -space-x-1">
										{viewers.slice(0, 3).map((v) => (
											<Tooltip key={v.userId}>
												<TooltipTrigger>
													<span
														className="h-4 w-4 rounded-full border border-card text-[9px] flex items-center justify-center font-bold text-white"
														style={{
															backgroundColor:
																v.color,
														}}
													>
														{getInitials(
															v.username
														)}
													</span>
												</TooltipTrigger>
												<TooltipContent>
													{v.username}
												</TooltipContent>
											</Tooltip>
										))}
									</div>
								)}
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}

/* ─── Session Header ──────────────────────────────────────── */

interface SessionHeaderProps {
	sessionName: string;
	inviteCode: string;
	connectionStatus: SocketConnectionStatus;
	username: string;
	onBack: () => void;
}

function SessionHeader({
	sessionName,
	inviteCode,
	connectionStatus,
	username,
	onBack,
}: SessionHeaderProps) {
	return (
		<header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-3 shrink-0">
			{/* Left */}
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={onBack}
							id="back-to-dashboard-btn"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Back to dashboard</TooltipContent>
				</Tooltip>

				<Separator orientation="vertical" className="h-4" />

				<div className="flex items-center gap-1.5">
					<div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
						<Zap className="h-3 w-3" />
					</div>
					<span className="text-sm font-bold tracking-tight hidden sm:block">
						Air IDE
					</span>
				</div>

				<Separator
					orientation="vertical"
					className="h-4 hidden sm:block"
				/>

				<span className="text-sm font-medium truncate max-w-[180px]">
					{sessionName}
				</span>
			</div>

			{/* Centre */}
			<div className="flex items-center gap-2">
				<ConnectionChip status={connectionStatus} />
				<InviteCodeBadge code={inviteCode} />
			</div>

			{/* Right */}
			<div className="flex items-center gap-2">
				<Avatar className="h-7 w-7">
					<AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
						{getInitials(username)}
					</AvatarFallback>
				</Avatar>
				<span className="hidden sm:block text-sm font-medium">
					{username}
				</span>
			</div>
		</header>
	);
}

/* ─── Session Room Page ───────────────────────────────────── */

export function SessionRoomPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();

	/* ── Local UI state (all logic/ws-driven state lives here in skeleton) ── */
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [openTabs, setOpenTabs] = useState<SessionFile[]>([MOCK_FILES[0]]);
	const [activeFileId, setActiveFileId] = useState<string | null>(
		MOCK_FILES[0].id
	);
	const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
	const [editorContent, setEditorContent] = useState<string>(
		MOCK_STARTER_CONTENT[MOCK_FILES[0].id] ?? ""
	);
	const [newFileOpen, setNewFileOpen] = useState(false);

	// Placeholder connection status — will be driven by joinSession query
	const connectionStatus: SocketConnectionStatus = "connected";
	const lastSavedBy: string | null = null;
	const lastSavedAt: string | null = null;

	/* ── Handlers ── */

	function openFile(file: SessionFile) {
		setActiveFileId(file.id);
		if (!openTabs.some((t) => t.id === file.id)) {
			setOpenTabs((prev) => [...prev, file]);
		}
		setEditorContent(MOCK_STARTER_CONTENT[file.id] ?? "");
	}

	function closeTab(fileId: string) {
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
			setEditorContent(next ? (MOCK_STARTER_CONTENT[next.id] ?? "") : "");
		}
	}

	function handleContentChange(value: string | undefined) {
		setEditorContent(value ?? "");
		if (activeFileId) {
			setDirtyFiles((prev) => new Set(prev).add(activeFileId));
		}
	}

	function handleSave() {
		if (activeFileId) {
			setDirtyFiles((prev) => {
				const next = new Set(prev);
				next.delete(activeFileId);
				return next;
			});
		}
		// TODO: dispatch saveFile socket mutation
	}

	function handleNewFile(filename: string) {
		const lang = langFromFilename(filename);
		const newFile: SessionFile = {
			id: `local-${Date.now()}`,
			filename,
			language: lang,
		};
		// TODO: dispatch createFile REST mutation, then open tab
		setOpenTabs((prev) => [...prev, newFile]);
		setActiveFileId(newFile.id);
		setEditorContent("");
		MOCK_STARTER_CONTENT[newFile.id] = "";
	}

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background">
			{/* Header */}
			<SessionHeader
				sessionName={MOCK_SESSION_NAME}
				inviteCode={roomId ?? MOCK_INVITE_CODE}
				connectionStatus={connectionStatus}
				username="vatsal" // TODO: from useGetUserQuery
				onBack={() => navigate("/")}
			/>

			{/* Body — sidebar + editor */}
			<div className="flex flex-1 overflow-hidden">
				{/* Members sidebar */}
				<MembersSidebar
					users={MOCK_USERS}
					activeFileId={activeFileId}
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed((v) => !v)}
				/>

				{/* File explorer + editor */}
				<FilesPanel
					files={MOCK_FILES}
					activeFileId={activeFileId}
					users={MOCK_USERS}
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
					lastSavedBy={lastSavedBy}
					lastSavedAt={lastSavedAt}
				/>
			</div>

			{/* New file dialog */}
			<NewFileDialog
				open={newFileOpen}
				onClose={() => setNewFileOpen(false)}
				onConfirm={handleNewFile}
			/>
		</div>
	);
}

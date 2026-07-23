import Editor, { type OnMount } from "@monaco-editor/react";
import { Clock, FilePlus, FileCode, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionFile } from "@/types/collabTypes";
import { FileTab } from "./FileTab";
import { toMonacoLang } from "./helpers";
import { useTheme } from "@/components/theme-provider";

/* ─── No-file-open placeholder ─────────────────────────────── */

function NoFileOpen({ onNewFileClick }: { onNewFileClick: () => void }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
			<FileCode className="h-16 w-16" />
			<div className="text-center">
				<p className="text-sm font-medium">No file open</p>
				<p className="text-xs mt-1">
					Select a file from the sidebar or create a new one.
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				className={"text-foreground"}
				onClick={onNewFileClick}
			>
				<FilePlus className="mr-1.5 h-4 w-4" />
				New File
			</Button>
		</div>
	);
}

/* ─── Editor Area ─────────────────────────────────────────── */

export interface EditorAreaProps {
	openTabs: SessionFile[];
	activeFileId: string | null;
	dirtyFiles: Set<string>;
	onTabClick: (file: SessionFile) => void;
	onTabClose: (fileId: string) => void;
	onNewFileClick: () => void;
	onSave: () => void;
	onEditorMount: OnMount;
	lastSavedBy: string | null;
	lastSavedAt: string | null;
}

export function EditorArea({
	openTabs,
	activeFileId,
	dirtyFiles,
	onTabClick,
	onTabClose,
	onNewFileClick,
	onSave,
	onEditorMount,
	lastSavedBy,
	lastSavedAt,
}: EditorAreaProps) {
	const activeFile = openTabs.find((f) => f.id === activeFileId);
	const { theme } = useTheme();
	const editorTheme =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches)
			? "vs-dark"
			: "light";

	return (
		<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
			{/* Tab bar */}
			<div className="h-10 flex items-center border-b border-border bg-muted/30 overflow-x-auto shrink-0">
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

				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="p-2 rounded-full"
								onClick={onNewFileClick}
								id="new-file-btn"
							>
								<FilePlus className="h-4 w-4 pointer-events-none" />
							</Button>
						}
					/>
					<TooltipContent>Create New File</TooltipContent>
				</Tooltip>
			</div>

			{/* Monaco Editor */}
			{activeFile ? (
				<div className="flex-1 flex flex-col overflow-hidden">
					<div className="flex-1 overflow-hidden">
						<Editor
							height="100%"
							language={toMonacoLang(activeFile.language)}
							path={activeFile.id}
							onMount={onEditorMount}
							theme={editorTheme}
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
								// Required for remote-cursor user-initial badges in the gutter
								glyphMargin: true,
							}}
						/>
					</div>

					{/* Save status bar */}
					<div className="flex items-center justify-between bg-background backdrop-blur-sm px-3 py-1 border-t border-border">
						<div className="flex items-center gap-3 text-xs font-mono">
							<span>{toMonacoLang(activeFile.language)}</span>
							<Separator
								orientation="vertical"
								className="bg-white/20"
							/>
							<span>{activeFile.filename}</span>
						</div>
						<div className="flex items-center gap-3">
							{lastSavedAt && (
								<span className="flex items-center gap-1 text-xs">
									<Clock className="h-3 w-3" />
									Saved by {lastSavedBy} ·{" "}
									{new Date(lastSavedAt).toLocaleTimeString()}
								</span>
							)}
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="ghost"
											size="sm"
											className="h-6 gap-1.5 px-2 text-xs"
											onClick={onSave}
											id="save-file-btn"
										>
											<Save className="h-3 w-3" />
											Save
										</Button>
									}
								/>
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

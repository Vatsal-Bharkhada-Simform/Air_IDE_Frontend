import Editor, { type OnMount } from "@monaco-editor/react";
import {
	Clock,
	FilePlus,
	FileCode,
	FloppyDisk,
	ArrowRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
		<div className="flex flex-1 flex-col items-center justify-center gap-5 bg-editor-bg">
			{/* Icon */}
			<div className="relative flex h-14 w-14 items-center justify-center rounded-[12px] bg-editor-panel border border-editor-border">
				<FileCode
					size={22}
					weight="light"
					className="text-editor-muted"
				/>
			</div>
			<div className="text-center space-y-1.5">
				<p className="text-sm font-medium text-editor-text tracking-tight">
					No file open
				</p>
				<p className="text-xs font-medium text-editor-muted uppercase tracking-wider">
					Select from explorer or create new
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={onNewFileClick}
				className="gap-1.5 text-xs"
			>
				<FilePlus size={13} weight="light" />
				New file
				<ArrowRight
					size={11}
					weight="bold"
					className="ml-1 opacity-50"
				/>
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

	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	const editorTheme = isDark ? "vs-dark" : "vs";

	return (
		<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
			{/* Tab bar */}
			<div className="h-9 flex items-center overflow-x-auto shrink-0 bg-editor-bg border-b border-editor-border">
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
								className="h-7 w-7 rounded-md ml-0.5 shrink-0 text-editor-muted hover:text-editor-text hover:bg-editor-panel"
								onClick={onNewFileClick}
								id="new-file-btn"
							>
								<FilePlus size={13} weight="light" />
							</Button>
						}
					/>
					<TooltipContent>New file</TooltipContent>
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
								fontSize: 13,
								fontFamily:
									"'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace",
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
								glyphMargin: true,
								overviewRulerBorder: false,
								scrollbar: {
									verticalScrollbarSize: 6,
									horizontalScrollbarSize: 6,
								},
							}}
						/>
					</div>

					{/* Save status bar */}
					<div className="flex items-center justify-between px-3 py-1 shrink-0 bg-editor-bg border-t border-editor-border">
						<div className="flex items-center gap-3 text-[10px] font-mono">
							<span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-editor-panel border border-editor-border text-editor-muted">
								{toMonacoLang(activeFile.language)}
							</span>
							<span className="text-editor-muted font-sans font-medium uppercase tracking-wider">
								{activeFile.filename}
							</span>
						</div>
						<div className="flex items-center gap-3">
							{lastSavedAt && (
								<span className="flex items-center gap-1 text-[10px] text-editor-muted">
									<Clock size={10} />
									{lastSavedBy} ·{" "}
									{new Date(lastSavedAt).toLocaleTimeString()}
								</span>
							)}
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="ghost"
											size="sm"
											className="h-5 gap-1 px-2 text-[10px] font-medium uppercase tracking-wider text-editor-muted hover:text-editor-text hover:bg-editor-panel"
											onClick={onSave}
											id="save-file-btn"
										>
											<FloppyDisk size={11} />
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

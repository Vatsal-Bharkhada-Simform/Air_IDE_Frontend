import Editor, { type OnMount } from "@monaco-editor/react";
import type * as MonacoType from "monaco-editor";
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

/* ─── Editor Area ─────────────────────────────────────────── */

export interface EditorAreaProps {
	openTabs: SessionFile[];
	activeFileId: string | null;
	dirtyFiles: Set<string>;
	content: string;
	onTabClick: (file: SessionFile) => void;
	onTabClose: (fileId: string) => void;
	onNewFileClick: () => void;
	onContentChange: (
		value: string | undefined,
		ev: MonacoType.editor.IModelContentChangedEvent
	) => void;
	onSave: () => void;
	onEditorMount: OnMount;
	lastSavedBy: string | null;
	lastSavedAt: string | null;
}

export function EditorArea({
	openTabs,
	activeFileId,
	dirtyFiles,
	content,
	onTabClick,
	onTabClose,
	onNewFileClick,
	onContentChange,
	onSave,
	onEditorMount,
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

				<Button
					variant="ghost"
					size="icon"
					className="p-2 shrink-0 rounded-none border-r border-border"
					onClick={onNewFileClick}
					id="new-file-btn"
				>
					<FilePlus className="h-4 w-4" />
				</Button>
			</div>

			{/* Monaco Editor */}
			{activeFile ? (
				<div className="flex-1 relative overflow-hidden">
					<Editor
						height="100%"
						language={toMonacoLang(activeFile.language)}
						value={content}
						onChange={onContentChange}
						onMount={onEditorMount}
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
								<TooltipTrigger
									render={
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

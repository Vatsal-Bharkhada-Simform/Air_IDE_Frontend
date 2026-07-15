import { Pencil, Trash2, FileCode } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionFile, SessionUser } from "@/types/collabTypes";
import { getInitials } from "./helpers";

export interface FilesPanelProps {
	files: SessionFile[];
	activeFileId: string | null;
	users: SessionUser[];
	onFileClick: (file: SessionFile) => void;
	onRenameClick: (file: SessionFile) => void;
	onDeleteClick: (file: SessionFile) => void;
}

export function FilesPanel({
	files,
	activeFileId,
	users,
	onFileClick,
	onRenameClick,
	onDeleteClick,
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
						const isActive = activeFileId === file.id;
						return (
							<div
								key={file.id}
								className={`
									group relative flex items-center gap-1.5 px-2 py-1.5
									transition-colors hover:bg-muted
									${isActive ? "bg-muted text-foreground" : "text-muted-foreground"}
								`}
							>
								{/* File click area */}
								<button
									className="flex flex-1 items-center gap-2 min-w-0 text-left"
									onClick={() => onFileClick(file)}
								>
									<FileCode className="h-3.5 w-3.5 shrink-0" />
									<span className="flex-1 truncate text-sm">
										{file.filename}
									</span>
								</button>

								{/* Live viewers avatars — hidden when actions are visible */}
								{viewers.length > 0 && (
									<div className="flex -space-x-1 group-hover:hidden">
										{viewers.slice(0, 3).map((v) => (
											<Tooltip key={v.userId}>
												<TooltipTrigger
													render={
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
													}
												/>
												<TooltipContent>
													{v.username}
												</TooltipContent>
											</Tooltip>
										))}
									</div>
								)}

								{/* Action buttons — shown on row hover */}
								<div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
									<Tooltip>
										<TooltipTrigger
											render={
												<button
													id={`rename-file-${file.id}`}
													className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
													onClick={(e) => {
														e.stopPropagation();
														onRenameClick(file);
													}}
													aria-label={`Rename ${file.filename}`}
												>
													<Pencil className="h-3.5 w-3.5" />
												</button>
											}
										/>
										<TooltipContent side="bottom">
											Rename
										</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger
											render={
												<button
													id={`delete-file-${file.id}`}
													className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
													onClick={(e) => {
														e.stopPropagation();
														onDeleteClick(file);
													}}
													aria-label={`Delete ${file.filename}`}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</button>
											}
										/>
										<TooltipContent side="bottom">
											Delete
										</TooltipContent>
									</Tooltip>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

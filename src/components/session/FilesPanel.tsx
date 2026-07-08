import { FileCode } from "lucide-react";
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
}

export function FilesPanel({
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
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}

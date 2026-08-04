import { PencilSimple, Trash, FileCode } from "@phosphor-icons/react";
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
		<div
			className="flex flex-col w-44 shrink-0"
			style={{
				borderRight: "1px solid oklch(1 0 0 / 0.06)",
				background: "oklch(0.10 0.014 270)",
			}}
		>
			{/* Header */}
			<div
				className="flex h-9 items-center px-3"
				style={{ borderBottom: "1px solid oklch(1 0 0 / 0.05)" }}
			>
				<span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.42_0.01_270)]">
					Explorer
				</span>
			</div>

			{/* File list */}
			<div className="flex-1 overflow-y-auto py-1">
				{files.length === 0 ? (
					<p className="px-3 py-4 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.40_0.01_270)] text-center">
						No files
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
								className="group relative flex items-center gap-1 px-2 py-1 transition-colors duration-100"
								style={{
									borderLeft: `2px solid ${isActive ? "oklch(0.62 0.24 275)" : "transparent"}`,
									background: isActive
										? "oklch(0.62 0.24 275 / 0.07)"
										: undefined,
									paddingLeft: "6px",
								}}
							>
								{/* File click area */}
								<button
									className="flex flex-1 items-center gap-1.5 min-w-0 text-left"
									onClick={() => onFileClick(file)}
								>
									<FileCode
										size={12}
										weight="light"
										className="shrink-0"
										style={{
											color: isActive
												? "oklch(0.62 0.24 275)"
												: "oklch(0.45 0.01 270)",
										}}
									/>
									<span
										className="flex-1 truncate text-xs font-mono"
										style={{
											color: isActive
												? "oklch(0.88 0.008 270)"
												: "oklch(0.65 0.01 270)",
										}}
									>
										{file.filename}
									</span>
								</button>

								{/* Live viewer avatars — hide on hover */}
								{viewers.length > 0 && (
									<div className="flex -space-x-1 group-hover:hidden shrink-0">
										{viewers.slice(0, 2).map((v) => (
											<Tooltip key={v.userId}>
												<TooltipTrigger
													render={
														<span
															className="h-3.5 w-3.5 rounded border border-[oklch(0.10_0.014_270)] text-[8px] flex items-center justify-center font-bold text-white"
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

								{/* Action buttons on hover */}
								<div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
									<Tooltip>
										<TooltipTrigger
											render={
												<button
													id={`rename-file-${file.id}`}
													className="rounded p-0.5 transition-colors text-[oklch(0.45_0.01_270)] hover:text-[oklch(0.80_0.008_270)] hover:bg-[oklch(1_0_0/0.06)]"
													onClick={(e) => {
														e.stopPropagation();
														onRenameClick(file);
													}}
													aria-label={`Rename ${file.filename}`}
												>
													<PencilSimple
														size={11}
														weight="light"
													/>
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
													className="rounded p-0.5 transition-colors text-[oklch(0.45_0.01_270)] hover:text-[oklch(0.65_0.22_22)] hover:bg-[oklch(0.65_0.22_22/0.08)]"
													onClick={(e) => {
														e.stopPropagation();
														onDeleteClick(file);
													}}
													aria-label={`Delete ${file.filename}`}
												>
													<Trash
														size={11}
														weight="light"
													/>
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

import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionUser } from "@/types/collabTypes";
import { getInitials } from "./helpers";

export interface MembersSidebarProps {
	users: SessionUser[];
	activeFileId: string | null;
	collapsed: boolean;
	onToggle: () => void;
}

export function MembersSidebar({
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
			</div>

			{/* Member list */}
			<div className="flex-1 overflow-y-auto p-2 space-y-0.5">
				{users.map((user) => {
					const isInActiveFile = user.cursor.fileId === activeFileId;

					return (
						<Tooltip key={user.userId}>
							<TooltipTrigger className={"w-full"}>
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

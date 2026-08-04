import { CaretLeft, CaretRight, Users } from "@phosphor-icons/react";
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
				flex flex-col transition-all duration-200
				${collapsed ? "w-10" : "w-52"}
			`}
			style={{
				borderRight: "1px solid oklch(1 0 0 / 0.06)",
				background: "oklch(0.095 0.014 270)",
			}}
		>
			{/* Sidebar header */}
			<div
				className={`flex h-9 items-center px-2 shrink-0 ${
					collapsed ? "justify-center" : "justify-between"
				}`}
				style={{ borderBottom: "1px solid oklch(1 0 0 / 0.05)" }}
			>
				{!collapsed && (
					<span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.45_0.01_270)]">
						<Users size={11} />
						Members · {users.length}
					</span>
				)}
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 shrink-0 rounded-md"
					onClick={onToggle}
					id="toggle-sidebar-btn"
				>
					{collapsed ? (
						<CaretRight size={11} weight="bold" />
					) : (
						<CaretLeft size={11} weight="bold" />
					)}
				</Button>
			</div>

			{/* Member list */}
			<div className="flex-1 overflow-y-auto py-1.5 space-y-px">
				{users.map((user) => {
					const isInActiveFile = user.cursor.fileId === activeFileId;

					return (
						<Tooltip key={user.userId}>
							<TooltipTrigger className="w-full">
								<div
									className={`
										flex items-center gap-2 px-2 py-1.5 transition-colors hover:bg-[oklch(1_0_0/0.03)] cursor-default
										${collapsed ? "justify-center" : ""}
									`}
									style={{
										// Color-coded left border stripe matching user cursor
										borderLeft: `2px solid ${isInActiveFile ? user.color : "transparent"}`,
										paddingLeft: "6px",
									}}
								>
									{/* Avatar */}
									<div className="relative shrink-0">
										<Avatar className="h-6 w-6">
											<AvatarFallback
												className="text-[9px] font-bold text-white"
												style={{
													backgroundColor: user.color,
												}}
											>
												{getInitials(user.username)}
											</AvatarFallback>
										</Avatar>
										{/* Online dot */}
										<span
											className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[oklch(0.095_0.014_270)]"
											style={{
												backgroundColor: user.color,
											}}
										/>
									</div>

									{!collapsed && (
										<div className="min-w-0 flex-1 text-left">
											<p className="text-xs font-mono truncate leading-none text-[oklch(0.75_0.008_270)]">
												{user.username}
											</p>
											{isInActiveFile && (
												<p
													className="text-[10px] font-mono mt-0.5 tabular-nums"
													style={{
														color: "oklch(0.45 0.01 270)",
													}}
												>
													L{user.cursor.line}·C
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
										<p className="font-mono text-xs">
											{user.username}
										</p>
										{isInActiveFile && (
											<p className="text-xs text-muted-foreground tabular-nums">
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

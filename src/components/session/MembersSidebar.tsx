import { CaretLeft, CaretRight, Users } from "@phosphor-icons/react";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionUser } from "@/types/collabTypes";

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
			className={`flex flex-col transition-all duration-200 bg-card border-r border-border ${
				collapsed ? "w-10" : "w-52"
			}`}
		>
			{/* Sidebar header */}
			<div
				className={`flex h-9 items-center px-2 shrink-0 border-b border-border ${
					collapsed ? "justify-center" : "justify-between"
				}`}
			>
				{!collapsed && (
					<span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
									className={`flex items-center gap-2 px-2 py-1.5 transition-colors hover:bg-muted cursor-default ${
										collapsed ? "justify-center" : ""
									}`}
									style={{
										borderLeft: `2px solid ${isInActiveFile ? user.color : "transparent"}`,
										paddingLeft: "6px",
									}}
								>
									{/* Avatar */}
									<div className="relative shrink-0">
										<AvatarImage
											seed={user.avatarSeed}
											username={user.username}
											className="h-6 w-6"
											fallbackClassName="text-[9px] font-bold text-white"
											fallbackStyle={{
												backgroundColor: user.color,
											}}
										/>
										{/* Online dot */}
										<span
											className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card"
											style={{
												backgroundColor: user.color,
											}}
										/>
									</div>

									{!collapsed && (
										<div className="min-w-0 flex-1 text-left">
											<p className="text-xs font-medium truncate leading-none text-foreground">
												{user.username}
											</p>
											{isInActiveFile && (
												<p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
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
										<p className="font-medium text-xs">
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

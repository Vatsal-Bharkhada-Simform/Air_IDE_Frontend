import { ArrowLeft, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator as SeparatorUI } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SocketConnectionStatus } from "@/types/collabTypes";
import { ConnectionChip } from "./ConnectionChip";
import { InviteCodeBadge } from "./InviteCodeBadge";
import { getInitials } from "./helpers";

export interface SessionHeaderProps {
	sessionName: string;
	inviteCode: string;
	connectionStatus: SocketConnectionStatus;
	username: string;
	onBack: () => void;
}

export function SessionHeader({
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
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={onBack}
								id="back-to-dashboard-btn"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						}
					/>
					<TooltipContent>Back to dashboard</TooltipContent>
				</Tooltip>

				<SeparatorUI orientation="vertical" className="h-4" />

				<div className="flex items-center gap-1.5">
					<div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
						<Zap className="h-3 w-3" />
					</div>
					<span className="text-sm font-bold tracking-tight hidden sm:block">
						Air IDE
					</span>
				</div>

				<SeparatorUI
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

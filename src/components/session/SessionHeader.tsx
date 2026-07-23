import { ArrowLeft, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SocketConnectionStatus } from "@/types/collabTypes";
import { ConnectionChip } from "./ConnectionChip";
import { InviteCodeBadge } from "./InviteCodeBadge";
import { getInitials } from "./helpers";
import { ThemeToggle } from "@/components/theme-toggle";

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
			<div className="flex items-center gap-4">
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

				<div className="flex items-center gap-1.5">
					<div className="flex h-5 w-5 items-center justify-center rounded bg-signal-blue text-white">
						<Zap className="h-3 w-3" />
					</div>
					<span className="text-md font-bold tracking-tight hidden sm:block">
						Air <span className="text-signal-blue">IDE</span>
					</span>
				</div>

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
				<ThemeToggle />
				<Avatar className="h-8 w-8">
					<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
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

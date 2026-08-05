import { ArrowLeft, Code } from "@phosphor-icons/react";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SocketConnectionStatus } from "@/types/collabTypes";
import { ConnectionChip } from "./ConnectionChip";
import { InviteCodeBadge } from "./InviteCodeBadge";
import { ThemeToggle } from "@/components/theme-toggle";

export interface SessionHeaderProps {
	sessionName: string;
	inviteCode: string;
	connectionStatus: SocketConnectionStatus;
	username: string;
	avatarSeed?: string | null;
	onBack: () => void;
}

export function SessionHeader({
	sessionName,
	inviteCode,
	connectionStatus,
	username,
	avatarSeed,
	onBack,
}: SessionHeaderProps) {
	return (
		<header className="sticky top-0 z-40 flex h-12 items-center justify-between px-4 shrink-0 bg-card border-b border-border">
			{/* Left */}
			<div className="flex items-center gap-3">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-lg"
								onClick={onBack}
								id="back-to-dashboard-btn"
							>
								<ArrowLeft size={16} />
							</Button>
						}
					/>
					<TooltipContent>Back to dashboard</TooltipContent>
				</Tooltip>

				{/* Brand mark */}
				<div className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Code size={14} weight="bold" />
					</div>
					<span className="text-base font-bold tracking-tight text-foreground hidden sm:block">
						Air
						<span className="text-muted-foreground font-normal">
							IDE
						</span>
					</span>
				</div>

				{/* Divider */}
				<div className="h-4 w-px hidden sm:block bg-border" />

				{/* Session name */}
				{sessionName && (
					<span className="text-sm font-medium tracking-tight text-foreground truncate max-w-[180px]">
						{sessionName}
					</span>
				)}
			</div>

			{/* Centre */}
			<div className="flex items-center gap-3">
				<ConnectionChip status={connectionStatus} />
				<div className="h-4 w-px bg-border" />
				<InviteCodeBadge code={inviteCode} />
			</div>

			{/* Right */}
			<div className="flex items-center gap-3">
				<ThemeToggle />
				<div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-muted border border-border">
					<AvatarImage
						seed={avatarSeed}
						username={username}
						className="h-5 w-5"
						fallbackClassName="text-[9px] font-bold text-primary-foreground"
						fallbackStyle={{ background: "var(--primary)" }}
					/>
					<span className="text-xs font-medium text-foreground max-w-[100px] truncate">
						{username}
					</span>
				</div>
			</div>
		</header>
	);
}

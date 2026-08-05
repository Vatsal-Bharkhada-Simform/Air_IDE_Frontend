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
		<header
			className="sticky top-0 z-40 flex h-11 items-center justify-between px-3 shrink-0"
			style={{
				background: "oklch(0.10 0.015 270 / 0.95)",
				backdropFilter: "blur(16px)",
				borderBottom: "1px solid oklch(1 0 0 / 0.06)",
				boxShadow: "inset 0 -1px 0 oklch(0 0 0 / 0.1)",
			}}
		>
			{/* Left */}
			<div className="flex items-center gap-3">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 rounded-lg"
								onClick={onBack}
								id="back-to-dashboard-btn"
							>
								<ArrowLeft size={14} />
							</Button>
						}
					/>
					<TooltipContent>Back to dashboard</TooltipContent>
				</Tooltip>

				{/* Brand mark */}
				<div className="flex items-center gap-2">
					<div
						className="flex h-6 w-6 items-center justify-center rounded-md"
						style={{
							background:
								"linear-gradient(135deg, oklch(0.62 0.24 275), oklch(0.52 0.22 275))",
							boxShadow: "0 0 10px oklch(0.62 0.24 275 / 0.25)",
						}}
					>
						<Code size={11} weight="bold" className="text-white" />
					</div>
					<span
						className="text-sm font-bold tracking-tight hidden sm:block"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Air{" "}
						<span style={{ color: "oklch(0.62 0.24 275)" }}>
							IDE
						</span>
					</span>
				</div>

				{/* Divider */}
				<div
					className="h-4 w-px hidden sm:block"
					style={{ background: "oklch(1 0 0 / 0.08)" }}
				/>

				{/* Session name */}
				{sessionName && (
					<span className="text-xs font-mono tracking-wide text-[oklch(0.65_0.012_270)] truncate max-w-[180px]">
						{sessionName}
					</span>
				)}
			</div>

			{/* Centre */}
			<div className="flex items-center gap-3">
				<ConnectionChip status={connectionStatus} />
				<div
					className="h-3.5 w-px"
					style={{ background: "oklch(1 0 0 / 0.08)" }}
				/>
				<InviteCodeBadge code={inviteCode} />
			</div>

			{/* Right */}
			<div className="flex items-center gap-2">
				<div
					className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md"
					style={{
						background: "oklch(1 0 0 / 0.04)",
						border: "1px solid oklch(1 0 0 / 0.06)",
					}}
				>
					<AvatarImage
						seed={avatarSeed}
						username={username}
						className="h-5 w-5"
						fallbackClassName="text-[9px] font-bold text-white"
						fallbackStyle={{ background: "oklch(0.62 0.24 275)" }}
					/>
					<span className="text-xs font-mono text-[oklch(0.65_0.01_270)] max-w-[100px] truncate">
						{username}
					</span>
				</div>
			</div>
		</header>
	);
}

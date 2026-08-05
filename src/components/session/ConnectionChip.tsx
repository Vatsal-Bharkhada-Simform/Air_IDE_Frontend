import type { SocketConnectionStatus } from "@/types/collabTypes";

export function ConnectionChip({ status }: { status: SocketConnectionStatus }) {
	if (status === "connected") {
		return (
			<div className="flex items-center gap-1.5">
				<span className="relative flex h-2 w-2" aria-label="Connected">
					<span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-live-pulse bg-accent-green-fg" />
					<span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green-fg" />
				</span>
				<span className="text-[10px] font-medium uppercase tracking-wider text-accent-green-fg">
					Live
				</span>
			</div>
		);
	}

	if (status === "connecting") {
		return (
			<div className="flex items-center gap-1.5">
				<span className="relative flex h-2 w-2" aria-label="Connecting">
					<span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-spin-slow bg-accent-amber-fg" />
					<span className="relative inline-flex rounded-full h-2 w-2 bg-accent-amber-fg opacity-50" />
				</span>
				<span className="text-[10px] font-medium uppercase tracking-wider text-accent-amber-fg">
					Connecting
				</span>
			</div>
		);
	}

	if (status === "error" || status === "disconnected") {
		return (
			<div className="flex items-center gap-1.5">
				<span
					className="h-2 w-2 rounded-full bg-accent-red-fg"
					aria-label="Disconnected"
				/>
				<span className="text-[10px] font-medium uppercase tracking-wider text-accent-red-fg">
					{status === "error" ? "Error" : "Offline"}
				</span>
			</div>
		);
	}

	// idle
	return (
		<div className="flex items-center gap-1.5">
			<span className="h-2 w-2 rounded-full bg-muted-foreground opacity-50" />
			<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
				Idle
			</span>
		</div>
	);
}

import type { SocketConnectionStatus } from "@/types/collabTypes";

export function ConnectionChip({ status }: { status: SocketConnectionStatus }) {
	if (status === "connected") {
		return (
			<div className="flex items-center gap-1.5">
				<span className="relative flex h-2 w-2" aria-label="Connected">
					<span
						className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-live-pulse"
						style={{ background: "oklch(0.72 0.2 145)" }}
					/>
					<span
						className="relative inline-flex rounded-full h-2 w-2"
						style={{ background: "oklch(0.72 0.2 145)" }}
					/>
				</span>
				<span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.72_0.2_145)]">
					Live
				</span>
			</div>
		);
	}

	if (status === "connecting") {
		return (
			<div className="flex items-center gap-1.5">
				<span className="relative flex h-2 w-2" aria-label="Connecting">
					<span
						className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-spin-slow"
						style={{
							background:
								"conic-gradient(from 0deg, transparent 0%, oklch(0.78 0.18 85) 100%)",
						}}
					/>
					<span
						className="relative inline-flex rounded-full h-2 w-2"
						style={{ background: "oklch(0.78 0.18 85 / 0.5)" }}
					/>
				</span>
				<span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.78_0.18_85)]">
					Connecting
				</span>
			</div>
		);
	}

	if (status === "error" || status === "disconnected") {
		return (
			<div className="flex items-center gap-1.5">
				<span
					className="h-2 w-2 rounded-full"
					style={{ background: "oklch(0.65 0.22 22)" }}
					aria-label="Disconnected"
				/>
				<span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.65_0.22_22)]">
					{status === "error" ? "Error" : "Offline"}
				</span>
			</div>
		);
	}

	// idle
	return (
		<div className="flex items-center gap-1.5">
			<span
				className="h-2 w-2 rounded-full"
				style={{ background: "oklch(1 0 0 / 0.2)" }}
			/>
			<span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.42_0.01_270)]">
				Idle
			</span>
		</div>
	);
}

import { Circle, Loader2, Wifi, WifiOff } from "lucide-react";
import type { SocketConnectionStatus } from "@/types/collabTypes";

export function ConnectionChip({ status }: { status: SocketConnectionStatus }) {
	const config = {
		idle: { label: "Idle", icon: Circle, cls: "text-muted-foreground" },
		connecting: {
			label: "Connecting…",
			icon: Loader2,
			cls: "text-amber-500 animate-spin",
		},
		connected: { label: "Live", icon: Wifi, cls: "text-emerald-500" },
		disconnected: {
			label: "Disconnected",
			icon: WifiOff,
			cls: "text-red-500",
		},
		error: { label: "Error", icon: WifiOff, cls: "text-red-500" },
	}[status];

	const Icon = config.icon;

	return (
		<div className="flex items-center gap-1.5 text-xs">
			<Icon className={`h-3.5 w-3.5 ${config.cls}`} />
			<span
				className={
					status === "connected"
						? "text-emerald-500 font-medium"
						: "text-muted-foreground"
				}
			>
				{config.label}
			</span>
		</div>
	);
}

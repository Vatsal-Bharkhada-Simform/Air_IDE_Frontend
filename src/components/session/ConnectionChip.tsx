import { Circle, Loader2, Wifi, WifiOff } from "lucide-react";
import type { SocketConnectionStatus } from "@/types/collabTypes";

export function ConnectionChip({ status }: { status: SocketConnectionStatus }) {
	const config = {
		idle: { label: "Idle", icon: Circle, cls: "text-muted-foreground" },
		connecting: {
			label: "Connecting…",
			icon: Loader2,
			cls: "text-status-warn animate-spin",
		},
		connected: { label: "Live", icon: Wifi, cls: "text-status-live" },
		disconnected: {
			label: "Disconnected",
			icon: WifiOff,
			cls: "text-status-error",
		},
		error: { label: "Error", icon: WifiOff, cls: "text-status-error" },
	}[status];

	const Icon = config.icon;

	return (
		<div className="flex items-center gap-1.5 text-sm">
			<Icon className={`w-4 h-4 -mt-1 ${config.cls}`} />
			<span className={config.cls}>{config.label}</span>
		</div>
	);
}

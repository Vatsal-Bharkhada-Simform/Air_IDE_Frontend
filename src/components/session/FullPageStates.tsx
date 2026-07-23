import { AlertTriangle, ArrowLeft, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectingScreen() {
	return (
		<div className="h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
			<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-blue text-white">
				<Zap className="h-5 w-5" />
			</div>
			<div className="text-center space-y-1">
				<h2 className="text-lg font-semibold">
					Connecting to session…
				</h2>
				<p className="text-sm text-muted-foreground">
					Establishing a secure WebSocket connection.
				</p>
			</div>
			<Loader2 className="h-6 w-6 animate-spin text-status-warn" />
		</div>
	);
}

export function ErrorScreen({
	message,
	onBack,
}: {
	message: string;
	onBack: () => void;
}) {
	return (
		<div className="h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
			<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
				<AlertTriangle className="h-5 w-5" />
			</div>
			<div className="text-center space-y-1">
				<h2 className="text-lg font-semibold">
					Failed to join session
				</h2>
				<p className="text-sm text-muted-foreground max-w-xs">
					{message}
				</p>
			</div>
			<Button variant="outline" onClick={onBack}>
				<ArrowLeft className="mr-1.5 h-4 w-4" />
				Back to dashboard
			</Button>
		</div>
	);
}

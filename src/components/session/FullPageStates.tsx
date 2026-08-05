import { ArrowLeft, Warning, Code } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function ConnectingScreen() {
	// Reuse the existing premium loading screen — it already has the right aesthetic
	return <LoadingScreen />;
}

export function ErrorScreen({
	message,
	onBack,
}: {
	message: string;
	onBack: () => void;
}) {
	return (
		<div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 p-6 bg-background">
			{/* Brand mark */}
			<div className="flex items-center gap-2.5 mb-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Code size={14} weight="bold" />
				</div>
				<span className="text-base font-bold tracking-tight text-foreground">
					Air{" "}
					<span className="text-muted-foreground font-normal">
						IDE
					</span>
				</span>
			</div>

			{/* Error icon */}
			<div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-red-bg border border-accent-red-bg">
				<Warning
					size={24}
					weight="light"
					className="text-accent-red-fg"
				/>
			</div>

			{/* Message */}
			<div className="text-center space-y-2 max-w-sm">
				<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-red-fg">
					Connection Error
				</p>
				<h2 className="text-xl font-bold tracking-tight text-foreground">
					Failed to join session
				</h2>
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>

			<Button variant="outline" onClick={onBack} className="gap-1.5">
				<ArrowLeft size={13} weight="bold" />
				Back to dashboard
			</Button>
		</div>
	);
}

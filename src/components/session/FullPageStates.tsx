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
		<div
			className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 p-6"
			style={{ background: "oklch(0.087 0.018 270)" }}
		>
			{/* Brand mark */}
			<div className="flex items-center gap-2.5 mb-2">
				<div
					className="flex h-8 w-8 items-center justify-center rounded-lg"
					style={{
						background:
							"linear-gradient(135deg, oklch(0.62 0.24 275), oklch(0.52 0.22 275))",
						boxShadow: "0 0 14px oklch(0.62 0.24 275 / 0.25)",
					}}
				>
					<Code size={14} weight="bold" className="text-white" />
				</div>
				<span
					className="text-base font-bold tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Air{" "}
					<span style={{ color: "oklch(0.62 0.24 275)" }}>IDE</span>
				</span>
			</div>

			{/* Error icon */}
			<div className="relative">
				<div
					className="absolute inset-0 rounded-2xl opacity-25"
					style={{
						background: "oklch(0.65 0.22 22)",
						filter: "blur(20px)",
					}}
				/>
				<div
					className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
					style={{
						background: "oklch(0.65 0.22 22 / 0.12)",
						border: "1px solid oklch(0.65 0.22 22 / 0.3)",
					}}
				>
					<Warning
						size={24}
						weight="light"
						style={{ color: "oklch(0.75 0.18 22)" }}
					/>
				</div>
			</div>

			{/* Message */}
			<div className="text-center space-y-2 max-w-sm">
				<p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[oklch(0.65_0.22_22)]">
					[ Connection Error ]
				</p>
				<h2
					className="text-xl font-bold tracking-tight text-[oklch(0.88_0.008_270)]"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Failed to join session
				</h2>
				<p className="text-sm text-[oklch(0.50_0.01_270)]">{message}</p>
			</div>

			<Button variant="outline" onClick={onBack} className="gap-1.5">
				<ArrowLeft size={13} weight="bold" />
				Back to dashboard
			</Button>
		</div>
	);
}

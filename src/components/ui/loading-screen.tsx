export function LoadingScreen() {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-8">
				{/* Minimal Spinner */}
				<div className="relative flex h-8 w-8 items-center justify-center">
					<div className="absolute inset-0 rounded-full border-2 border-border" />
					<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground" />
				</div>

				{/* Brand */}
				<div className="flex flex-col items-center gap-2">
					<div className="text-xl font-bold tracking-tight text-foreground">
						Air<span className="text-muted-foreground">IDE</span>
					</div>
					<div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
						Initializing workspace
					</div>
				</div>
			</div>
		</div>
	);
}

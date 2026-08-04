import { useEffect, useState } from "react";

const CODE_LINES = [
	"Authenticating session...",
	"Loading workspace...",
	"Syncing environment...",
	"Preparing editor...",
];

export function LoadingScreen() {
	const [activeLineIndex, setActiveLineIndex] = useState(0);
	const [dots, setDots] = useState("");

	useEffect(() => {
		const lineInterval = setInterval(() => {
			setActiveLineIndex((prev) => (prev + 1) % CODE_LINES.length);
		}, 800);
		return () => clearInterval(lineInterval);
	}, []);

	useEffect(() => {
		const dotInterval = setInterval(() => {
			setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
		}, 400);
		return () => clearInterval(dotInterval);
	}, []);

	return (
		<div className="loading-screen">
			{/* Ambient background blobs */}
			<div className="blob blob-1" />
			<div className="blob blob-2" />
			<div className="blob blob-3" />

			{/* Grid overlay */}
			<div className="grid-overlay" />

			{/* Content */}
			<div className="loading-content">
				{/* Logo mark */}
				<div className="logo-container">
					<div className="logo-ring logo-ring-outer" />
					<div className="logo-ring logo-ring-middle" />
					<div className="logo-core">
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="16 18 22 12 16 6" />
							<polyline points="8 6 2 12 8 18" />
						</svg>
					</div>
				</div>

				{/* Brand name */}
				<div className="brand">
					<span className="brand-air">Air</span>
					<span className="brand-ide">IDE</span>
				</div>

				{/* Terminal-style status block */}
				<div className="terminal-card">
					<div className="terminal-header">
						<span className="terminal-dot dot-red" />
						<span className="terminal-dot dot-yellow" />
						<span className="terminal-dot dot-green" />
						<span className="terminal-title">initializing</span>
					</div>
					<div className="terminal-body">
						{CODE_LINES.map((line, i) => (
							<div
								key={line}
								className={`terminal-line ${i === activeLineIndex ? "line-active" : i < activeLineIndex ? "line-done" : "line-pending"}`}
							>
								<span className="line-prompt">
									{i < activeLineIndex
										? "✓"
										: i === activeLineIndex
											? "›"
											: "·"}
								</span>
								<span className="line-text">
									{line}
									{i === activeLineIndex && (
										<span className="line-dots">
											{dots}
										</span>
									)}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Progress bar */}
				<div className="progress-track">
					<div className="progress-fill" />
				</div>
			</div>

			<style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: oklch(0.1 0.01 264);
          overflow: hidden;
          z-index: 9999;
          font-family: 'Figtree Variable', sans-serif;
        }

        /* ── Ambient blobs ── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: pulse-blob 6s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: oklch(0.65 0.22 264);
          top: -120px; left: -80px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 320px; height: 320px;
          background: oklch(0.62 0.2 300);
          bottom: -80px; right: -60px;
          animation-delay: -2s;
        }
        .blob-3 {
          width: 240px; height: 240px;
          background: oklch(0.68 0.18 230);
          bottom: 30%; left: 10%;
          animation-delay: -4s;
        }
        @keyframes pulse-blob {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.15) translate(20px, -20px); }
        }

        /* ── Grid overlay ── */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(oklch(1 0 0 / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* ── Content wrapper ── */
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          z-index: 1;
        }

        /* ── Logo ── */
        .logo-container {
          position: relative;
          width: 80px; height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid transparent;
          animation: spin 3s linear infinite;
        }
        .logo-ring-outer {
          border-top-color: oklch(0.65 0.22 264);
          border-right-color: oklch(0.65 0.22 264 / 0.4);
          animation-duration: 3s;
        }
        .logo-ring-middle {
          inset: 10px;
          border-top-color: oklch(0.68 0.18 230);
          border-left-color: oklch(0.68 0.18 230 / 0.4);
          animation-direction: reverse;
          animation-duration: 2.2s;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .logo-core {
          width: 44px; height: 44px;
          background: oklch(0.18 0.02 264);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: oklch(0.75 0.18 264);
          box-shadow:
            0 0 20px oklch(0.65 0.22 264 / 0.35),
            inset 0 0 12px oklch(0.65 0.22 264 / 0.1);
        }

        /* ── Brand ── */
        .brand {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .brand-air {
          color: oklch(0.98 0 0);
        }
        .brand-ide {
          color: oklch(0.65 0.22 264);
          margin-left: 1px;
        }

        /* ── Terminal card ── */
        .terminal-card {
          width: 320px;
          background: oklch(0.15 0.015 264 / 0.8);
          border: 1px solid oklch(1 0 0 / 0.08);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(12px);
          box-shadow:
            0 0 0 1px oklch(1 0 0 / 0.04),
            0 20px 60px oklch(0 0 0 / 0.4);
        }
        .terminal-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: oklch(0.12 0.01 264 / 0.6);
          border-bottom: 1px solid oklch(1 0 0 / 0.06);
        }
        .terminal-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-red    { background: oklch(0.65 0.2 27); }
        .dot-yellow { background: oklch(0.78 0.18 85); }
        .dot-green  { background: oklch(0.72 0.19 145); }
        .terminal-title {
          margin-left: 4px;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          color: oklch(0.5 0 0);
          text-transform: uppercase;
          font-family: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace;
        }
        .terminal-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .terminal-line {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 0.82rem;
          font-family: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace;
          transition: opacity 0.3s, color 0.3s;
        }
        .line-pending {
          opacity: 0.25;
          color: oklch(0.7 0 0);
        }
        .line-done {
          opacity: 0.55;
          color: oklch(0.72 0.19 145);
        }
        .line-active {
          opacity: 1;
          color: oklch(0.92 0 0);
        }
        .line-prompt {
          width: 12px;
          flex-shrink: 0;
          color: oklch(0.65 0.22 264);
          font-size: 0.75rem;
        }
        .line-done .line-prompt {
          color: oklch(0.72 0.19 145);
        }
        .line-pending .line-prompt {
          color: oklch(0.4 0 0);
        }
        .line-text {
          white-space: nowrap;
        }
        .line-dots {
          display: inline-block;
          min-width: 18px;
          color: oklch(0.65 0.22 264);
        }

        /* ── Progress bar ── */
        .progress-track {
          width: 320px;
          height: 3px;
          background: oklch(1 0 0 / 0.07);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          width: 40%;
          background: linear-gradient(
            90deg,
            oklch(0.62 0.2 300),
            oklch(0.65 0.22 264),
            oklch(0.68 0.18 230)
          );
          border-radius: 999px;
          animation: progress-sweep 2s ease-in-out infinite;
          box-shadow: 0 0 8px oklch(0.65 0.22 264 / 0.6);
        }
        @keyframes progress-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
		</div>
	);
}

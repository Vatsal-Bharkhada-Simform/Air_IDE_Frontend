import { useState } from "react";
import {
	Plus,
	SignOut,
	ArrowRight,
	CircleNotch,
	Code,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { useGetUserQuery, useLogoutUserQuery } from "@/store/api/api";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { CreateSessionDialog } from "@/components/dashboard/CreateSessionDialog";
import { JoinSessionDialog } from "@/components/dashboard/JoinSessionDialog";
import { SessionsTabs } from "@/components/dashboard/SessionsTabs";

/* ─── Logout Button ───────────────────────────────────────── */

function LogoutButton() {
	const navigate = useNavigate();
	const [trigger, setTrigger] = useState(false);
	const { isLoading } = useLogoutUserQuery(undefined, { skip: !trigger });

	function handleLogout() {
		setTrigger(true);
		setTimeout(() => navigate("/auth/login", { replace: true }), 400);
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleLogout}
			disabled={isLoading}
			className="gap-1.5 text-[oklch(0.50_0.01_270)] hover:text-[oklch(0.80_0.008_270)] h-7 px-2 text-xs font-mono uppercase tracking-wider"
			id="logout-btn"
		>
			{isLoading ? (
				<CircleNotch size={13} className="animate-spin" />
			) : (
				<SignOut size={13} />
			)}
			Logout
		</Button>
	);
}

/* ─── Dashboard Page ──────────────────────────────────────── */

export function DashboardPage() {
	const { data: userData } = useGetUserQuery();
	const [createOpen, setCreateOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);

	const username = userData?.data.user?.username ?? "";

	return (
		<div className="min-h-[100dvh] bg-[oklch(0.087_0.018_270)] flex flex-col relative overflow-hidden">
			{/* Ambient background */}
			<div
				className="fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, oklch(0.62 0.24 275 / 0.08) 0%, transparent 70%)",
					filter: "blur(40px)",
				}}
			/>
			<div
				className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, oklch(0.72 0.2 145 / 0.04) 0%, transparent 70%)",
					filter: "blur(60px)",
				}}
			/>

			{/* ── Floating island nav ──────────────────────────────── */}
			<div className="sticky top-0 z-40 px-4 pt-4">
				<header
					className="mx-auto max-w-5xl flex h-12 items-center justify-between px-4 animate-fade-in"
					style={{
						background: "oklch(0.12 0.016 270 / 0.88)",
						backdropFilter: "blur(20px)",
						border: "1px solid oklch(1 0 0 / 0.08)",
						borderRadius: "16px",
						boxShadow:
							"inset 0 1px 0 oklch(1 0 0 / 0.07), 0 8px 32px oklch(0 0 0 / 0.35)",
					}}
				>
					{/* Brand */}
					<div className="flex items-center gap-2.5">
						<div
							className="flex h-7 w-7 items-center justify-center rounded-lg"
							style={{
								background:
									"linear-gradient(135deg, oklch(0.62 0.24 275), oklch(0.52 0.22 275))",
								boxShadow:
									"inset 0 1px 0 oklch(1 0 0 / 0.15), 0 0 14px oklch(0.62 0.24 275 / 0.25)",
							}}
						>
							<Code
								size={14}
								weight="bold"
								className="text-white"
							/>
						</div>
						<span
							className="text-base font-bold tracking-tight"
							style={{ fontFamily: "var(--font-display)" }}
						>
							Air{" "}
							<span style={{ color: "oklch(0.62 0.24 275)" }}>
								IDE
							</span>
						</span>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-2">
						{/* User pill */}
						<div
							className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg"
							style={{
								background: "oklch(1 0 0 / 0.04)",
								border: "1px solid oklch(1 0 0 / 0.06)",
							}}
						>
							<AvatarImage
								seed={userData?.data.user?.avatarSeed}
								username={username}
								className="h-5 w-5"
								fallbackClassName="text-[9px] font-bold text-white"
								fallbackStyle={{
									background: "oklch(0.62 0.24 275)",
								}}
							/>
							<span className="text-xs font-mono text-[oklch(0.70_0.01_270)] max-w-[120px] truncate">
								{username}
							</span>
						</div>

						<div
							className="h-4 w-px hidden sm:block"
							style={{ background: "oklch(1 0 0 / 0.08)" }}
						/>
						<LogoutButton />
					</div>
				</header>
			</div>

			{/* ── Main ── */}
			<main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">
				{/* Page title + actions */}
				<div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
					<div>
						<p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[oklch(0.45_0.01_270)] mb-3">
							[ Workspace ]
						</p>
						<h1
							className="text-4xl font-bold tracking-tight text-[oklch(0.94_0.008_270)] leading-none"
							style={{ fontFamily: "var(--font-display)" }}
						>
							Sessions
						</h1>
						<p className="mt-2 text-sm text-[oklch(0.50_0.01_270)]">
							Collaborative rooms you own or have joined.
						</p>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setJoinOpen(true)}
							id="join-session-btn"
							className="gap-1.5 h-9"
						>
							<ArrowRight
								size={13}
								weight="bold"
								className="rotate-180"
							/>
							Join
						</Button>
						<Button
							size="sm"
							onClick={() => setCreateOpen(true)}
							id="create-session-btn"
							className="gap-1.5 h-9"
						>
							<Plus size={13} weight="bold" />
							New Session
						</Button>
					</div>
				</div>

				{/* Tabbed session list */}
				<div className="animate-fade-up delay-75">
					<SessionsTabs onCreateClick={() => setCreateOpen(true)} />
				</div>
			</main>

			{/* ── Dialogs ── */}
			<CreateSessionDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
			/>
			<JoinSessionDialog
				open={joinOpen}
				onClose={() => setJoinOpen(false)}
			/>
		</div>
	);
}

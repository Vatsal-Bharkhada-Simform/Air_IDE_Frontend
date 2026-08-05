import { useState } from "react";
import {
	SignOut,
	CircleNotch,
	Code,
	ArrowRightIcon,
	PlusIcon,
	SignInIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { useGetUserQuery, useLogoutUserQuery } from "@/store/api/api";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { CreateSessionDialog } from "@/components/dashboard/CreateSessionDialog";
import { JoinSessionDialog } from "@/components/dashboard/JoinSessionDialog";
import { SessionsTabs } from "@/components/dashboard/SessionsTabs";
import { ThemeToggle } from "@/components/theme-toggle";

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
			className="gap-1.5 h-7 px-2"
			id="logout-btn"
		>
			{isLoading ? (
				<CircleNotch size={14} className="animate-spin" />
			) : (
				<SignOut size={14} />
			)}
			<span className="hidden sm:inline">Logout</span>
		</Button>
	);
}

export function DashboardPage() {
	const { data: userData } = useGetUserQuery();
	const [createOpen, setCreateOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);

	const username = userData?.data.user?.username ?? "";

	return (
		<div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
			{/* ── Flat Header ──────────────────────────────── */}
			<div className="sticky top-0 z-40 bg-card border-b border-border h-14 flex items-center px-4 sm:px-6">
				<div className="mx-auto w-full max-w-5xl flex items-center justify-between">
					{/* Brand */}
					<div className="flex items-center gap-2.5">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Code size={14} weight="bold" />
						</div>
						<span className="text-base font-bold tracking-tight text-foreground">
							Air
							<span className="text-muted-foreground font-normal">
								IDE
							</span>
						</span>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-3">
						<ThemeToggle />
						{/* User chip */}
						<div className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-muted border border-border">
							<AvatarImage
								seed={userData?.data.user?.avatarSeed}
								username={username}
								className="h-5 w-5"
								fallbackClassName="text-[9px] font-bold text-primary-foreground"
								fallbackStyle={{ background: "var(--primary)" }}
							/>
							<span className="hidden sm:inline text-xs font-medium text-foreground max-w-[120px] truncate">
								{username}
							</span>
						</div>

						<div className="h-4 w-px bg-border" />
						<LogoutButton />
					</div>
				</div>
			</div>

			{/* ── Main ── */}
			<main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">
				{/* Page title + actions */}
				<div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight text-foreground leading-none">
							Sessions
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
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
							<SignInIcon size={13} weight="bold" />
							Join
						</Button>
						<Button
							size="sm"
							onClick={() => setCreateOpen(true)}
							id="create-session-btn"
							className="gap-1.5 h-9"
						>
							<PlusIcon size={13} weight="bold" />
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

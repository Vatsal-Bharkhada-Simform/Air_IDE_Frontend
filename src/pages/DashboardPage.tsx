import { useState } from "react";
import { Plus, LogIn, LogOut, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { useGetUserQuery, useLogoutUserQuery } from "@/store/api/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CreateSessionDialog } from "@/components/dashboard/CreateSessionDialog";
import { JoinSessionDialog } from "@/components/dashboard/JoinSessionDialog";
import { SessionsTabs } from "@/components/dashboard/SessionsTabs";

/* ─── Helpers ─────────────────────────────────────────────── */

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

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
			variant="outline"
			size="sm"
			onClick={handleLogout}
			disabled={isLoading}
			className="gap-1.5"
			id="logout-btn"
		>
			{isLoading ? (
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			) : (
				<LogOut className="h-3.5 w-3.5" />
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
		<div className="min-h-screen bg-background flex flex-col">
			{/* ── Header ── */}
			<header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
					{/* Brand */}
					<div className="flex items-center gap-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal-blue text-white">
							<Zap className="h-4 w-4" />
						</div>
						<span className="text-lg font-bold tracking-tight">
							Air <span className="text-signal-blue">IDE</span>
						</span>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-3">
						<ThemeToggle />
						<div className="flex items-center gap-2">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
									{getInitials(username)}
								</AvatarFallback>
							</Avatar>
							<span className="hidden sm:block text-sm font-medium">
								{username}
							</span>
						</div>
						<Separator orientation="vertical" />
						<LogoutButton />
					</div>
				</div>
			</header>

			{/* ── Main ── */}
			<main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
				{/* Page title + actions */}
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-signal-blue mb-1.5">
							Workspace
						</p>
						<h1 className="text-3xl font-bold tracking-tight">
							Sessions
						</h1>
						<p className="mt-1.5 text-sm text-muted-foreground">
							Collaborative rooms you own or have joined.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setJoinOpen(true)}
							id="join-session-btn"
						>
							<LogIn className="mr-1.5 h-4 w-4" />
							Join Session
						</Button>
						<Button
							onClick={() => setCreateOpen(true)}
							id="create-session-btn"
						>
							<Plus className="mr-1.5 h-4 w-4" />
							New Session
						</Button>
					</div>
				</div>

				{/* Tabbed session list */}
				<SessionsTabs onCreateClick={() => setCreateOpen(true)} />
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

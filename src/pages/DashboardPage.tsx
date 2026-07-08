import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Plus,
	LogIn,
	LogOut,
	Users,
	Calendar,
	FileCode2,
	Zap,
	Copy,
	Check,
	Loader2,
} from "lucide-react";

import {
	useGetUserQuery,
	useLogoutUserQuery,
	useListSessionsQuery,
	useCreateSessionMutation,
	useGetSessionQuery,
} from "@/store/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

/* ─── Zod Schemas ─────────────────────────────────────────── */

const createSessionSchema = z.object({
	name: z
		.string()
		.min(1, "Session name is required")
		.max(64, "Name too long"),
});

const joinSessionSchema = z.object({
	inviteCode: z.string().min(1, "Invite code is required"),
});

/* ─── Helpers ─────────────────────────────────────────────── */

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/* ─── Logout button ───────────────────────────────────────── */
function LogoutButton() {
	const navigate = useNavigate();
	const [trigger, setTrigger] = useState(false);
	const { isLoading } = useLogoutUserQuery(undefined, { skip: !trigger });

	async function handleLogout() {
		setTrigger(true);
		// Small delay so query fires, then redirect
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

/* ─── Create Session Dialog ───────────────────────────────── */
function CreateSessionDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [createSession, { isLoading }] = useCreateSessionMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof createSessionSchema>>({
		resolver: zodResolver(createSessionSchema),
	});

	async function onSubmit(values: z.infer<typeof createSessionSchema>) {
		try {
			setServerError(null);
			await createSession({ name: values.name }).unwrap();
			reset();
			onClose();
		} catch (err: any) {
			setServerError(err?.data?.message ?? "Failed to create session.");
		}
	}

	function handleClose() {
		reset();
		setServerError(null);
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-primary" />
						Create New Session
					</DialogTitle>
					<DialogDescription>
						Start a new collaborative coding session. You'll get an
						invite code to share with your teammates.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="session-name">Session Name</Label>
						<Input
							id="session-name"
							placeholder="e.g. Backend Refactor Sprint"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">
								{errors.name.message}
							</p>
						)}
					</div>

					{serverError && (
						<p className="text-sm text-destructive">
							{serverError}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							id="create-session-submit"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating…
								</>
							) : (
								"Create Session"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/* ─── Join Session Dialog ─────────────────────────────────── */
function JoinSessionDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const navigate = useNavigate();
	const [inviteCode, setInviteCode] = useState<string | null>(null);
	const [serverError, setServerError] = useState<string | null>(null);

	// Fetch session preview when invite code is confirmed
	const {
		data: sessionData,
		isLoading: isFetching,
		isError,
	} = useGetSessionQuery(inviteCode ?? "", { skip: !inviteCode });

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof joinSessionSchema>>({
		resolver: zodResolver(joinSessionSchema),
	});

	// When session data loads, navigate into the session
	useEffect(() => {
		if (sessionData?.success && inviteCode) {
			navigate(`/session/${inviteCode}`);
		}
	}, [sessionData, inviteCode, navigate]);

	// If fetch errored, show error message and clear invite code
	useEffect(() => {
		if (isError && inviteCode) {
			setServerError(
				"Session not found. Check the invite code and try again."
			);
			setInviteCode(null);
		}
	}, [isError, inviteCode]);

	async function onSubmit(values: z.infer<typeof joinSessionSchema>) {
		setServerError(null);
		setInviteCode(values.inviteCode.trim());
	}

	function handleClose() {
		reset();
		setServerError(null);
		setInviteCode(null);
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<LogIn className="h-5 w-5 text-primary" />
						Join a Session
					</DialogTitle>
					<DialogDescription>
						Enter the invite code shared by your teammate to join
						their session.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="invite-code">Invite Code</Label>
						<Input
							id="invite-code"
							placeholder="e.g. ABC123"
							className="font-mono tracking-widest uppercase"
							{...register("inviteCode")}
						/>
						{errors.inviteCode && (
							<p className="text-sm text-destructive">
								{errors.inviteCode.message}
							</p>
						)}
					</div>

					{serverError && (
						<p className="text-sm text-destructive">
							{serverError}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isFetching}
							id="join-session-submit"
						>
							{isFetching ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Joining…
								</>
							) : (
								"Join Session"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/* ─── Invite Code Cell ────────────────────────────────────── */
function InviteCodeCell({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	function copy() {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	}

	return (
		<div className="flex items-center gap-2">
			<code className="rounded bg-muted px-2 py-0.5 text-xs font-mono tracking-widest">
				{code}
			</code>
			<button
				onClick={copy}
				aria-label="Copy invite code"
				className="text-muted-foreground hover:text-foreground transition-colors"
			>
				{copied ? (
					<Check className="h-3.5 w-3.5 text-green-500" />
				) : (
					<Copy className="h-3.5 w-3.5" />
				)}
			</button>
		</div>
	);
}

/* ─── Empty State ─────────────────────────────────────────── */
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center gap-4">
			<div className="rounded-full bg-muted p-5">
				<FileCode2 className="h-10 w-10 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<h3 className="font-semibold text-lg">No sessions yet</h3>
				<p className="text-sm text-muted-foreground max-w-xs">
					Create your first session to start collaborating or join one
					with an invite code.
				</p>
			</div>
			<Button onClick={onCreateClick} id="empty-state-create-btn">
				<Plus className="mr-1.5 h-4 w-4" />
				Create Session
			</Button>
		</div>
	);
}

/* ─── Sessions Table ──────────────────────────────────────── */
function SessionsTable({ onCreateClick }: { onCreateClick: () => void }) {
	const navigate = useNavigate();
	const { data, isLoading, isError } = useListSessionsQuery();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span>Loading sessions…</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center py-20">
				<p className="text-sm text-destructive">
					Failed to load sessions. Please refresh the page.
				</p>
			</div>
		);
	}

	const sessions = data?.data.sessions ?? [];

	if (sessions.length === 0) {
		return <EmptyState onCreateClick={onCreateClick} />;
	}

	return (
		<div className="rounded-xl border bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50 hover:bg-muted/50">
						<TableHead className="font-semibold">Name</TableHead>
						<TableHead className="font-semibold">
							Invite Code
						</TableHead>
						<TableHead className="font-semibold">Status</TableHead>
						<TableHead className="font-semibold">
							<span className="flex items-center gap-1.5">
								<FileCode2 className="h-3.5 w-3.5" />
								Files
							</span>
						</TableHead>
						<TableHead className="font-semibold">
							<span className="flex items-center gap-1.5">
								<Users className="h-3.5 w-3.5" />
								Members
							</span>
						</TableHead>
						<TableHead className="font-semibold">
							<span className="flex items-center gap-1.5">
								<Calendar className="h-3.5 w-3.5" />
								Created
							</span>
						</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{sessions.map((session) => (
						<TableRow
							key={session.id}
							className="group cursor-pointer"
							onClick={() =>
								navigate(`/session/${session.inviteCode}`)
							}
						>
							<TableCell className="font-medium">
								{session.name}
							</TableCell>
							<TableCell onClick={(e) => e.stopPropagation()}>
								<InviteCodeCell code={session.inviteCode} />
							</TableCell>
							<TableCell>
								{session.isActive ? (
									<Badge
										variant="default"
										className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
									>
										Active
									</Badge>
								) : (
									<Badge variant="secondary">Inactive</Badge>
								)}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{session._count.files}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{session._count.participants}
							</TableCell>
							<TableCell className="text-muted-foreground text-sm">
								{formatDate(session.createdAt)}
							</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="sm"
									className="opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={(e) => {
										e.stopPropagation();
										navigate(
											`/session/${session.inviteCode}`
										);
									}}
								>
									Open →
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

/* ─── Dashboard Page ──────────────────────────────────────── */
export function DashboardPage() {
	const { data: userData } = useGetUserQuery();
	const [createOpen, setCreateOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);

	const user = userData?.data.user;
	const username = user?.username ?? "";

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* ── Header ── */}
			<header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
					{/* Brand */}
					<div className="flex items-center gap-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Zap className="h-4 w-4" />
						</div>
						<span className="text-lg font-bold tracking-tight">
							Air IDE
						</span>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-3">
						{/* User profile */}
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
						<h1 className="text-2xl font-bold tracking-tight">
							My Sessions
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							All the collaborative rooms you've created or
							joined.
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

				{/* Table */}
				<SessionsTable onCreateClick={() => setCreateOpen(true)} />
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

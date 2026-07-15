import { useNavigate } from "react-router";
import { FileCode2, Users, Calendar, Plus } from "lucide-react";
import type { SessionDataWithCounts } from "@/types/collabTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { InviteCodeCell } from "./InviteCodeCell";
import { SessionRowActions } from "./SessionRowActions";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

interface EmptyStateProps {
	onCreateClick: () => void;
	label?: string;
	description?: string;
	showCreate?: boolean;
}

function EmptyState({
	onCreateClick,
	label = "No sessions yet",
	description = "Create your first session to start collaborating or join one with an invite code.",
	showCreate = true,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center gap-4">
			<div className="rounded-full bg-muted p-5">
				<FileCode2 className="h-10 w-10 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<h3 className="font-semibold text-lg">{label}</h3>
				<p className="text-sm text-muted-foreground max-w-xs">
					{description}
				</p>
			</div>
			{showCreate && (
				<Button onClick={onCreateClick} id="empty-state-create-btn">
					<Plus className="mr-1.5 h-4 w-4" />
					Create Session
				</Button>
			)}
		</div>
	);
}

interface SessionTableProps {
	sessions: SessionDataWithCounts[];
	isOwner: boolean;
	onCreateClick: () => void;
	emptyLabel: string;
	emptyDescription: string;
}

export function SessionTable({
	sessions,
	isOwner,
	onCreateClick,
	emptyLabel,
	emptyDescription,
}: SessionTableProps) {
	const navigate = useNavigate();

	if (sessions.length === 0) {
		return (
			<EmptyState
				onCreateClick={onCreateClick}
				label={emptyLabel}
				description={emptyDescription}
				showCreate={isOwner}
			/>
		);
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
							<TableCell onClick={(e) => e.stopPropagation()}>
								{isOwner ? (
									<SessionRowActions session={session} />
								) : (
									<Button
										variant="ghost"
										size="sm"
										className="opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={() =>
											navigate(
												`/session/${session.inviteCode}`
											)
										}
									>
										Open →
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

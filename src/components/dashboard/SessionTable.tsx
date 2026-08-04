import { useState } from "react";
import { useNavigate } from "react-router";
import {
	FileCode2,
	Users,
	Calendar,
	Plus,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
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
import { SessionFilesDrawer } from "./SessionFilesDrawer";

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
			<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-foreground">
				<FileCode2 className="h-7 w-7" />
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
	const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

	function toggleExpand(sessionId: string) {
		setExpandedRowId((prev) => (prev === sessionId ? null : sessionId));
	}

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
		<div className="rounded-xl ring-1 ring-foreground/10 bg-card overflow-hidden">
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
					{sessions.map((session) => {
						const isExpanded = expandedRowId === session.id;
						return (
							<>
								<TableRow
									key={session.id}
									className="group cursor-pointer hover:bg-muted"
									onClick={() =>
										navigate(
											`/session/${session.inviteCode}`
										)
									}
								>
									<TableCell className="font-medium max-w-[200px]">
										<span
											className="block truncate"
											title={session.name}
										>
											{session.name}
										</span>
									</TableCell>
									<TableCell
										onClick={(e) => e.stopPropagation()}
									>
										<InviteCodeCell
											code={session.inviteCode}
										/>
									</TableCell>
									<TableCell>
										{session.isActive ? (
											<Badge
												variant="default"
												className="bg-status-live/15 text-status-live border-status-live/30 hover:bg-status-live/20"
											>
												Active
											</Badge>
										) : (
											<Badge variant="secondary">
												Inactive
											</Badge>
										)}
									</TableCell>

									{/* Files column — chevron toggle */}
									<TableCell
										onClick={(e) => e.stopPropagation()}
									>
										<button
											onClick={() =>
												toggleExpand(session.id)
											}
											className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
											aria-label={
												isExpanded
													? "Collapse files"
													: "Expand files"
											}
											id={`toggle-files-${session.id}`}
										>
											{isExpanded ? (
												<ChevronDown className="h-3.5 w-3.5" />
											) : (
												<ChevronRight className="h-3.5 w-3.5" />
											)}
											{session._count.files}
										</button>
									</TableCell>

									<TableCell className="text-muted-foreground">
										{session._count.participants}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{formatDate(session.createdAt)}
									</TableCell>
									<TableCell
										onClick={(e) => e.stopPropagation()}
									>
										{isOwner ? (
											<SessionRowActions
												session={session}
											/>
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

								{/* Expandable file drawer row */}
								{isExpanded && (
									<TableRow
										key={`${session.id}-files`}
										onClick={(e) => e.stopPropagation()}
										className="hover:bg-transparent"
									>
										<TableCell colSpan={7} className="p-0">
											<SessionFilesDrawer
												sessionId={session.id}
												isOwner={isOwner}
											/>
										</TableCell>
									</TableRow>
								)}
							</>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

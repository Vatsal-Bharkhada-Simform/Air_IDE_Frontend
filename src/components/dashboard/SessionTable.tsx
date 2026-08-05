import { useState } from "react";
import { useNavigate } from "react-router";
import {
	FileCode,
	Users,
	CalendarDots,
	Plus,
	CaretDown,
	CaretRight,
	ArrowRight,
} from "@phosphor-icons/react";
import type { SessionDataWithCounts } from "@/types/collabTypes";
import { Button } from "@/components/ui/button";
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
	description = "Create a session or join one with an invite code.",
	showCreate = true,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-24 text-center gap-6 animate-fade-up">
			{/* Icon without glow */}
			<div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-muted border border-border">
				<FileCode
					size={24}
					weight="light"
					className="text-muted-foreground"
				/>
			</div>
			<div className="space-y-1.5">
				<h3 className="font-semibold text-base text-foreground tracking-tight">
					{label}
				</h3>
				<p className="text-sm text-muted-foreground max-w-xs">
					{description}
				</p>
			</div>
			{showCreate && (
				<Button
					onClick={onCreateClick}
					id="empty-state-create-btn"
					className="gap-2"
				>
					<Plus size={15} weight="bold" />
					New session
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
		<div className="rounded-xl overflow-hidden bg-card border border-border">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-border bg-muted hover:bg-muted">
						<TableHead className="font-medium text-muted-foreground">
							Name
						</TableHead>
						<TableHead className="font-medium text-muted-foreground w-[120px]">
							Code
						</TableHead>
						<TableHead className="font-medium text-muted-foreground w-[100px]">
							Status
						</TableHead>
						<TableHead className="font-medium text-muted-foreground w-[80px]">
							Files
						</TableHead>
						<TableHead className="font-medium text-muted-foreground w-[100px]">
							Members
						</TableHead>
						<TableHead className="font-medium text-muted-foreground w-[120px]">
							Created
						</TableHead>
						<TableHead className="font-medium text-muted-foreground w-[100px] text-right">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sessions.map((session) => {
						const isExpanded = expandedRowId === session.id;
						return (
							<>
								<TableRow
									key={session.id}
									className="group cursor-pointer transition-colors duration-100 hover:bg-muted"
									onClick={() =>
										navigate(
											`/session/${session.inviteCode}`
										)
									}
								>
									<TableCell className="font-medium max-w-[200px] py-3">
										<span
											className="block truncate text-sm text-foreground tracking-tight font-medium"
											title={session.name}
										>
											{session.name}
										</span>
									</TableCell>
									<TableCell
										className="py-3"
										onClick={(e) => e.stopPropagation()}
									>
										<InviteCodeCell
											code={session.inviteCode}
										/>
									</TableCell>
									<TableCell className="py-3">
										{session.isActive ? (
											<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.05em] bg-accent-green-bg text-accent-green-fg">
												<span className="h-1.5 w-1.5 rounded-full bg-accent-green-fg animate-live-dot shrink-0" />
												Active
											</span>
										) : (
											<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.05em] bg-muted text-muted-foreground border border-border">
												Idle
											</span>
										)}
									</TableCell>

									<TableCell
										className="py-3"
										onClick={(e) => e.stopPropagation()}
									>
										<button
											onClick={() =>
												toggleExpand(session.id)
											}
											className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
											aria-label={
												isExpanded
													? "Collapse files"
													: "Expand files"
											}
											id={`toggle-files-${session.id}`}
										>
											{isExpanded ? (
												<CaretDown
													size={11}
													weight="bold"
												/>
											) : (
												<CaretRight
													size={11}
													weight="bold"
												/>
											)}
											<span className="tabular-nums">
												{session._count.files}
											</span>
										</button>
									</TableCell>

									<TableCell className="py-3 text-xs text-muted-foreground tabular-nums">
										{session._count.participants}
									</TableCell>
									<TableCell className="py-3 text-xs text-muted-foreground">
										{formatDate(session.createdAt)}
									</TableCell>
									<TableCell
										className="py-3"
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
												className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-xs"
												onClick={() =>
													navigate(
														`/session/${session.inviteCode}`
													)
												}
											>
												Open
												<ArrowRight
													size={11}
													weight="bold"
												/>
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

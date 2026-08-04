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
			{/* Icon with glow */}
			<div className="relative">
				<div
					className="absolute inset-0 rounded-xl opacity-20"
					style={{
						background: "oklch(0.62 0.24 275)",
						filter: "blur(16px)",
					}}
				/>
				<div
					className="relative flex h-14 w-14 items-center justify-center rounded-xl"
					style={{
						background: "oklch(0.14 0.018 270)",
						border: "1px solid oklch(1 0 0 / 0.08)",
						boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.06)",
					}}
				>
					<FileCode
						size={24}
						weight="light"
						className="text-[oklch(0.56_0.012_270)]"
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<h3
					className="font-semibold text-base text-[oklch(0.85_0.008_270)] tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{label}
				</h3>
				<p className="text-sm text-[oklch(0.50_0.01_270)] max-w-xs">
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
		<div
			className="rounded-xl overflow-hidden"
			style={{
				background: "oklch(0.12 0.016 270 / 0.7)",
				border: "1px solid oklch(1 0 0 / 0.07)",
				boxShadow:
					"inset 0 1px 0 oklch(1 0 0 / 0.05), 0 4px 24px oklch(0 0 0 / 0.3)",
			}}
		>
			<Table>
				<TableHeader>
					<TableRow
						className="border-b border-[oklch(1_0_0/0.06)]"
						style={{ background: "oklch(1 0 0 / 0.02)" }}
					>
						<TableHead className="text-[10px] font-mono uppercase tracking-[0.12em] text-[oklch(0.45_0.01_270)] font-normal h-10">
							Session Name
						</TableHead>
						<TableHead className="text-[10px] font-mono uppercase tracking-[0.12em] text-[oklch(0.45_0.01_270)] font-normal h-10">
							Invite Code
						</TableHead>
						<TableHead className="text-[10px] font-mono uppercase tracking-[0.12em] text-[oklch(0.45_0.01_270)] font-normal h-10">
							Status
						</TableHead>
						<TableHead className="text-[10px] font-mono uppercase tracking-[0.12em] text-[oklch(0.45_0.01_270)] font-normal h-10">
							<span className="flex items-center gap-1.5">
								<FileCode size={11} weight="light" />
								Files
							</span>
						</TableHead>
						<TableHead className="text-[10px] font-mono uppercase tracking-[0.12em] text-[oklch(0.45_0.01_270)] font-normal h-10">
							<span className="flex items-center gap-1.5">
								<Users size={11} weight="light" />
								Members
							</span>
						</TableHead>
						<TableHead className="text-[10px] font-mono uppercase tracking-[0.12em] text-[oklch(0.45_0.01_270)] font-normal h-10">
							<span className="flex items-center gap-1.5">
								<CalendarDots size={11} weight="light" />
								Created
							</span>
						</TableHead>
						<TableHead className="w-10 h-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{sessions.map((session) => {
						const isExpanded = expandedRowId === session.id;
						return (
							<>
								<TableRow
									key={session.id}
									className="group cursor-pointer border-b border-[oklch(1_0_0/0.04)] transition-colors duration-100 hover:bg-[oklch(1_0_0/0.025)]"
									style={{
										borderLeft: "2px solid transparent",
									}}
									onMouseEnter={(e) => {
										(
											e.currentTarget as HTMLTableRowElement
										).style.borderLeftColor =
											"oklch(0.62 0.24 275 / 0.4)";
									}}
									onMouseLeave={(e) => {
										(
											e.currentTarget as HTMLTableRowElement
										).style.borderLeftColor = "transparent";
									}}
									onClick={() =>
										navigate(
											`/session/${session.inviteCode}`
										)
									}
								>
									<TableCell className="font-medium max-w-[200px] py-3">
										<span
											className="block truncate text-sm text-[oklch(0.88_0.008_270)] tracking-tight"
											style={{
												fontFamily:
													"var(--font-display)",
											}}
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
											<span
												className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded"
												style={{
													background:
														"oklch(0.72 0.2 145 / 0.1)",
													border: "1px solid oklch(0.72 0.2 145 / 0.25)",
													color: "oklch(0.72 0.2 145)",
												}}
											>
												<span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.2_145)] animate-live-pulse shrink-0" />
												Active
											</span>
										) : (
											<span
												className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded"
												style={{
													background:
														"oklch(1 0 0 / 0.04)",
													border: "1px solid oklch(1 0 0 / 0.08)",
													color: "oklch(0.42 0.01 270)",
												}}
											>
												Idle
											</span>
										)}
									</TableCell>

									{/* Files column — expand toggle */}
									<TableCell
										className="py-3"
										onClick={(e) => e.stopPropagation()}
									>
										<button
											onClick={() =>
												toggleExpand(session.id)
											}
											className="flex items-center gap-1.5 text-xs font-mono text-[oklch(0.50_0.01_270)] hover:text-[oklch(0.80_0.008_270)] transition-colors"
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

									<TableCell className="py-3 text-xs font-mono text-[oklch(0.50_0.01_270)] tabular-nums">
										{session._count.participants}
									</TableCell>
									<TableCell className="py-3 text-xs font-mono text-[oklch(0.50_0.01_270)]">
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

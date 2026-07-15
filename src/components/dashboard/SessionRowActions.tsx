import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, MoreHorizontal, Trash2, PowerOff, Power } from "lucide-react";
import { useUpdateSessionStatusMutation } from "@/store/api/api";
import type { SessionDataWithCounts } from "@/types/collabTypes";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteSessionDialog } from "./DeleteSessionDialog";

interface SessionRowActionsProps {
	session: SessionDataWithCounts;
}

export function SessionRowActions({ session }: SessionRowActionsProps) {
	const navigate = useNavigate();
	const [updateStatus, { isLoading: isUpdating }] =
		useUpdateSessionStatusMutation();
	const [deleteOpen, setDeleteOpen] = useState(false);

	async function handleToggleStatus() {
		try {
			await updateStatus({
				id: session.id,
				isActive: !session.isActive,
			}).unwrap();
		} catch {
			// Error handled by RTK Query
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
							id={`session-actions-${session.id}`}
							disabled={isUpdating}
						>
							{isUpdating ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<MoreHorizontal className="h-4 w-4" />
							)}
							<span className="sr-only">Session actions</span>
						</Button>
					}
				/>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem
						onClick={() =>
							navigate(`/session/${session.inviteCode}`)
						}
					>
						Open →
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleToggleStatus}
						disabled={isUpdating}
					>
						{session.isActive ? (
							<>
								<PowerOff className="mr-2 h-4 w-4" />
								Close Session
							</>
						) : (
							<>
								<Power className="mr-2 h-4 w-4" />
								Reopen Session
							</>
						)}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setDeleteOpen(true)}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Session
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{deleteOpen && (
				<DeleteSessionDialog
					session={session}
					open={deleteOpen}
					onClose={() => setDeleteOpen(false)}
				/>
			)}
		</>
	);
}

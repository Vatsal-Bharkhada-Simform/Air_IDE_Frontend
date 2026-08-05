import { useState } from "react";
import { useNavigate } from "react-router";
import {
	CircleNotch,
	DotsThreeOutline,
	Trash,
	Lightning,
	LightningSlash,
} from "@phosphor-icons/react";
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
								<CircleNotch
									size={14}
									className="animate-spin"
								/>
							) : (
								<DotsThreeOutline size={14} weight="fill" />
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
								<LightningSlash size={14} className="mr-2" />
								Close Session
							</>
						) : (
							<>
								<Lightning size={14} className="mr-2" />
								Reopen Session
							</>
						)}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setDeleteOpen(true)}
						variant="destructive"
					>
						<Trash size={14} className="mr-2" />
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

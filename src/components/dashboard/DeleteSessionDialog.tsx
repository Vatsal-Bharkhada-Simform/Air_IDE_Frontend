import { CircleNotch, Trash } from "@phosphor-icons/react";
import { useDeleteSessionMutation } from "@/store/api/api";
import type { SessionDataWithCounts } from "@/types/collabTypes";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteSessionDialogProps {
	session: SessionDataWithCounts;
	open: boolean;
	onClose: () => void;
}

export function DeleteSessionDialog({
	session,
	open,
	onClose,
}: DeleteSessionDialogProps) {
	const [deleteSession, { isLoading }] = useDeleteSessionMutation();

	async function handleConfirm() {
		try {
			await deleteSession({ id: session.id }).unwrap();
			onClose();
		} catch {
			// RTK Query surfaces the error; keep dialog open
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Delete "{session.name}"?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the session and all{" "}
						<strong>{session._count.files} file(s)</strong> inside
						it. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isLoading}
						className="bg-accent-red-bg text-accent-red-fg hover:bg-accent-red-bg border border-accent-red-fg"
						id="confirm-delete-session-btn"
					>
						{isLoading ? (
							<>
								<CircleNotch
									size={14}
									className="mr-2 animate-spin"
								/>
								Deleting…
							</>
						) : (
							<>
								<Trash size={14} className="mr-2" />
								Delete Session
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

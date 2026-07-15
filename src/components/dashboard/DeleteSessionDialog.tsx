import { Loader2, Trash2 } from "lucide-react";
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
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						id="confirm-delete-session-btn"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting…
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Session
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

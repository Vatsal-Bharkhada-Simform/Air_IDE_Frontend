import { Loader2, Trash2 } from "lucide-react";
import { useDeleteFileMutation } from "@/store/api/api";
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

interface DeleteFileConfirmProps {
	sessionId: string;
	fileId: string;
	filename: string;
	open: boolean;
	onClose: () => void;
}

export function DeleteFileConfirm({
	sessionId,
	fileId,
	filename,
	open,
	onClose,
}: DeleteFileConfirmProps) {
	const [deleteFile, { isLoading }] = useDeleteFileMutation();

	async function handleConfirm() {
		try {
			await deleteFile({ sessionId, fileId }).unwrap();
			onClose();
		} catch {
			// RTK Query surfaces the error; keep dialog open
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete "{filename}"?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the file and all its
						content. This action cannot be undone.
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
						id={`confirm-delete-file-${fileId}`}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting…
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete File
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

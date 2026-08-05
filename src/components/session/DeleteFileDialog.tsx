import { Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export interface DeleteFileDialogProps {
	open: boolean;
	filename: string;
	onClose: () => void;
	onConfirm: () => void;
}

export function DeleteFileDialog({
	open,
	filename,
	onClose,
	onConfirm,
}: DeleteFileDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-accent-red-fg">
						<Trash size={16} weight="light" />
						Delete File
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						<span className="font-semibold text-foreground">
							{filename}
						</span>
						? This action cannot be undone and will close the file
						for all collaborators.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						id="delete-file-cancel"
						type="button"
						variant="outline"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						id="delete-file-confirm"
						type="button"
						variant="destructive"
						onClick={() => {
							onConfirm();
							onClose();
						}}
					>
						<Trash size={14} className="mr-2" />
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

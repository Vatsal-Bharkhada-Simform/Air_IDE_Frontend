import { useState, useEffect } from "react";
import { PencilSimple, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export interface RenameFileDialogProps {
	open: boolean;
	currentFilename: string;
	onClose: () => void;
	/** Returns true on success, false on error */
	onConfirm: (newFilename: string) => Promise<boolean>;
}

export function RenameFileDialog({
	open,
	currentFilename,
	onClose,
	onConfirm,
}: RenameFileDialogProps) {
	const [filename, setFilename] = useState(currentFilename);
	const [error, setError] = useState("");
	const [isRenaming, setIsRenaming] = useState(false);

	// Pre-fill the input whenever the dialog opens for a different file
	useEffect(() => {
		if (open) {
			setFilename(currentFilename);
			setError("");
		}
	}, [open, currentFilename]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const name = filename.trim();

		if (!name) {
			setError("Filename is required.");
			return;
		}
		if (name === currentFilename) {
			onClose();
			return;
		}

		setIsRenaming(true);
		const success = await onConfirm(name);
		setIsRenaming(false);

		if (success) {
			setError("");
			onClose();
		} else {
			setError("Failed to rename file. The name may already be taken.");
		}
	}

	function handleClose() {
		if (isRenaming) return;
		setError("");
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<PencilSimple size={16} className="text-primary" />
						Rename File
					</DialogTitle>
					<DialogDescription>
						Enter a new name for{" "}
						<span className="font-semibold text-foreground">
							{currentFilename}
						</span>
						.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="rename-filename">New filename</Label>
						<Input
							id="rename-filename"
							placeholder={currentFilename}
							value={filename}
							onChange={(e) => {
								setFilename(e.target.value);
								setError("");
							}}
							disabled={isRenaming}
							autoFocus
						/>
						{error && (
							<p className="text-sm text-accent-red-fg">
								{error}
							</p>
						)}
					</div>
					<DialogFooter>
						<Button
							id="rename-file-cancel"
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isRenaming}
						>
							Cancel
						</Button>
						<Button
							id="rename-file-confirm"
							type="submit"
							disabled={isRenaming}
						>
							{isRenaming ? (
								<>
									<CircleNotch
										size={14}
										className="mr-2 animate-spin"
									/>
									Renaming…
								</>
							) : (
								<>
									<PencilSimple size={14} className="mr-2" />
									Rename
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

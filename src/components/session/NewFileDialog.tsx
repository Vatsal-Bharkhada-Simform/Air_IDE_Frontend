import { useState } from "react";
import { FilePlus, CircleNotch } from "@phosphor-icons/react";
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

export interface NewFileDialogProps {
	open: boolean;
	onClose: () => void;
	/** Returns true on success, false on server error */
	onConfirm: (filename: string) => Promise<boolean>;
	isCreating: boolean;
}

export function NewFileDialog({
	open,
	onClose,
	onConfirm,
	isCreating,
}: NewFileDialogProps) {
	const [filename, setFilename] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const name = filename.trim();
		if (!name) {
			setError("Filename is required.");
			return;
		}
		const success = await onConfirm(name);
		if (success) {
			setFilename("");
			setError("");
			onClose();
		} else {
			setError("Failed to create file. Please try again.");
		}
	}

	function handleClose() {
		setFilename("");
		setError("");
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FilePlus size={16} className="text-primary" />
						New File
					</DialogTitle>
					<DialogDescription>
						Enter a filename with its extension (e.g.{" "}
						<code className="text-xs bg-muted px-1 rounded">
							utils.ts
						</code>
						).
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="new-filename">Filename</Label>
						<Input
							id="new-filename"
							placeholder="utils.ts"
							value={filename}
							onChange={(e) => {
								setFilename(e.target.value);
								setError("");
							}}
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
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							id="new-file-submit"
							disabled={isCreating}
						>
							{isCreating ? (
								<>
									<CircleNotch
										size={14}
										className="mr-2 animate-spin"
									/>
									Creating…
								</>
							) : (
								"Create File"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

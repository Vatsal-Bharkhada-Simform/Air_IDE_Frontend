import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, X, Check } from "lucide-react";
import { useRenameFileMutation } from "@/store/api/api";

interface FileRenameInlineProps {
	sessionId: string;
	fileId: string;
	filename: string;
}

export function FileRenameInline({
	sessionId,
	fileId,
	filename,
}: FileRenameInlineProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(filename);
	const inputRef = useRef<HTMLInputElement>(null);
	const [renameFile, { isLoading }] = useRenameFileMutation();

	// Keep draft in sync if the filename prop changes (e.g. after a rename)
	useEffect(() => {
		if (!isEditing) setDraft(filename);
	}, [filename, isEditing]);

	// Auto-focus when entering edit mode
	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	}, [isEditing]);

	async function handleConfirm() {
		const trimmed = draft.trim();
		if (!trimmed || trimmed === filename) {
			setIsEditing(false);
			setDraft(filename);
			return;
		}
		try {
			await renameFile({
				sessionId,
				fileId,
				newFilename: trimmed,
			}).unwrap();
			setIsEditing(false);
		} catch {
			// On error, revert draft but stay in edit mode briefly
			setDraft(filename);
			setIsEditing(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") handleConfirm();
		if (e.key === "Escape") {
			setDraft(filename);
			setIsEditing(false);
		}
	}

	if (isEditing) {
		return (
			<span className="flex items-center gap-1.5">
				<input
					ref={inputRef}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleConfirm}
					disabled={isLoading}
					className="h-6 rounded border border-border bg-background px-1.5 py-0 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring w-40"
					id={`rename-input-${fileId}`}
				/>
				{isLoading ? (
					<Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
				) : (
					<>
						<button
							type="button"
							onMouseDown={(e) => {
								// prevent input blur before confirm fires
								e.preventDefault();
								handleConfirm();
							}}
							className="text-emerald-500 hover:text-emerald-400 transition-colors"
							aria-label="Confirm rename"
						>
							<Check className="h-3.5 w-3.5" />
						</button>
						<button
							type="button"
							onMouseDown={(e) => {
								e.preventDefault();
								setDraft(filename);
								setIsEditing(false);
							}}
							className="text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Cancel rename"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</>
				)}
			</span>
		);
	}

	return (
		<span className="flex items-center gap-1.5 group/rename">
			<span className="text-sm font-medium">{filename}</span>
			<button
				type="button"
				onClick={() => setIsEditing(true)}
				className="opacity-0 group-hover/rename:opacity-100 text-muted-foreground hover:text-foreground transition-all"
				aria-label="Rename file"
				id={`rename-btn-${fileId}`}
			>
				<Pencil className="h-3 w-3" />
			</button>
		</span>
	);
}

import { Circle, FileCode, X } from "lucide-react";
import type { SessionFile } from "@/types/collabTypes";

export interface FileTabProps {
	file: SessionFile;
	isActive: boolean;
	isDirty: boolean;
	onClick: () => void;
	onClose: () => void;
}

export function FileTab({
	file,
	isActive,
	isDirty,
	onClick,
	onClose,
}: FileTabProps) {
	return (
		<div
			className={`
				group flex items-center gap-1.5 px-3 py-2 border-r border-border
				text-sm cursor-pointer select-none whitespace-nowrap transition-colors
				${
					isActive
						? "bg-background text-foreground border-b-2 border-b-primary"
						: "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
				}
			`}
			onClick={onClick}
		>
			<FileCode className="h-3.5 w-3.5 shrink-0" />
			<span className="max-w-[120px] truncate">{file.filename}</span>
			{/* Dirty indicator or close button */}
			<button
				className={`
					ml-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0
					transition-opacity hover:bg-muted
					${isDirty ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
				`}
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				aria-label={
					isDirty ? "Unsaved changes" : `Close ${file.filename}`
				}
			>
				{isDirty ? (
					<Circle className="h-2 w-2 fill-current text-amber-400" />
				) : (
					<X className="h-3 w-3" />
				)}
			</button>
		</div>
	);
}

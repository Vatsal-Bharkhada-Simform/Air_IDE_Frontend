import { Circle, FileCode, X } from "@phosphor-icons/react";
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
			className={`group flex items-center gap-1.5 px-3 py-2 cursor-pointer select-none whitespace-nowrap transition-all duration-100 border-r border-editor-border border-b-2 ${
				isActive
					? "border-b-primary text-editor-text bg-editor-panel"
					: "border-b-transparent text-editor-muted hover:text-editor-text bg-editor-bg hover:bg-editor-panel"
			}`}
			onClick={onClick}
		>
			<FileCode
				size={12}
				weight="light"
				className={`shrink-0 ${isActive ? "text-primary" : "text-editor-muted"}`}
			/>
			<span className="max-w-[120px] truncate text-xs font-mono">
				{file.filename}
			</span>
			{/* Dirty indicator or close button */}
			<button
				className={`ml-0.5 h-3.5 w-3.5 rounded flex items-center justify-center shrink-0 transition-opacity hover:bg-editor-border ${
					isDirty
						? "opacity-100"
						: "opacity-0 group-hover:opacity-100"
				}`}
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				aria-label={
					isDirty ? "Unsaved changes" : `Close ${file.filename}`
				}
			>
				{isDirty ? (
					<Circle
						size={6}
						weight="fill"
						className="text-accent-amber-fg"
					/>
				) : (
					<X size={10} weight="bold" />
				)}
			</button>
		</div>
	);
}

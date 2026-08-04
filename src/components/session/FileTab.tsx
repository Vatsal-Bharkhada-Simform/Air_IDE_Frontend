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
			className={`
			group flex items-center gap-1.5 px-3 py-2 border-r
			cursor-pointer select-none whitespace-nowrap transition-all duration-100
			border-b-2
			${
				isActive
					? "border-b-[oklch(0.62_0.24_275)] text-[oklch(0.88_0.008_270)]"
					: "border-b-transparent text-[oklch(0.50_0.01_270)] hover:text-[oklch(0.72_0.008_270)]"
			}
		`}
			style={{
				background: isActive ? "oklch(0.087 0.018 270)" : "transparent",
				borderRightColor: "oklch(1 0 0 / 0.06)",
			}}
			onClick={onClick}
		>
			<FileCode
				size={12}
				weight="light"
				className="shrink-0"
				style={{ color: isActive ? "oklch(0.62 0.24 275)" : undefined }}
			/>
			<span className="max-w-[120px] truncate text-xs font-mono">
				{file.filename}
			</span>
			{/* Dirty indicator or close button */}
			<button
				className={`
				ml-0.5 h-3.5 w-3.5 rounded flex items-center justify-center shrink-0
				transition-opacity hover:bg-[oklch(1_0_0/0.08)]
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
					<Circle
						size={6}
						weight="fill"
						style={{ color: "oklch(0.78 0.18 85)" }}
					/>
				) : (
					<X size={10} weight="bold" />
				)}
			</button>
		</div>
	);
}

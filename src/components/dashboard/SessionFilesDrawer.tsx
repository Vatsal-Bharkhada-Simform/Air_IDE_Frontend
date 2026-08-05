import { useState } from "react";
import {
	FileCode,
	DownloadSimple,
	Trash,
	CircleNotch,
	WarningCircle,
} from "@phosphor-icons/react";
import { useListFilesQuery, useLazyGetFileQuery } from "@/store/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileRenameInline } from "./FileRenameInline";
import { DeleteFileConfirm } from "./DeleteFileConfirm";

// Map language slugs to a short display label
const LANG_LABEL: Record<string, string> = {
	typescript: "TS",
	javascript: "JS",
	python: "PY",
	rust: "RS",
	go: "GO",
	java: "JAVA",
	cpp: "C++",
	c: "C",
	markdown: "MD",
	json: "JSON",
	html: "HTML",
	css: "CSS",
	sql: "SQL",
	plaintext: "TXT",
};

function langLabel(lang: string) {
	return LANG_LABEL[lang?.toLowerCase()] ?? lang?.toUpperCase().slice(0, 4);
}

interface SessionFilesDrawerProps {
	sessionId: string;
	isOwner: boolean;
}

export function SessionFilesDrawer({
	sessionId,
	isOwner,
}: SessionFilesDrawerProps) {
	const { data, isLoading, isError } = useListFilesQuery(sessionId);
	const [fetchFile] = useLazyGetFileQuery();
	const [downloading, setDownloading] = useState<string | null>(null);
	const [downloadError, setDownloadError] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{
		fileId: string;
		filename: string;
	} | null>(null);

	async function handleDownload(fileId: string, filename: string) {
		setDownloading(fileId);
		try {
			const result = await fetchFile({ sessionId, fileId }).unwrap();
			const content = result.data.file.content;
			const blob = new Blob([content], {
				type: "text/plain;charset=utf-8",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			setDownloadError(fileId);
			setTimeout(() => setDownloadError(null), 3000);
		} finally {
			setDownloading(null);
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 py-4 px-4 text-xs font-mono text-muted-foreground">
				<CircleNotch size={13} className="animate-spin" />
				Loading files…
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center gap-2 py-4 px-4 text-xs font-mono text-accent-red-fg">
				<WarningCircle size={13} />
				Failed to load files.
			</div>
		);
	}

	const files = data?.data.files ?? [];

	if (files.length === 0) {
		return (
			<div className="flex items-center gap-2 py-4 px-4 text-xs font-mono text-muted-foreground">
				<FileCode size={13} weight="light" />
				No files in this session yet.
			</div>
		);
	}

	return (
		<>
			<div className="bg-muted/30 border-t border-border">
				{files.map((file, idx) => (
					<div
						key={file.id}
						className={`flex items-center gap-3 px-6 py-2.5 hover:bg-muted transition-colors ${
							idx < files.length - 1
								? "border-b border-border/60"
								: ""
						}`}
					>
						{/* Icon */}
						<FileCode
							size={14}
							weight="light"
							className="text-muted-foreground shrink-0"
						/>

						{/* Filename — inline rename for owners, plain label for participants */}
						<div className="flex-1 min-w-0">
							{isOwner ? (
								<FileRenameInline
									sessionId={sessionId}
									fileId={file.id}
									filename={file.filename}
								/>
							) : (
								<span className="text-sm font-medium truncate">
									{file.filename}
								</span>
							)}
							{downloadError === file.id && (
								<p className="text-xs text-destructive mt-0.5">
									Download failed
								</p>
							)}
						</div>

						{/* Language badge */}
						<Badge
							variant="default"
							className="text-xs font-mono px-1.5 py-0 shrink-0"
						>
							{langLabel(file.language)}
						</Badge>

						{/* Actions */}
						<div className="flex items-center gap-1 shrink-0">
							{/* Download — available to everyone */}
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={() =>
												handleDownload(
													file.id,
													file.filename
												)
											}
											disabled={downloading === file.id}
											id={`download-file-${file.id}`}
										>
											{downloading === file.id ? (
												<CircleNotch
													size={13}
													className="animate-spin"
												/>
											) : (
												<DownloadSimple size={13} />
											)}
										</Button>
									}
								/>
								<TooltipContent>Download file</TooltipContent>
							</Tooltip>

							{/* Delete — owner only */}
							{isOwner && (
								<Tooltip>
									<TooltipTrigger
										render={
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-destructive"
												onClick={() =>
													setDeleteTarget({
														fileId: file.id,
														filename: file.filename,
													})
												}
												id={`delete-file-${file.id}`}
											>
												<Trash
													size={13}
													weight="light"
												/>
											</Button>
										}
									/>
									<TooltipContent>Delete file</TooltipContent>
								</Tooltip>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Delete confirmation dialog */}
			{deleteTarget && (
				<DeleteFileConfirm
					sessionId={sessionId}
					fileId={deleteTarget.fileId}
					filename={deleteTarget.filename}
					open={!!deleteTarget}
					onClose={() => setDeleteTarget(null)}
				/>
			)}
		</>
	);
}

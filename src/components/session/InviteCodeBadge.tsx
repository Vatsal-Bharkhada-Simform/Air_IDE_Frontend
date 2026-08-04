import { useState } from "react";
import { Check, Copy, Link } from "@phosphor-icons/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface InviteCodeBadgeProps {
	code: string;
}

export function InviteCodeBadge({ code }: InviteCodeBadgeProps) {
	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);

	function copyCode() {
		navigator.clipboard.writeText(code);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 1800);
	}

	function copyLink() {
		const url = `${window.location.origin}/session/${code}`;
		navigator.clipboard.writeText(url);
		setCopiedLink(true);
		setTimeout(() => setCopiedLink(false), 1800);
	}

	return (
		<div className="flex items-center gap-1">
			{/* Copy invite code */}
			<Tooltip>
				<TooltipTrigger
					render={
						<button
							onClick={copyCode}
							className="flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-all duration-150"
							style={{
								background: copiedCode
									? "oklch(0.72 0.2 145 / 0.08)"
									: "oklch(1 0 0 / 0.04)",
								border: copiedCode
									? "1px solid oklch(0.72 0.2 145 / 0.3)"
									: "1px solid oklch(1 0 0 / 0.08)",
								color: copiedCode
									? "oklch(0.72 0.2 145)"
									: "oklch(0.70 0.01 270)",
							}}
						>
							{copiedCode ? (
								<Check size={10} weight="bold" />
							) : (
								<Copy size={10} />
							)}
							{code}
						</button>
					}
				/>
				<TooltipContent>
					{copiedCode ? "Copied!" : "Copy invite code"}
				</TooltipContent>
			</Tooltip>

			{/* Copy shareable link */}
			<Tooltip>
				<TooltipTrigger
					render={
						<button
							onClick={copyLink}
							aria-label="Copy session link"
							className="flex items-center justify-center rounded p-1 transition-all duration-150"
							style={{
								background: copiedLink
									? "oklch(0.72 0.2 145 / 0.08)"
									: "oklch(1 0 0 / 0.04)",
								border: copiedLink
									? "1px solid oklch(0.72 0.2 145 / 0.3)"
									: "1px solid oklch(1 0 0 / 0.08)",
								color: copiedLink
									? "oklch(0.72 0.2 145)"
									: "oklch(0.50 0.01 270)",
							}}
						>
							{copiedLink ? (
								<Check size={11} weight="bold" />
							) : (
								<Link size={11} />
							)}
						</button>
					}
				/>
				<TooltipContent>
					{copiedLink ? "Link copied!" : "Copy session link"}
				</TooltipContent>
			</Tooltip>
		</div>
	);
}

import { useState } from "react";
import { Copy, Check, Link } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function InviteCodeCell({ code }: { code: string }) {
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
		<div className="flex items-center gap-2">
			<code className="rounded bg-muted px-2 py-0.5 text-xs font-mono tracking-widest">
				{code}
			</code>

			{/* Copy invite code */}
			<Tooltip>
				<TooltipTrigger
					render={
						<button
							onClick={copyCode}
							aria-label="Copy invite code"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							{copiedCode ? (
								<Check className="h-3.5 w-3.5 text-green-500" />
							) : (
								<Copy className="h-3.5 w-3.5" />
							)}
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
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							{copiedLink ? (
								<Check className="h-3.5 w-3.5 text-green-500" />
							) : (
								<Link className="h-3.5 w-3.5" />
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

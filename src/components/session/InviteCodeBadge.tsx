import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface InviteCodeBadgeProps {
	code: string;
}

export function InviteCodeBadge({ code }: InviteCodeBadgeProps) {
	const [copied, setCopied] = useState(false);

	function copy() {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<button
						onClick={copy}
						className="flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-mono tracking-wider hover:bg-muted transition-colors"
					>
						{copied ? (
							<Check className="h-3 w-3 text-emerald-500 shrink-0" />
						) : (
							<Copy className="h-3 w-3 text-muted-foreground shrink-0" />
						)}
						{code}
					</button>
				}
			/>
			<TooltipContent>
				{copied ? "Copied!" : "Copy invite code"}
			</TooltipContent>
		</Tooltip>
	);
}

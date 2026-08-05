import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	// Base — pill shaped, uppercase micro-label
	"inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em] whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				// Neutral default
				default: "bg-muted text-muted-foreground border-border",
				// Semantic pastels — use CSS accent vars (adapt per theme)
				success: "bg-accent-green-bg text-accent-green-fg",
				warning: "bg-accent-amber-bg text-accent-amber-fg",
				error: "bg-accent-red-bg text-accent-red-fg",
				info: "bg-accent-blue-bg text-accent-blue-fg",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

function Badge({
	className,
	variant = "default",
	render,
	...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(
			{
				className: cn(badgeVariants({ variant }), className),
			},
			props
		),
		render,
		state: {
			slot: "badge",
			variant,
		},
	});
}

export { Badge, badgeVariants };

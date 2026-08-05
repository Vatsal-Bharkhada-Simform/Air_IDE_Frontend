import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	// Base
	"inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				// Solid dark/light primary — inverts per theme
				default: "bg-primary text-primary-foreground hover:opacity-85",
				// Outlined — uses border token
				outline: "border-border bg-card text-foreground hover:bg-muted",
				// Ghost — transparent, subtle hover
				ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
				// Destructive — pastel red bg on both themes
				destructive:
					"bg-accent-red-bg text-accent-red-fg border-accent-red-bg hover:opacity-85",
			},
			size: {
				default: "h-9 px-3",
				sm: "h-8 px-2.5 text-xs",
				lg: "h-10 px-4",
				xs: "h-6 px-2 text-xs rounded-sm",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-xs": "size-6 rounded-sm",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant = "default",
	size = "default",
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };

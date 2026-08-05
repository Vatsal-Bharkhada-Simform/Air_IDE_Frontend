import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				"h-9 w-full min-w-0 rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground transition-[border-color,box-shadow] outline-none",
				"placeholder:text-muted-foreground",
				"focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				"aria-invalid:border-accent-red-fg aria-invalid:ring-2 aria-invalid:ring-accent-red-fg/15",
				className
			)}
			{...props}
		/>
	);
}

export { Input };

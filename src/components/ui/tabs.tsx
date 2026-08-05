import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({
	className,
	orientation = "horizontal",
	...props
}: TabsPrimitive.Root.Props) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			data-orientation={orientation}
			className={cn(
				"group/tabs flex gap-2 data-horizontal:flex-col",
				className
			)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	variant = "line",
	...props
}: TabsPrimitive.List.Props & { variant?: "default" | "line" }) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			className={cn(
				"group/tabs-list inline-flex items-center text-muted-foreground",
				variant === "default" &&
					"w-fit gap-1 rounded border border-border bg-muted p-1",
				variant === "line" &&
					"w-full gap-0 border-b border-border bg-transparent",
				className
			)}
			{...props}
		/>
	);
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
	return (
		<TabsPrimitive.Tab
			data-slot="tabs-trigger"
			className={cn(
				// Base
				"relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.06em] whitespace-nowrap transition-all duration-150 ease-out outline-none",
				"focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:pointer-events-none disabled:opacity-40",
				// Default variant (pill)
				"group-data-[variant=default]/tabs-list:rounded-[calc(var(--radius)-2px)]",
				"group-data-[variant=default]/tabs-list:data-active:bg-card group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:border group-data-[variant=default]/tabs-list:data-active:border-border group-data-[variant=default]/tabs-list:data-active:shadow-none",
				// Line variant (underline)
				"group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:h-10 group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-b-transparent group-data-[variant=line]/tabs-list:bg-transparent",
				"group-data-[variant=line]/tabs-list:data-active:border-b-foreground group-data-[variant=line]/tabs-list:data-active:text-foreground",
				// Hover
				"hover:text-foreground",
				className
			)}
			{...props}
		/>
	);
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
	return (
		<TabsPrimitive.Panel
			data-slot="tabs-content"
			className={cn("flex-1 text-sm outline-none", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

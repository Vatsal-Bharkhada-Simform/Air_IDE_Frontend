import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label="Toggle theme"
			className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
		>
			{isDark ? (
				<Sun size={14} weight="bold" />
			) : (
				<Moon size={14} weight="bold" />
			)}
		</button>
	);
}

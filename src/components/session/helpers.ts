/** Returns up to 2 uppercase initials from a display name */
export function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/** Map a language string to a Monaco language ID */
export function toMonacoLang(lang: string): string {
	const map: Record<string, string> = {
		typescript: "typescript",
		javascript: "javascript",
		python: "python",
		go: "go",
		rust: "rust",
		css: "css",
		html: "html",
		json: "json",
		markdown: "markdown",
	};
	return map[lang.toLowerCase()] ?? "plaintext";
}

/** Derive language from filename extension when not provided */
export function langFromFilename(filename: string): string {
	const ext = filename.split(".").pop()?.toLowerCase() ?? "";
	const map: Record<string, string> = {
		ts: "typescript",
		tsx: "typescript",
		js: "javascript",
		jsx: "javascript",
		py: "python",
		go: "go",
		rs: "rust",
		css: "css",
		html: "html",
		json: "json",
		md: "markdown",
	};
	return map[ext] ?? "plaintext";
}

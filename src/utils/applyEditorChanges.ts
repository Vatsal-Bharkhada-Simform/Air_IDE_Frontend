import type { EditorChanges } from "../types/collabTypes";

export function applyEditorChanges(
	content: string,
	changes: EditorChanges
): string {
	const lines = content.split("\n");
	const { from, to, text } = changes;

	const before = lines[from.line]?.slice(0, from.ch) ?? "";
	const after = lines[to.line]?.slice(to.ch) ?? "";

	const newLines = [...text];
	newLines[0] = before + newLines[0];
	newLines[newLines.length - 1] += after;

	lines.splice(from.line, to.line - from.line + 1, ...newLines);

	return lines.join("\n");
}

import type * as MonacoType from "monaco-editor";
import type { EditorChanges } from "../types/collabTypes";

/**
 * Apply an array of remote edit deltas directly onto a Monaco ITextModel
 * using `pushEditOperations`. Deltas are applied sequentially in the order
 * they were produced — each one's positions describe the document state
 * after the previous delta was applied.
 *
 * This is an incremental operation — it preserves the undo stack, the local
 * user's cursor position, and selections.
 *
 * IMPORTANT: Call this instead of setting the `value` prop on <Editor />.
 * Setting the value prop replaces the entire model and wipes undo history.
 *
 * @param model   - Monaco ITextModel from `editor.getModel()`
 * @param changes - Array of deltas in the { from, to, text[] } format
 */
export function applyDeltaToModel(
	model: MonacoType.editor.ITextModel,
	changes: EditorChanges[]
): void {
	for (const change of changes) {
		const { from, to, text } = change;

		// Monaco uses 1-based lines and 1-based columns.
		// Our delta format uses 0-based lines and 0-based columns (ch).
		const startLineNumber = from.line + 1;
		const startColumn = from.ch + 1;
		const endLineNumber = to.line + 1;
		const endColumn = to.ch + 1;

		// Clamp to model bounds to avoid "invalid range" errors when
		// a concurrent delete has already removed the target lines.
		const lineCount = model.getLineCount();
		const safeEnd = Math.min(endLineNumber, lineCount);
		const safeEndCol =
			endLineNumber > lineCount
				? model.getLineMaxColumn(lineCount)
				: endColumn;

		const range: MonacoType.IRange = {
			startLineNumber,
			startColumn,
			endLineNumber: safeEnd,
			endColumn: safeEndCol,
		};

		// Join the replacement lines back into a single string as Monaco expects.
		const newText = text.join("\n");

		model.pushEditOperations(
			[], // cursor selections to preserve (empty = don't move cursor)
			[{ range, text: newText }],
			() => null // compute new cursor positions (null = keep current)
		);
	}
}

/**
 * Pure-string apply — kept for seeding the initial `fileContents` slot
 * from the DB-delivered content, and for unit-testing the delta logic
 * without a Monaco dependency.
 *
 * Do NOT use this for live remote edits — use `applyDeltaToModel` instead.
 */
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

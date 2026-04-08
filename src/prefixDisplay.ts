import { TFolder } from "obsidian";
import type { InternalFileTreeItem } from "./fileExplorer";
import { parseNumericPrefix, stripNumericPrefix } from "./prefix";
import type { PrefixDisplayMode } from "./prefixStyle";

export function applyPrefixDisplay(
	item: InternalFileTreeItem,
	rawTitle: string,
	mode: PrefixDisplayMode,
): void {
	const { innerEl } = item;
	const prefixMatch = parseNumericPrefix(rawTitle);
	const badgeKindClass = item.file instanceof TFolder
		? "o-decimal-prefix-badge-folder"
		: "o-decimal-prefix-badge-file";

	innerEl.empty();
	innerEl.removeClass(
		"o-decimal-prefix-hidden",
		"o-decimal-prefix-badge",
		"o-decimal-prefix-badge-file",
		"o-decimal-prefix-badge-folder",
	);
	innerEl.removeAttribute("data-o-decimal-prefix");

	if (!prefixMatch || mode === "original") {
		innerEl.setText(rawTitle);
		return;
	}

	if (mode === "hidden") {
		innerEl.addClass("o-decimal-prefix-hidden");
		innerEl.setText(stripNumericPrefix(rawTitle));
		return;
	}

	innerEl.addClass("o-decimal-prefix-badge", badgeKindClass);
	innerEl.setAttribute("data-o-decimal-prefix", prefixMatch.rawPrefix);
	innerEl.createSpan({
		cls: "o-decimal-prefix-badge-chip",
		text: prefixMatch.rawPrefix.slice(0, -1),
	});
	innerEl.createSpan({
		cls: "o-decimal-prefix-badge-text",
		text: prefixMatch.rest,
	});
}

export function restoreRawTitle(item: InternalFileTreeItem, rawTitle: string): void {
	item.innerEl.empty();
	item.innerEl.removeClass(
		"o-decimal-prefix-hidden",
		"o-decimal-prefix-badge",
		"o-decimal-prefix-badge-file",
		"o-decimal-prefix-badge-folder",
	);
	item.innerEl.removeAttribute("data-o-decimal-prefix");
	item.innerEl.setText(rawTitle);
}

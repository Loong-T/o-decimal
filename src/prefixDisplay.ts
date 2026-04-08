import { TFolder } from "obsidian";
import type { InternalFileTreeItem } from "./fileExplorer";
import { parseNumericPrefix, stripNumericPrefix } from "./prefix";
import type { PrefixDisplayMode } from "./prefixStyle";
import type { ODecimalSettings } from "./settings";

interface ExtraBadgeDescriptor {
	slotClass: string;
	text: string;
	tooltip: string;
}

export function applyPrefixDisplay(
	item: InternalFileTreeItem,
	rawTitle: string,
	settings: Pick<
		ODecimalSettings,
		| "prefixDisplayMode"
		| "showMissingPrefixBadge"
		| "showHiddenItemBadge"
		| "hiddenItemBadgeText"
		| "missingPrefixBadgeText"
	>,
): void {
	const { innerEl } = item;
	const prefixMatch = parseNumericPrefix(rawTitle);
	const prefixBadgeKindClass = item.file instanceof TFolder
		? "o-decimal-prefix-badge-folder"
		: "o-decimal-prefix-badge-file";
	const extraBadges = getExtraBadges(item, rawTitle, prefixMatch, settings, settings);

	innerEl.empty();
	innerEl.removeClass(
		"o-decimal-prefix-hidden",
		"o-decimal-prefix-badge",
		"o-decimal-prefix-badge-file",
		"o-decimal-prefix-badge-folder",
		"o-decimal-prefix-has-extra-badges",
	);
	innerEl.removeAttribute("data-o-decimal-prefix");

	if (!prefixMatch || settings.prefixDisplayMode === "original") {
		renderBadges(innerEl, extraBadges);
		appendTitleText(innerEl, rawTitle);
		return;
	}

	if (settings.prefixDisplayMode === "hidden") {
		innerEl.addClass("o-decimal-prefix-hidden");
		renderBadges(innerEl, extraBadges);
		appendTitleText(innerEl, stripNumericPrefix(rawTitle));
		return;
	}

	innerEl.addClass("o-decimal-prefix-badge", prefixBadgeKindClass);
	innerEl.setAttribute("data-o-decimal-prefix", prefixMatch.rawPrefix);
	renderBadges(innerEl, extraBadges);
	innerEl.createSpan({
		cls: "o-decimal-prefix-badge-chip",
		text: prefixMatch.rawPrefix.slice(0, -1),
		title: prefixMatch.rawPrefix,
	});
	appendTitleText(innerEl, prefixMatch.rest);
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

function getExtraBadges(
	item: InternalFileTreeItem,
	rawTitle: string,
	prefixMatch: ReturnType<typeof parseNumericPrefix>,
	settings: Pick<ODecimalSettings, "prefixDisplayMode" | "showMissingPrefixBadge" | "showHiddenItemBadge">,
	badgeTextSettings: Pick<ODecimalSettings, "hiddenItemBadgeText" | "missingPrefixBadgeText">,
): ExtraBadgeDescriptor[] {
	if (settings.showHiddenItemBadge && isHiddenItem(rawTitle)) {
		return [
			{
			slotClass: "o-decimal-prefix-badge-hidden-file",
			text: badgeTextSettings.hiddenItemBadgeText,
			tooltip: "Hidden item",
			},
		];
	}

	if (settings.showMissingPrefixBadge && !prefixMatch) {
		return [
			{
			slotClass: "o-decimal-prefix-badge-warning",
			text: badgeTextSettings.missingPrefixBadgeText,
			tooltip: "Missing numeric prefix",
			},
		];
	}

	return [];
}

function isHiddenItem(rawTitle: string): boolean {
	return rawTitle.startsWith(".");
}

function renderBadges(innerEl: HTMLElement, badges: ExtraBadgeDescriptor[]): void {
	if (badges.length === 0) {
		return;
	}

	innerEl.addClass("o-decimal-prefix-has-extra-badges");
	for (const badge of badges) {
		innerEl.createSpan({
			cls: `o-decimal-prefix-badge-chip ${badge.slotClass}`,
			text: badge.text,
			title: badge.tooltip,
		});
	}
}

function appendTitleText(innerEl: HTMLElement, text: string): void {
	innerEl.createSpan({
		cls: "o-decimal-prefix-badge-text",
		text,
	});
}

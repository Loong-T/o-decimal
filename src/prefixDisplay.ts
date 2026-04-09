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

interface PrefixDisplaySettings {
	prefixDisplayMode: ODecimalSettings["prefixDisplayMode"];
	prefixPattern: ODecimalSettings["prefixPattern"];
	showMissingPrefixBadge: ODecimalSettings["showMissingPrefixBadge"];
	showHiddenItemBadge: ODecimalSettings["showHiddenItemBadge"];
	hiddenItemBadgeText: ODecimalSettings["hiddenItemBadgeText"];
	missingPrefixBadgeText: ODecimalSettings["missingPrefixBadgeText"];
	tooltipHiddenItem: string;
	tooltipMissingPrefix: string;
	tooltipPrefixBadgeLabel: string;
}

export function applyPrefixDisplay(
	item: InternalFileTreeItem,
	rawTitle: string,
	settings: PrefixDisplaySettings,
): void {
	const { innerEl } = item;
	const prefixMatch = parseNumericPrefix(rawTitle, settings.prefixPattern);
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
	innerEl.setAttribute("title", rawTitle);

	if (!prefixMatch || settings.prefixDisplayMode === "original") {
		renderBadges(innerEl, extraBadges);
		appendTitleText(innerEl, rawTitle, rawTitle);
		return;
	}

	if (settings.prefixDisplayMode === "hidden") {
		innerEl.addClass("o-decimal-prefix-hidden");
		renderBadges(innerEl, extraBadges);
		appendTitleText(
			innerEl,
			stripNumericPrefix(rawTitle, settings.prefixPattern),
			rawTitle,
		);
		return;
	}

	innerEl.addClass("o-decimal-prefix-badge", prefixBadgeKindClass);
	innerEl.setAttribute("data-o-decimal-prefix", prefixMatch.rawPrefix);
	renderBadges(innerEl, extraBadges);
	innerEl.createSpan({
		cls: "o-decimal-prefix-badge-chip",
		text: prefixMatch.badgeText,
		title: `${settings.tooltipPrefixBadgeLabel}: ${prefixMatch.rawPrefix}`,
	});
	appendTitleText(innerEl, prefixMatch.rest, rawTitle);
}

export function restoreRawTitle(item: InternalFileTreeItem, rawTitle: string): void {
	item.innerEl.empty();
	item.innerEl.removeClass(
		"o-decimal-prefix-hidden",
		"o-decimal-prefix-badge",
		"o-decimal-prefix-badge-file",
		"o-decimal-prefix-badge-folder",
		"o-decimal-prefix-has-extra-badges",
	);
	item.innerEl.removeAttribute("data-o-decimal-prefix");
	item.innerEl.setText(rawTitle);
}

function getExtraBadges(
	item: InternalFileTreeItem,
	rawTitle: string,
	prefixMatch: ReturnType<typeof parseNumericPrefix>,
	settings: Pick<
		PrefixDisplaySettings,
		| "prefixDisplayMode"
		| "prefixPattern"
		| "showMissingPrefixBadge"
		| "showHiddenItemBadge"
	>,
	badgeTextSettings: Pick<
		PrefixDisplaySettings,
		| "hiddenItemBadgeText"
		| "missingPrefixBadgeText"
		| "tooltipHiddenItem"
		| "tooltipMissingPrefix"
	>,
): ExtraBadgeDescriptor[] {
	if (settings.showHiddenItemBadge && isHiddenItem(rawTitle)) {
		return [
			{
				slotClass: "o-decimal-prefix-badge-hidden-file",
				text: badgeTextSettings.hiddenItemBadgeText,
				tooltip: badgeTextSettings.tooltipHiddenItem,
			},
		];
	}

	if (settings.showMissingPrefixBadge && !prefixMatch) {
		return [
			{
				slotClass: "o-decimal-prefix-badge-warning",
				text: badgeTextSettings.missingPrefixBadgeText,
				tooltip: badgeTextSettings.tooltipMissingPrefix,
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

function appendTitleText(innerEl: HTMLElement, text: string, rawTitle: string): void {
	innerEl.createSpan({
		cls: "o-decimal-prefix-badge-text",
		text,
		title: rawTitle,
	});
}

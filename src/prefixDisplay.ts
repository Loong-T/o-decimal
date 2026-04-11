import { setIcon, TFolder } from "obsidian";
import {
	findMatchingConditionalBadgeRule,
	getConditionalBadgeRuleIconId,
	type ConditionalBadgeRule,
} from "./conditionalBadgeRules";
import type { InternalFileTreeItem } from "./fileExplorer";
import { parseNumericPrefix, stripNumericPrefix } from "./prefix";
import type { ODecimalSettings } from "./settings";

interface ExtraBadgeDescriptor {
	slotClass: string;
	text: string;
	tooltip: string;
	icon?: string;
	customSvg?: string;
	backgroundColor?: string;
	textColor?: string;
}

interface PrefixDisplaySettings {
	prefixDisplayMode: ODecimalSettings["prefixDisplayMode"];
	prefixPattern: ODecimalSettings["prefixPattern"];
	conditionalBadgeRules: ODecimalSettings["conditionalBadgeRules"];
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
	const extraBadge = getExtraBadge(item, rawTitle, prefixMatch, settings);

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
		renderBadge(innerEl, extraBadge);
		appendTitleText(innerEl, rawTitle, rawTitle);
		return;
	}

	if (settings.prefixDisplayMode === "hidden") {
		innerEl.addClass("o-decimal-prefix-hidden");
		renderBadge(innerEl, extraBadge);
		appendTitleText(
			innerEl,
			stripNumericPrefix(rawTitle, settings.prefixPattern),
			rawTitle,
		);
		return;
	}

	innerEl.addClass("o-decimal-prefix-badge", prefixBadgeKindClass);
	innerEl.setAttribute("data-o-decimal-prefix", prefixMatch.rawPrefix);
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

function getExtraBadge(
	item: InternalFileTreeItem,
	rawTitle: string,
	prefixMatch: ReturnType<typeof parseNumericPrefix>,
	settings: PrefixDisplaySettings,
): ExtraBadgeDescriptor | null {
	if (prefixMatch && settings.prefixDisplayMode === "badge") {
		return null;
	}

	const conditionalRule = findMatchingConditionalBadgeRule(
		settings.conditionalBadgeRules,
		{
			file: item.file,
			rawTitle,
		},
	);
	if (conditionalRule) {
		return toConditionalBadgeDescriptor(conditionalRule);
	}

	if (settings.showHiddenItemBadge && isHiddenItem(rawTitle)) {
		return {
			slotClass: "o-decimal-prefix-badge-hidden-file",
			text: settings.hiddenItemBadgeText,
			tooltip: settings.tooltipHiddenItem,
		};
	}

	if (settings.showMissingPrefixBadge && !prefixMatch) {
		return {
			slotClass: "o-decimal-prefix-badge-warning",
			text: settings.missingPrefixBadgeText,
			tooltip: settings.tooltipMissingPrefix,
		};
	}

	return null;
}

function isHiddenItem(rawTitle: string): boolean {
	return rawTitle.startsWith(".");
}

function renderBadge(innerEl: HTMLElement, badge: ExtraBadgeDescriptor | null): void {
	if (!badge) {
		return;
	}

	innerEl.addClass("o-decimal-prefix-has-extra-badges");
	const badgeEl = innerEl.createSpan({
		cls: `o-decimal-prefix-badge-chip ${badge.slotClass}`,
		attr: {
			title: badge.tooltip,
		},
	});
	const backgroundColor = badge.backgroundColor ?? "";
	if (backgroundColor.trim().length > 0) {
		badgeEl.style.background = backgroundColor;
	}
	const textColor = badge.textColor ?? "";
	if (textColor.trim().length > 0) {
		badgeEl.style.color = textColor;
	}
	if (badge.icon || (badge.customSvg ?? "").trim().length > 0) {
		const iconEl = badgeEl.createSpan({
			cls: "o-decimal-prefix-badge-icon",
		});
		if ((badge.customSvg ?? "").trim().length > 0) {
			renderInlineSvg(iconEl, badge.customSvg ?? "");
		} else {
			safeSetIcon(iconEl, badge.icon ?? "");
		}
	}
	if (badge.text.trim().length > 0) {
		badgeEl.createSpan({
			cls: "o-decimal-prefix-badge-label",
			text: badge.text,
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

function toConditionalBadgeDescriptor(
	rule: ConditionalBadgeRule,
): ExtraBadgeDescriptor {
	return {
		slotClass: "o-decimal-prefix-badge-conditional",
		text: rule.text,
		tooltip: rule.tooltip || rule.pattern,
		icon: getConditionalBadgeRuleIconId(rule) ?? undefined,
		customSvg: rule.customSvg,
		backgroundColor: rule.backgroundColor,
		textColor: rule.textColor,
	};
}

function safeSetIcon(el: HTMLElement, icon: string): void {
	if (icon.trim().length === 0) {
		return;
	}

	try {
		setIcon(el, icon);
	} catch {
		el.empty();
	}
}

function renderInlineSvg(containerEl: HTMLElement, svgContent: string): void {
	containerEl.empty();
	const parsedDocument = new DOMParser().parseFromString(
		svgContent,
		"image/svg+xml",
	);
	const svgEl = parsedDocument.querySelector("svg");
	if (!(svgEl instanceof SVGSVGElement)) {
		return;
	}

	containerEl.appendChild(document.importNode(svgEl, true));
	const mountedSvgEl = containerEl.querySelector("svg");
	if (!(mountedSvgEl instanceof SVGSVGElement)) {
		return;
	}

	mountedSvgEl.addClass("o-decimal-inline-svg");
	mountedSvgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
	mountedSvgEl.setAttribute("width", "100%");
	mountedSvgEl.setAttribute("height", "100%");
}

import { setIcon, TFolder } from "obsidian";
import { type ConditionalBadgeRule, findMatchingConditionalBadgeRule, getConditionalBadgeRuleIconId } from "./conditionalBadgeRules";
import { getExplorerDisplayNameForName, type InternalFileTreeItem } from "./fileExplorer";
import { parseNumericPrefix, stripNumericPrefix } from "./prefix";
import type { ODecimalSettings } from "./settings";
import {
	findMatchingStatusSuffixRule,
	getStatusSuffixRuleIconId,
	removeMatchedStatusSuffix,
	splitNameForStatusSuffix,
	type StatusSuffixRule,
} from "./statusSuffixRules";

interface BadgeDescriptor {
	slotClass: string;
	text: string;
	tooltip: string;
	icon?: string;
	customSvg?: string;
	backgroundColor?: string;
	textColor?: string;
	statusRuleId?: string;
}

interface PrefixDisplayOptions {
	rawName: string;
	displayName: string;
	prefixDisplayMode: ODecimalSettings["prefixDisplayMode"];
	prefixPattern: ODecimalSettings["prefixPattern"];
	conditionalBadgeRules: ODecimalSettings["conditionalBadgeRules"];
	statusSuffixRules: ODecimalSettings["statusSuffixRules"];
	hideMatchedStatusSuffix: ODecimalSettings["hideMatchedStatusSuffix"];
	showStatusSuffixTrailingBadge: ODecimalSettings["showStatusSuffixTrailingBadge"];
	showMissingPrefixBadge: ODecimalSettings["showMissingPrefixBadge"];
	showHiddenItemBadge: ODecimalSettings["showHiddenItemBadge"];
	hiddenItemBadgeText: ODecimalSettings["hiddenItemBadgeText"];
	missingPrefixBadgeText: ODecimalSettings["missingPrefixBadgeText"];
	tooltipHiddenItem: string;
	tooltipMissingPrefix: string;
	tooltipPrefixBadgeLabel: string;
	tooltipStatusSuffixLabel: string;
}

export function applyPrefixDisplay(
	item: InternalFileTreeItem,
	options: PrefixDisplayOptions,
): void {
	const { innerEl } = item;
	const statusMatch = findMatchingStatusSuffixRule(options.statusSuffixRules, {
		file: item.file,
		fullName: options.rawName,
		matchableName: splitNameForStatusSuffix(item.file).matchableName,
	});
	const rawNameWithoutStatus = statusMatch
		? buildNameWithoutStatus(item, statusMatch)
		: options.rawName;
	const displayNameWithoutStatus = getExplorerDisplayNameForName(
		item.file,
		rawNameWithoutStatus,
	);
	const effectiveDisplayName =
		options.hideMatchedStatusSuffix && statusMatch
			? displayNameWithoutStatus
			: options.displayName;
	const prefixMatch = parseNumericPrefix(
		effectiveDisplayName,
		options.prefixPattern,
	);
	const prefixBadgeKindClass = item.file instanceof TFolder
		? "o-decimal-prefix-badge-folder"
		: "o-decimal-prefix-badge-file";
	const leadingBadge = getLeadingBadge(item, {
		...options,
		rawName: options.rawName,
		displayName: effectiveDisplayName,
	}, statusMatch, prefixMatch, prefixBadgeKindClass);
	const trailingBadge = getTrailingStatusBadge(
		statusMatch?.rule ?? null,
		statusMatch?.matchedText ?? "",
		options,
	);
	const renderedTitle = getRenderedTitleText(
		effectiveDisplayName,
		prefixMatch,
		options,
		!!statusMatch && !options.showStatusSuffixTrailingBadge,
	);

	innerEl.empty();
	innerEl.removeClass(
		"o-decimal-prefix-hidden",
		"o-decimal-prefix-badge",
		"o-decimal-prefix-badge-file",
		"o-decimal-prefix-badge-folder",
		"o-decimal-prefix-has-extra-badges",
		"o-decimal-prefix-has-trailing-badge",
	);
	innerEl.removeAttribute("data-o-decimal-prefix");
	innerEl.setAttribute("title", options.rawName);

	if (options.prefixDisplayMode === "hidden") {
		innerEl.addClass("o-decimal-prefix-hidden");
	} else if (leadingBadge?.slotClass === prefixBadgeKindClass) {
		innerEl.addClass("o-decimal-prefix-badge", prefixBadgeKindClass);
		if (prefixMatch) {
			innerEl.setAttribute("data-o-decimal-prefix", prefixMatch.rawPrefix);
		}
	}

	renderBadge(innerEl, leadingBadge, "o-decimal-prefix-has-extra-badges");
	appendTitleText(innerEl, renderedTitle, options.rawName);
	renderBadge(innerEl, trailingBadge, "o-decimal-prefix-has-trailing-badge");
}

export function restoreRawTitle(item: InternalFileTreeItem, rawTitle: string): void {
	item.innerEl.empty();
	item.innerEl.removeClass(
		"o-decimal-prefix-hidden",
		"o-decimal-prefix-badge",
		"o-decimal-prefix-badge-file",
		"o-decimal-prefix-badge-folder",
		"o-decimal-prefix-has-extra-badges",
		"o-decimal-prefix-has-trailing-badge",
	);
	item.innerEl.removeAttribute("data-o-decimal-prefix");
	item.innerEl.setText(rawTitle);
}

function buildNameWithoutStatus(
	item: InternalFileTreeItem,
	match: NonNullable<ReturnType<typeof findMatchingStatusSuffixRule>>,
): string {
	const parts = splitNameForStatusSuffix(item.file);
	const cleanBaseName = removeMatchedStatusSuffix(parts.matchableName, match);
	return `${cleanBaseName}${parts.extensionSuffix}`;
}

function getLeadingBadge(
	item: InternalFileTreeItem,
	options: PrefixDisplayOptions,
	statusMatch: ReturnType<typeof findMatchingStatusSuffixRule>,
	prefixMatch: ReturnType<typeof parseNumericPrefix>,
	prefixBadgeKindClass: string,
): BadgeDescriptor | null {
	if (statusMatch && !options.showStatusSuffixTrailingBadge) {
		return toStatusBadgeDescriptor(
			statusMatch.rule,
			statusMatch.matchedText,
			options.tooltipStatusSuffixLabel,
			"o-decimal-prefix-badge-status",
		);
	}

	if (prefixMatch && options.prefixDisplayMode === "badge") {
		return {
			slotClass: prefixBadgeKindClass,
			text: prefixMatch.badgeText,
			tooltip: `${options.tooltipPrefixBadgeLabel}: ${prefixMatch.rawPrefix}`,
		};
	}

	const conditionalRule = findMatchingConditionalBadgeRule(
		options.conditionalBadgeRules,
		{
			file: item.file,
			rawTitle: options.displayName,
		},
	);
	if (conditionalRule) {
		return toConditionalBadgeDescriptor(conditionalRule);
	}

	if (options.showHiddenItemBadge && isHiddenItem(options.rawName)) {
		return {
			slotClass: "o-decimal-prefix-badge-hidden-file",
			text: options.hiddenItemBadgeText,
			tooltip: options.tooltipHiddenItem,
		};
	}

	if (options.showMissingPrefixBadge && !prefixMatch) {
		return {
			slotClass: "o-decimal-prefix-badge-warning",
			text: options.missingPrefixBadgeText,
			tooltip: options.tooltipMissingPrefix,
		};
	}

	return null;
}

function getTrailingStatusBadge(
	rule: StatusSuffixRule | null,
	matchedText: string,
	options: Pick<
		PrefixDisplayOptions,
		"showStatusSuffixTrailingBadge" | "tooltipStatusSuffixLabel"
	>,
): BadgeDescriptor | null {
	if (!rule || !options.showStatusSuffixTrailingBadge) {
		return null;
	}

	return toStatusBadgeDescriptor(
		rule,
		matchedText,
		options.tooltipStatusSuffixLabel,
		"o-decimal-prefix-badge-status-trailing",
	);
}

function getRenderedTitleText(
	displayName: string,
	prefixMatch: ReturnType<typeof parseNumericPrefix>,
	options: Pick<PrefixDisplayOptions, "prefixDisplayMode" | "prefixPattern">,
	hasStatusBadge: boolean,
): string {
	if (!prefixMatch || options.prefixDisplayMode === "original") {
		return displayName;
	}

	if (
		options.prefixDisplayMode === "hidden" ||
		(options.prefixDisplayMode === "badge" && hasStatusBadge)
	) {
		return stripNumericPrefix(displayName, options.prefixPattern);
	}

	return prefixMatch.rest;
}

function toConditionalBadgeDescriptor(rule: ConditionalBadgeRule): BadgeDescriptor {
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

function toStatusBadgeDescriptor(
	rule: StatusSuffixRule,
	matchedText: string,
	tooltipLabel: string,
	slotClass: string,
): BadgeDescriptor {
	return {
		slotClass,
		text: rule.text,
		tooltip: rule.tooltip || `${tooltipLabel}: ${matchedText}`,
		icon: getStatusSuffixRuleIconId(rule) ?? undefined,
		customSvg: rule.customSvg,
		backgroundColor: rule.backgroundColor,
		textColor: rule.textColor,
		statusRuleId: rule.id,
	};
}

function isHiddenItem(rawTitle: string): boolean {
	return rawTitle.startsWith(".");
}

function renderBadge(
	innerEl: HTMLElement,
	badge: BadgeDescriptor | null,
	containerClass: string,
): void {
	if (!badge) {
		return;
	}

	innerEl.addClass(containerClass);
	const badgeEl = innerEl.createSpan({
		cls: `o-decimal-prefix-badge-chip ${badge.slotClass}`,
		attr: {
			title: badge.tooltip,
		},
	});
	if (badge.statusRuleId) {
		badgeEl.setAttribute("data-o-decimal-status-rule", badge.statusRuleId);
	}
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

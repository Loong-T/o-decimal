import { TFile, TFolder, type TAbstractFile } from "obsidian";

export type StatusSuffixTarget = "both" | "file" | "folder";

export interface StatusSuffixRule {
	id: string;
	name: string;
	enabled: boolean;
	target: StatusSuffixTarget;
	pattern: string;
	showInContextMenu: boolean;
	icon: string;
	customSvg: string;
	customSvgName: string;
	backgroundColor: string;
	textColor: string;
	text: string;
	tooltip: string;
}

export interface StatusSuffixMatchContext {
	file: TAbstractFile;
	fullName: string;
	matchableName: string;
}

export interface StatusSuffixMatch {
	rule: StatusSuffixRule;
	matchedText: string;
	matchIndex: number;
}

export interface StatusNameParts {
	matchableName: string;
	extensionSuffix: string;
}

export const DEFAULT_STATUS_SUFFIX_RULES: StatusSuffixRule[] = [
	{
		id: "default-done",
		name: "Done",
		enabled: true,
		target: "both",
		pattern: "_\\[done\\]$",
		showInContextMenu: true,
		icon: "check",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "Done",
	},
];

export function normalizeStatusSuffixRules(value: unknown): StatusSuffixRule[] {
	if (value === undefined || value === null) {
		return DEFAULT_STATUS_SUFFIX_RULES.map(cloneRule);
	}
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map(normalizeStatusSuffixRule)
		.filter((rule): rule is StatusSuffixRule => rule !== null);
}

export function createEmptyStatusSuffixRule(): StatusSuffixRule {
	return {
		id: `status-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		name: "",
		enabled: true,
		target: "both",
		pattern: "",
		showInContextMenu: true,
		icon: "tag",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "",
	};
}

export function getStatusSuffixRuleIconId(rule: StatusSuffixRule): string | null {
	if (rule.customSvg.trim().length > 0) {
		return `o-decimal-status-${rule.id}`;
	}

	return rule.icon.trim().length > 0 ? rule.icon : null;
}

export function deriveStatusSuffixWriteBack(pattern: string): string {
	const trimmedPattern = pattern.trim();
	if (trimmedPattern.length === 0) {
		return "";
	}

	const simplifiedPattern = trimmedPattern
		.replace(/^\^/u, "")
		.replace(/\$$/u, "")
		.replace(/\(\?:/gu, "(")
		.replace(/\\([\\.^$|?*+()[\]{}])/gu, "$1")
		.replace(/[()]/gu, "");

	if (/[|?*+{}]/u.test(simplifiedPattern)) {
		return "";
	}

	return simplifiedPattern;
}

export function splitNameForStatusSuffix(file: TAbstractFile): StatusNameParts {
	if (file instanceof TFolder) {
		return {
			matchableName: file.name,
			extensionSuffix: "",
		};
	}

	if (!(file instanceof TFile)) {
		return {
			matchableName: file.name,
			extensionSuffix: "",
		};
	}

	const dotIndex = file.name.indexOf(".");
	if (dotIndex < 0) {
		return {
			matchableName: file.name,
			extensionSuffix: "",
		};
	}

	return {
		matchableName: file.name.slice(0, dotIndex),
		extensionSuffix: file.name.slice(dotIndex),
	};
}

export function findMatchingStatusSuffixRule(
	rules: StatusSuffixRule[],
	context: StatusSuffixMatchContext,
): StatusSuffixMatch | null {
	for (const rule of rules) {
		if (!rule.enabled) {
			continue;
		}
		if (rule.pattern.trim().length === 0) {
			continue;
		}
		if (!matchesTarget(rule.target, context.file)) {
			continue;
		}

		const match = testRegex(rule.pattern, context.matchableName);
		if (match) {
			return {
				rule,
				matchedText: match[0] ?? "",
				matchIndex: match.index ?? -1,
			};
		}
	}

	return null;
}

export function removeMatchedStatusSuffix(
	matchableName: string,
	match: StatusSuffixMatch | null,
): string {
	if (!match || match.matchIndex < 0) {
		return matchableName;
	}

	return (
		matchableName.slice(0, match.matchIndex) +
		matchableName.slice(match.matchIndex + match.matchedText.length)
	);
}

function normalizeStatusSuffixRule(value: unknown): StatusSuffixRule | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	const candidate = value as Partial<StatusSuffixRule>;
	return {
		id:
			typeof candidate.id === "string" && candidate.id.trim().length > 0
				? candidate.id
				: createEmptyStatusSuffixRule().id,
		name: typeof candidate.name === "string" ? candidate.name.trim() : "",
		enabled: candidate.enabled !== false,
		target: isValidTarget(candidate.target) ? candidate.target : "both",
		pattern: typeof candidate.pattern === "string" ? candidate.pattern.trim() : "",
		showInContextMenu: candidate.showInContextMenu !== false,
		icon: typeof candidate.icon === "string" ? candidate.icon.trim() : "",
		customSvg:
			typeof candidate.customSvg === "string" ? candidate.customSvg.trim() : "",
		customSvgName:
			typeof candidate.customSvgName === "string"
				? candidate.customSvgName.trim()
				: "",
		backgroundColor:
			typeof candidate.backgroundColor === "string"
				? candidate.backgroundColor.trim()
				: "",
		textColor:
			typeof candidate.textColor === "string" ? candidate.textColor.trim() : "",
		text: typeof candidate.text === "string" ? candidate.text : "",
		tooltip: typeof candidate.tooltip === "string" ? candidate.tooltip : "",
	};
}

function cloneRule(rule: StatusSuffixRule): StatusSuffixRule {
	return { ...rule };
}

function isValidTarget(value: unknown): value is StatusSuffixTarget {
	return value === "both" || value === "file" || value === "folder";
}

function matchesTarget(target: StatusSuffixTarget, file: TAbstractFile): boolean {
	if (target === "both") {
		return true;
	}
	if (target === "file") {
		return file instanceof TFile;
	}
	return file instanceof TFolder;
}

function testRegex(pattern: string, value: string): RegExpMatchArray | null {
	try {
		return value.match(new RegExp(pattern, "u"));
	} catch {
		return null;
	}
}

import { TFile, TFolder, type TAbstractFile } from "obsidian";

export type ConditionalBadgeTarget = "both" | "file" | "folder";
export type ConditionalBadgeMatchMode =
	| "full-name-exact"
	| "display-name-exact"
	| "extension-exact"
	| "full-name-regex"
	| "path-regex";

export interface ConditionalBadgeRule {
	id: string;
	name: string;
	enabled: boolean;
	target: ConditionalBadgeTarget;
	matchMode: ConditionalBadgeMatchMode;
	pattern: string;
	icon: string;
	customSvg: string;
	customSvgName: string;
	backgroundColor: string;
	textColor: string;
	text: string;
	tooltip: string;
}

interface ConditionalBadgeMatchContext {
	file: TAbstractFile;
	rawTitle: string;
}

export const DEFAULT_CONDITIONAL_BADGE_RULES: ConditionalBadgeRule[] = [
	{
		id: "default-readme",
		name: "README",
		enabled: true,
		target: "file",
		matchMode: "full-name-exact",
		pattern: "README.md",
		icon: "book-open",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "README",
	},
	{
		id: "default-agent-instructions",
		name: "Agent instructions",
		enabled: true,
		target: "file",
		matchMode: "full-name-regex",
		pattern: "^(?:AGENTS|CLAUDE)\\.md$",
		icon: "bot",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "Agent instructions",
	},
	{
		id: "default-todo",
		name: "Todo",
		enabled: true,
		target: "file",
		matchMode: "full-name-exact",
		pattern: "TODO.md",
		icon: "list-todo",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "TODO",
	},
	{
		id: "default-plan",
		name: "Plan",
		enabled: true,
		target: "file",
		matchMode: "full-name-exact",
		pattern: "PLAN.md",
		icon: "map",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "PLAN",
	},
];

export function normalizeConditionalBadgeRules(
	value: unknown,
): ConditionalBadgeRule[] {
	if (value === undefined || value === null) {
		return DEFAULT_CONDITIONAL_BADGE_RULES.map(cloneRule);
	}
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map(normalizeConditionalBadgeRule)
		.filter((rule): rule is ConditionalBadgeRule => rule !== null);
}

export function findMatchingConditionalBadgeRule(
	rules: ConditionalBadgeRule[],
	context: ConditionalBadgeMatchContext,
): ConditionalBadgeRule | null {
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

		if (matchesPattern(rule, context)) {
			return rule;
		}
	}

	return null;
}

export function createEmptyConditionalBadgeRule(): ConditionalBadgeRule {
	return {
		id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		name: "",
		enabled: true,
		target: "both",
		matchMode: "full-name-exact",
		pattern: "",
		icon: "tag",
		customSvg: "",
		customSvgName: "",
		backgroundColor: "",
		textColor: "",
		text: "",
		tooltip: "",
	};
}

function normalizeConditionalBadgeRule(
	value: unknown,
): ConditionalBadgeRule | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	const candidate = value as Partial<ConditionalBadgeRule>;
	const pattern =
		typeof candidate.pattern === "string" ? candidate.pattern.trim() : "";

	return {
		id:
			typeof candidate.id === "string" && candidate.id.trim().length > 0
				? candidate.id
				: createEmptyConditionalBadgeRule().id,
		name: typeof candidate.name === "string" ? candidate.name.trim() : "",
		enabled: candidate.enabled !== false,
		target: isValidTarget(candidate.target) ? candidate.target : "both",
		matchMode: isValidMatchMode(candidate.matchMode)
			? candidate.matchMode
			: "full-name-exact",
		pattern,
		icon: typeof candidate.icon === "string" ? candidate.icon.trim() : "",
		customSvg: typeof candidate.customSvg === "string" ? candidate.customSvg.trim() : "",
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

export function getConditionalBadgeRuleIconId(
	rule: ConditionalBadgeRule,
): string | null {
	if (rule.customSvg.trim().length > 0) {
		return `o-decimal-conditional-${rule.id}`;
	}

	return rule.icon.trim().length > 0 ? rule.icon : null;
}

function cloneRule(rule: ConditionalBadgeRule): ConditionalBadgeRule {
	return { ...rule };
}

function isValidTarget(value: unknown): value is ConditionalBadgeTarget {
	return value === "both" || value === "file" || value === "folder";
}

function isValidMatchMode(value: unknown): value is ConditionalBadgeMatchMode {
	return (
		value === "full-name-exact" ||
		value === "display-name-exact" ||
		value === "extension-exact" ||
		value === "full-name-regex" ||
		value === "path-regex"
	);
}

function matchesTarget(target: ConditionalBadgeTarget, file: TAbstractFile): boolean {
	if (target === "both") {
		return true;
	}

	if (target === "file") {
		return file instanceof TFile;
	}

	return file instanceof TFolder;
}

function matchesPattern(
	rule: ConditionalBadgeRule,
	context: ConditionalBadgeMatchContext,
): boolean {
	if (rule.matchMode === "full-name-exact") {
		return equalsIgnoreCase(context.file.name, rule.pattern);
	}

	if (rule.matchMode === "display-name-exact") {
		return equalsIgnoreCase(context.rawTitle, rule.pattern);
	}

	if (rule.matchMode === "extension-exact") {
		if (!(context.file instanceof TFile)) {
			return false;
		}
		return equalsIgnoreCase(context.file.extension, rule.pattern);
	}

	if (rule.matchMode === "full-name-regex") {
		return testRegex(rule.pattern, context.file.name);
	}

	return testRegex(rule.pattern, context.file.path);
}

function equalsIgnoreCase(left: string, right: string): boolean {
	return left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0;
}

function testRegex(pattern: string, value: string): boolean {
	try {
		return new RegExp(pattern, "u").test(value);
	} catch {
		return false;
	}
}

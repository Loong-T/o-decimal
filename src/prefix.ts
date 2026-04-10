export const DEFAULT_NUMERIC_PREFIX_PATTERNS = [
	"^(\\d+)_",
	"^((?:\\d+-\\d+))_",
];

export const DEFAULT_NUMERIC_PREFIX_PATTERN =
	DEFAULT_NUMERIC_PREFIX_PATTERNS.join("\n");

export interface NumericPrefixMatch {
	rawPrefix: string;
	badgeText: string;
	numericText: string | null;
	numericValue: number | null;
	rest: string;
}

export function parseNumericPrefix(
	name: string,
	patternSource: string = DEFAULT_NUMERIC_PREFIX_PATTERN,
): NumericPrefixMatch | null {
	for (const pattern of compilePrefixPatterns(patternSource)) {
		const match = name.match(pattern);
		if (!match) {
			continue;
		}

		const badgeText = match[1] ?? "";
		const numericText = findNumericText(badgeText) ?? findNumericText(match[0]);

		return {
			rawPrefix: match[0],
			badgeText,
			numericText,
			numericValue: numericText ? Number.parseInt(numericText, 10) : null,
			rest: name.slice(match[0].length),
		};
	}

	return null;
}

export function stripNumericPrefix(
	name: string,
	patternSource: string = DEFAULT_NUMERIC_PREFIX_PATTERN,
): string {
	return parseNumericPrefix(name, patternSource)?.rest ?? name;
}

export function comparePrefixedNames(
	a: string,
	b: string,
	patternSource: string = DEFAULT_NUMERIC_PREFIX_PATTERN,
): number {
	const aPrefix = parseNumericPrefix(a, patternSource);
	const bPrefix = parseNumericPrefix(b, patternSource);

	if (aPrefix && !bPrefix) {
		return -1;
	}

	if (!aPrefix && bPrefix) {
		return 1;
	}

	if (aPrefix && bPrefix) {
		if (
			aPrefix.numericValue !== null &&
			bPrefix.numericValue !== null &&
			aPrefix.numericValue !== bPrefix.numericValue
		) {
			return aPrefix.numericValue - bPrefix.numericValue;
		}

		const prefixTextComparison = compareText(
			aPrefix.badgeText || aPrefix.rawPrefix,
			bPrefix.badgeText || bPrefix.rawPrefix,
		);
		if (prefixTextComparison !== 0) {
			return prefixTextComparison;
		}

		return compareText(aPrefix.rest, bPrefix.rest);
	}

	return compareText(a, b);
}

export function normalizePrefixPatternSource(patternSource: string): string {
	const normalizedRules = splitPrefixPatternSources(patternSource);
	return normalizedRules.length > 0
		? normalizedRules.join("\n")
		: DEFAULT_NUMERIC_PREFIX_PATTERN;
}

function compilePrefixPatterns(patternSource: string): RegExp[] {
	const compiledPatterns = splitPrefixPatternSources(patternSource)
		.map(compilePrefixPattern)
		.filter((pattern): pattern is RegExp => pattern !== null);

	if (compiledPatterns.length > 0) {
		return compiledPatterns;
	}

	return DEFAULT_NUMERIC_PREFIX_PATTERNS
		.map(compilePrefixPattern)
		.filter((pattern): pattern is RegExp => pattern !== null);
}

function splitPrefixPatternSources(patternSource: string): string[] {
	return patternSource
		.split(/\r?\n/u)
		.map((rule) => rule.trim())
		.filter((rule) => rule.length > 0);
}

function compilePrefixPattern(patternSource: string): RegExp | null {
	try {
		return new RegExp(patternSource);
	} catch {
		return null;
	}
}

function findNumericText(value: string): string | null {
	const match = value.match(/\d+/);
	return match?.[0] ?? null;
}

function compareText(a: string, b: string): number {
	return a.localeCompare(b, undefined, {
		numeric: false,
		sensitivity: "base",
	});
}

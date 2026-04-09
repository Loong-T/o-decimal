export const DEFAULT_NUMERIC_PREFIX_PATTERN = "^(\\d+)_";

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
	const pattern = compilePrefixPattern(patternSource);
	const match = name.match(pattern);
	if (!match) {
		return null;
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

function compilePrefixPattern(patternSource: string): RegExp {
	try {
		return new RegExp(patternSource);
	} catch {
		return new RegExp(DEFAULT_NUMERIC_PREFIX_PATTERN);
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

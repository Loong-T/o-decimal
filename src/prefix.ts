const NUMERIC_PREFIX_PATTERN = /^(\d+)_/;

export interface NumericPrefixMatch {
	rawPrefix: string;
	numericText: string;
	numericValue: number;
	rest: string;
}

export function parseNumericPrefix(name: string): NumericPrefixMatch | null {
	const match = name.match(NUMERIC_PREFIX_PATTERN);
	const numericText = match?.[1];
	if (!match || !numericText) {
		return null;
	}

	return {
		rawPrefix: match[0],
		numericText,
		numericValue: Number.parseInt(numericText, 10),
		rest: name.slice(match[0].length),
	};
}

export function stripNumericPrefix(name: string): string {
	return parseNumericPrefix(name)?.rest ?? name;
}

export function comparePrefixedNames(a: string, b: string): number {
	const aPrefix = parseNumericPrefix(a);
	const bPrefix = parseNumericPrefix(b);

	if (aPrefix && !bPrefix) {
		return -1;
	}

	if (!aPrefix && bPrefix) {
		return 1;
	}

	if (aPrefix && bPrefix) {
		if (aPrefix.numericValue !== bPrefix.numericValue) {
			return aPrefix.numericValue - bPrefix.numericValue;
		}

		return compareText(aPrefix.rest, bPrefix.rest);
	}

	return compareText(a, b);
}

function compareText(a: string, b: string): number {
	return a.localeCompare(b, undefined, {
		numeric: false,
		sensitivity: "base",
	});
}

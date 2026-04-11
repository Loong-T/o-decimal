import type { ConditionalBadgeRule } from "./conditionalBadgeRules";
import type {
	PrefixStyleSettings,
	PrefixStyleSlotId,
} from "./prefixStyle";

export function updatePrefixStyleSlot(
	settings: PrefixStyleSettings,
	slotId: PrefixStyleSlotId,
	update: Partial<PrefixStyleSettings["slots"][PrefixStyleSlotId]>,
): PrefixStyleSettings {
	return {
		...settings,
		slots: {
			...settings.slots,
			[slotId]: {
				...settings.slots[slotId],
				...update,
			},
		},
	};
}

export function updateConditionalBadgeRuleAt(
	rules: ConditionalBadgeRule[],
	index: number,
	update: Partial<ConditionalBadgeRule>,
): ConditionalBadgeRule[] {
	return rules.map((rule, currentIndex) =>
		currentIndex === index
			? {
				...rule,
				...update,
			}
			: rule,
	);
}

export function moveConditionalBadgeRule(
	rules: ConditionalBadgeRule[],
	fromIndex: number,
	toIndex: number,
): ConditionalBadgeRule[] {
	if (
		fromIndex === toIndex ||
		fromIndex < 0 ||
		toIndex < 0 ||
		fromIndex >= rules.length ||
		toIndex >= rules.length
	) {
		return rules;
	}

	const nextRules = [...rules];
	const [movedRule] = nextRules.splice(fromIndex, 1);
	if (!movedRule) {
		return rules;
	}

	nextRules.splice(toIndex, 0, movedRule);
	return nextRules;
}

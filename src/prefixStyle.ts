export type PrefixDisplayMode = "original" | "badge" | "hidden";
export type TreeItemTypePriority = "mixed" | "folders-first" | "files-first";
export type PrefixStyleSlotId = "fileBadge" | "folderBadge";

export interface PrefixStyleSlotSettings {
	backgroundColor: string;
	textColor: string;
	backgroundOpacity: number;
}

export interface PrefixStyleSettings {
	badgeRadius: number;
	slots: Record<PrefixStyleSlotId, PrefixStyleSlotSettings>;
	advancedCss: string;
}

export interface PrefixStyleSlotDefinition {
	id: PrefixStyleSlotId;
	className: string;
	defaultBackgroundColor: string;
	defaultTextColor: string;
	defaultBackgroundOpacity: number;
	colorPickerFallback: string;
	textColorPickerFallback: string;
}

export const PREFIX_STYLE_SLOT_DEFINITIONS: PrefixStyleSlotDefinition[] = [
	{
		id: "fileBadge",
		className: "o-decimal-prefix-badge-file",
		defaultBackgroundColor: "var(--interactive-accent)",
		defaultTextColor: "var(--text-accent)",
		defaultBackgroundOpacity: 18,
		colorPickerFallback: "#7c6cff",
		textColorPickerFallback: "#7c6cff",
	},
	{
		id: "folderBadge",
		className: "o-decimal-prefix-badge-folder",
		defaultBackgroundColor: "var(--interactive-accent)",
		defaultTextColor: "white",
		defaultBackgroundOpacity: 78,
		colorPickerFallback: "#7c6cff",
		textColorPickerFallback: "#ffffff",
	},
];

export const DEFAULT_PREFIX_STYLE_SETTINGS: PrefixStyleSettings = {
	badgeRadius: 999,
	slots: {
		fileBadge: {
			backgroundColor: "",
			textColor: "",
			backgroundOpacity: 18,
		},
		folderBadge: {
			backgroundColor: "",
			textColor: "",
			backgroundOpacity: 78,
		},
	},
	advancedCss: "",
};

export function normalizePrefixStyleSettings(
	value: Partial<PrefixStyleSettings> | null | undefined,
): PrefixStyleSettings {
	return {
		badgeRadius:
			typeof value?.badgeRadius === "number"
				? clamp(value.badgeRadius, 0, 999)
				: DEFAULT_PREFIX_STYLE_SETTINGS.badgeRadius,
		slots: {
			fileBadge: normalizeSlotSettings("fileBadge", value?.slots?.fileBadge),
			folderBadge: normalizeSlotSettings("folderBadge", value?.slots?.folderBadge),
		},
		advancedCss: typeof value?.advancedCss === "string" ? value.advancedCss : "",
	};
}

export function buildPrefixStyleCss(settings: PrefixStyleSettings): string {
	const declarations: string[] = [
		`--o-decimal-badge-radius: ${settings.badgeRadius}px;`,
	];

	for (const definition of PREFIX_STYLE_SLOT_DEFINITIONS) {
		const slotSettings = settings.slots[definition.id];
		const backgroundColor = slotSettings.backgroundColor || definition.defaultBackgroundColor;
		const textColor = slotSettings.textColor || definition.defaultTextColor;
		const backgroundOpacity = clamp(slotSettings.backgroundOpacity, 0, 100);

		declarations.push(
			`--o-decimal-${definition.id}-background-color: ${backgroundColor};`,
			`--o-decimal-${definition.id}-text-color: ${textColor};`,
			`--o-decimal-${definition.id}-background-opacity: ${backgroundOpacity}%;`,
		);
	}

	const advancedCss = settings.advancedCss.trim();
	return [
		`.workspace {`,
		...declarations.map((line) => `\t${line}`),
		`}`,
		advancedCss,
	]
		.filter((block) => block.trim().length > 0)
		.join("\n\n");
}

function normalizeSlotSettings(
	slotId: PrefixStyleSlotId,
	value: Partial<PrefixStyleSlotSettings> | null | undefined,
): PrefixStyleSlotSettings {
	const defaults = DEFAULT_PREFIX_STYLE_SETTINGS.slots[slotId];
	return {
		backgroundColor: typeof value?.backgroundColor === "string" ? value.backgroundColor : defaults.backgroundColor,
		textColor: typeof value?.textColor === "string" ? value.textColor : defaults.textColor,
		backgroundOpacity:
			typeof value?.backgroundOpacity === "number"
				? clamp(value.backgroundOpacity, 0, 100)
				: defaults.backgroundOpacity,
	};
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

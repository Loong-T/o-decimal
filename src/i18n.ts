import { getLanguage } from "obsidian";

export type PluginLanguage = "auto" | "en" | "zh";
type SupportedLanguage = "en" | "zh";

type TranslationKey =
	| "languageName"
	| "languageDesc"
	| "languageAuto"
	| "languageEnglish"
	| "languageChinese"
	| "settingsSectionHeading"
	| "enableMixedSortingName"
	| "enableMixedSortingDesc"
	| "prefixDisplayModeName"
	| "prefixDisplayModeDesc"
	| "prefixDisplayModeOriginal"
	| "prefixDisplayModeBadge"
	| "prefixDisplayModeHidden"
	| "typePriorityName"
	| "typePriorityDesc"
	| "typePriorityMixed"
	| "typePriorityFoldersFirst"
	| "typePriorityFilesFirst"
	| "badgeStylesHeading"
	| "badgeRadiusName"
	| "badgeRadiusDesc"
	| "fileBadgeHeading"
	| "folderBadgeHeading"
	| "badgeBackgroundColorName"
	| "badgeBackgroundColorDesc"
	| "badgeTextColorName"
	| "badgeTextColorDesc"
	| "badgeBackgroundOpacityName"
	| "badgeBackgroundOpacityDesc"
	| "advancedStylesSummary"
	| "advancedCustomCssName"
	| "advancedCustomCssDesc"
	| "advancedCustomCssPlaceholder"
	| "advancedCustomCssHelpTitle"
	| "advancedCustomCssHelp1"
	| "advancedCustomCssHelp2"
	| "resetThemeDefault";

const TRANSLATIONS: Record<
	SupportedLanguage,
	Record<TranslationKey, string>
> = {
	en: {
		languageName: "Language",
		languageDesc: "Choose the language used by this plugin's settings.",
		languageAuto: "Follow Obsidian",
		languageEnglish: "English",
		languageChinese: "Chinese",
		settingsSectionHeading: "File explorer",
		enableMixedSortingName: "Enable numeric mixed sorting",
		enableMixedSortingDesc:
			"Sort files and folders together by numeric prefix inside each folder.",
		prefixDisplayModeName: "Prefix display",
		prefixDisplayModeDesc:
			"Choose how numeric prefixes are shown in the file explorer. Renaming always restores the original filename.",
		prefixDisplayModeOriginal: "Original",
		prefixDisplayModeBadge: "Badge",
		prefixDisplayModeHidden: "Hidden",
		typePriorityName: "Type priority",
		typePriorityDesc:
			"Available only when numeric mixed sorting is enabled.",
		typePriorityMixed: "Mixed",
		typePriorityFoldersFirst: "Folders first",
		typePriorityFilesFirst: "Files first",
		badgeStylesHeading: "Badge styles",
		badgeRadiusName: "Badge radius",
		badgeRadiusDesc: "Controls the roundness of every generated badge.",
		fileBadgeHeading: "File badge",
		folderBadgeHeading: "Folder badge",
		badgeBackgroundColorName: "Background color",
		badgeBackgroundColorDesc:
			"Pick a custom badge background color, or reset to use the theme default.",
		badgeTextColorName: "Text color",
		badgeTextColorDesc:
			"Pick a custom badge text color, or reset to use the theme default.",
		badgeBackgroundOpacityName: "Background opacity",
		badgeBackgroundOpacityDesc:
			"Adjust how strong the badge background appears.",
		advancedStylesSummary: "Advanced custom styles",
		advancedCustomCssName: "Custom CSS override",
		advancedCustomCssDesc:
			"Optional CSS appended after the generated style tokens. Use this for advanced tweaks or future style slots.",
		advancedCustomCssPlaceholder:
			".o-decimal-prefix-badge-folder .o-decimal-prefix-badge-chip {\n\tcolor: white;\n\tbackground: color-mix(in srgb, var(--interactive-accent) 82%, transparent);\n}",
		advancedCustomCssHelpTitle: "Available hooks",
		advancedCustomCssHelp1:
			"Available selectors include .o-decimal-prefix-badge-file .o-decimal-prefix-badge-chip, .o-decimal-prefix-badge-folder .o-decimal-prefix-badge-chip, and .o-decimal-prefix-badge-text.",
		advancedCustomCssHelp2:
			"Generated variables include --o-decimal-badge-radius, --o-decimal-fileBadge-background-color, --o-decimal-fileBadge-text-color, --o-decimal-folderBadge-background-color, and --o-decimal-folderBadge-text-color.",
		resetThemeDefault: "Use theme default",
	},
	zh: {
		languageName: "语言",
		languageDesc: "选择此插件设置界面使用的语言。",
		languageAuto: "跟随 Obsidian",
		languageEnglish: "英语",
		languageChinese: "中文",
		settingsSectionHeading: "文件树",
		enableMixedSortingName: "启用数字混合排序",
		enableMixedSortingDesc:
			"在每个文件夹内按数字前缀对文件和文件夹统一排序。",
		prefixDisplayModeName: "前缀显示",
		prefixDisplayModeDesc:
			"选择文件树里数字前缀的显示方式。进入重命名时总会恢复原始文件名。",
		prefixDisplayModeOriginal: "显示原名",
		prefixDisplayModeBadge: "Badge",
		prefixDisplayModeHidden: "隐藏前缀",
		typePriorityName: "类型优先级",
		typePriorityDesc: "仅在启用数字混合排序后可用。",
		typePriorityMixed: "混排",
		typePriorityFoldersFirst: "文件夹优先",
		typePriorityFilesFirst: "文件优先",
		badgeStylesHeading: "Badge 样式",
		badgeRadiusName: "Badge 圆角",
		badgeRadiusDesc: "控制所有自动生成的 Badge 的圆角大小。",
		fileBadgeHeading: "文件 Badge",
		folderBadgeHeading: "文件夹 Badge",
		badgeBackgroundColorName: "背景颜色",
		badgeBackgroundColorDesc: "选择自定义背景色，或重置为主题默认色。",
		badgeTextColorName: "文字颜色",
		badgeTextColorDesc: "选择自定义文字颜色，或重置为主题默认色。",
		badgeBackgroundOpacityName: "背景透明度",
		badgeBackgroundOpacityDesc: "调整 Badge 背景的强调强度。",
		advancedStylesSummary: "高级自定义样式",
		advancedCustomCssName: "自定义 CSS 覆盖",
		advancedCustomCssDesc:
			"会追加到自动生成的样式之后，适合更高级的微调，或将来扩展新的样式角色。",
		advancedCustomCssPlaceholder:
			".o-decimal-prefix-badge-folder .o-decimal-prefix-badge-chip {\n\tcolor: white;\n\tbackground: color-mix(in srgb, var(--interactive-accent) 82%, transparent);\n}",
		advancedCustomCssHelpTitle: "可用覆盖入口",
		advancedCustomCssHelp1:
			"可直接覆盖的选择器包括：.o-decimal-prefix-badge-file .o-decimal-prefix-badge-chip、.o-decimal-prefix-badge-folder .o-decimal-prefix-badge-chip、.o-decimal-prefix-badge-text",
		advancedCustomCssHelp2:
			"可用变量包括：--o-decimal-badge-radius、--o-decimal-fileBadge-background-color、--o-decimal-fileBadge-text-color、--o-decimal-folderBadge-background-color、--o-decimal-folderBadge-text-color",
		resetThemeDefault: "使用主题默认值",
	},
};

export function createTranslator(language: PluginLanguage) {
	const resolvedLanguage = resolveLanguage(language);
	return (key: TranslationKey): string => TRANSLATIONS[resolvedLanguage][key];
}

export function resolveLanguage(language: PluginLanguage): SupportedLanguage {
	if (language === "auto") {
		return normalizeLanguage(getLanguage());
	}

	return language;
}

function normalizeLanguage(language: string): SupportedLanguage {
	return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

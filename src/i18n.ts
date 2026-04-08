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
	| "typePriorityName"
	| "typePriorityDesc"
	| "typePriorityMixed"
	| "typePriorityFoldersFirst"
	| "typePriorityFilesFirst";

const TRANSLATIONS: Record<SupportedLanguage, Record<TranslationKey, string>> = {
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
		typePriorityName: "Type priority",
		typePriorityDesc: "Available only when numeric mixed sorting is enabled.",
		typePriorityMixed: "Mixed",
		typePriorityFoldersFirst: "Folders first",
		typePriorityFilesFirst: "Files first",
	},
	zh: {
		languageName: "语言",
		languageDesc: "选择此插件设置界面使用的语言。",
		languageAuto: "跟随 Obsidian",
		languageEnglish: "英语",
		languageChinese: "中文",
		settingsSectionHeading: "文件树",
		enableMixedSortingName: "启用数字混合排序",
		enableMixedSortingDesc: "在每个文件夹内按数字前缀对文件和文件夹统一排序。",
		typePriorityName: "类型优先级",
		typePriorityDesc: "仅在启用数字混合排序后可用。",
		typePriorityMixed: "混排",
		typePriorityFoldersFirst: "文件夹优先",
		typePriorityFilesFirst: "文件优先",
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

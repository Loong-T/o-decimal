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
	| "prefixPatternName"
	| "prefixPatternDesc"
	| "prefixPatternResetTooltip"
	| "prefixPatternPresetsHint"
	| "prefixPatternPresetDefault"
	| "prefixPatternPresetDefaultExample"
	| "prefixPatternPresetRange"
	| "prefixPatternPresetRangeExample"
	| "prefixPatternPresetBracket"
	| "prefixPatternPresetBracketExample"
	| "prefixPatternPresetDot"
	| "prefixPatternPresetDotExample"
	| "prefixPatternPresetSegmented"
	| "prefixPatternPresetSegmentedExample"
	| "tooltipHiddenItem"
	| "tooltipMissingPrefix"
	| "tooltipPrefixBadgeLabel"
	| "commandCyclePrefixDisplayName"
	| "commandSetPrefixDisplayOriginalName"
	| "commandSetPrefixDisplayBadgeName"
	| "commandSetPrefixDisplayHiddenName"
	| "commandToggleMissingPrefixBadgeName"
	| "noticePrefixDisplayChanged"
	| "noticeMissingPrefixBadgeEnabled"
	| "noticeMissingPrefixBadgeDisabled"
	| "showMissingPrefixBadgeName"
	| "showMissingPrefixBadgeDesc"
	| "missingPrefixBadgeTextName"
	| "missingPrefixBadgeTextDesc"
	| "showHiddenItemBadgeName"
	| "showHiddenItemBadgeDesc"
	| "hiddenItemBadgeTextName"
	| "hiddenItemBadgeTextDesc"
	| "showHiddenFilesName"
	| "showHiddenFilesDesc"
	| "showHiddenFilesLoading"
	| "typePriorityName"
	| "typePriorityDesc"
	| "typePriorityMixed"
	| "typePriorityFoldersFirst"
	| "typePriorityFilesFirst"
	| "conditionalBadgesHeading"
	| "conditionalBadgesDesc"
	| "conditionalBadgeRuleSummary"
	| "conditionalBadgeRuleSummaryEmpty"
	| "conditionalBadgeNameName"
	| "conditionalBadgeNameDesc"
	| "conditionalBadgeEnabledName"
	| "conditionalBadgeEnabledDesc"
	| "conditionalBadgeTargetName"
	| "conditionalBadgeTargetDesc"
	| "conditionalBadgeTargetBoth"
	| "conditionalBadgeTargetFile"
	| "conditionalBadgeTargetFolder"
	| "conditionalBadgeMatchModeName"
	| "conditionalBadgeMatchModeDesc"
	| "conditionalBadgeMatchModeFullNameExact"
	| "conditionalBadgeMatchModeDisplayNameExact"
	| "conditionalBadgeMatchModeExtensionExact"
	| "conditionalBadgeMatchModeFullNameRegex"
	| "conditionalBadgeMatchModePathRegex"
	| "conditionalBadgePatternName"
	| "conditionalBadgePatternDesc"
	| "conditionalBadgeIconName"
	| "conditionalBadgeIconDesc"
	| "conditionalBadgeIconDescEmpty"
	| "conditionalBadgeIconDescSelected"
	| "conditionalBadgePickIcon"
	| "conditionalBadgePreviewIcon"
	| "conditionalBadgeClearIcon"
	| "conditionalBadgeCustomSvgName"
	| "conditionalBadgeCustomSvgDesc"
	| "conditionalBadgeCustomSvgDescSelected"
	| "conditionalBadgeChooseSvgFile"
	| "conditionalBadgeClearSvgFile"
	| "conditionalBadgeBackgroundColorName"
	| "conditionalBadgeBackgroundColorDesc"
	| "conditionalBadgeTextColorName"
	| "conditionalBadgeTextColorDesc"
	| "conditionalBadgeTextName"
	| "conditionalBadgeTextDesc"
	| "conditionalBadgeTooltipName"
	| "conditionalBadgeTooltipDesc"
	| "conditionalBadgeDragHandle"
	| "conditionalBadgeDeleteRule"
	| "conditionalBadgeAddRuleName"
	| "conditionalBadgeAddRuleDesc"
	| "conditionalBadgeAddRuleButton"
	| "iconPickerTitle"
	| "iconPickerSearchName"
	| "iconPickerSearchPlaceholder"
	| "iconPickerCommonHeading"
	| "iconPickerNoResults"
	| "iconPickerSelectedLabel"
	| "badgeStylesHeading"
	| "badgeRadiusName"
	| "badgeRadiusDesc"
	| "fileBadgeHeading"
	| "folderBadgeHeading"
	| "conditionBadgeHeading"
	| "warningBadgeHeading"
	| "hiddenBadgeHeading"
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
		prefixPatternName: "Prefix regex",
		prefixPatternDesc:
			"Use one regex rule per line to detect prefixes.\nRules are tried from top to bottom.\nIf a rule includes parentheses, the text inside the first capture group will be shown in the badge.\nIf every rule is invalid, the default rules for 03_Project and 00-09_Project will be used instead.",
		prefixPatternResetTooltip: "Reset to default regex",
		prefixPatternPresetsHint: "Common examples",
		prefixPatternPresetDefault: "Number + underscore",
		prefixPatternPresetDefaultExample: "Example: 03_Project",
		prefixPatternPresetRange: "Numeric range + underscore",
		prefixPatternPresetRangeExample: "Example: 00-09_Project",
		prefixPatternPresetBracket: "Number inside brackets",
		prefixPatternPresetBracketExample: "Example: [23] Project",
		prefixPatternPresetDot: "Number + dot",
		prefixPatternPresetDotExample: "Example: 03. Project",
		prefixPatternPresetSegmented: "Dot-separated numbers",
		prefixPatternPresetSegmentedExample: "Example: 02.389 Project",
		tooltipHiddenItem: "Hidden item",
		tooltipMissingPrefix: "Missing prefix",
		tooltipPrefixBadgeLabel: "Prefix",
		commandCyclePrefixDisplayName: "Prefix display: Cycle",
		commandSetPrefixDisplayOriginalName: "Prefix display: Original",
		commandSetPrefixDisplayBadgeName: "Prefix display: Badge",
		commandSetPrefixDisplayHiddenName: "Prefix display: Hidden",
		commandToggleMissingPrefixBadgeName:
			"Warning badge: Toggle missing prefix",
		noticePrefixDisplayChanged: "Prefix display: {{mode}}",
		noticeMissingPrefixBadgeEnabled: "Missing-prefix warning badge enabled",
		noticeMissingPrefixBadgeDisabled:
			"Missing-prefix warning badge disabled",
		showMissingPrefixBadgeName: "Show missing-prefix warning badge",
		showMissingPrefixBadgeDesc:
			"Adds a yellow warning-style badge to files and folders that do not have a numeric prefix.",
		missingPrefixBadgeTextName: "Missing-prefix badge text",
		missingPrefixBadgeTextDesc:
			"Customize the text shown inside the missing-prefix warning badge.",
		showHiddenItemBadgeName: "Show hidden-item badge",
		showHiddenItemBadgeDesc:
			"Adds a muted gray badge to hidden items such as dotfiles and dotfolders.",
		hiddenItemBadgeTextName: "Hidden-item badge text",
		hiddenItemBadgeTextDesc:
			"Customize the text shown inside the hidden-item badge.",
		showHiddenFilesName: "Show hidden files",
		showHiddenFilesDesc:
			"Reveal hidden files and folders in the file explorer. This may lag in large vaults, so please wait for it to finish.",
		showHiddenFilesLoading: "Updating hidden files…",
		typePriorityName: "Type priority",
		typePriorityDesc:
			"Available only when numeric mixed sorting is enabled.",
		typePriorityMixed: "Mixed",
		typePriorityFoldersFirst: "Folders first",
		typePriorityFilesFirst: "Files first",
		conditionalBadgesHeading: "Conditional badges",
		conditionalBadgesDesc:
			"Only one badge is shown per item. Priority is: prefix badge, first matching conditional rule, hidden-item badge, then missing-prefix badge.",
		conditionalBadgeRuleSummary: "Rule {{index}}: {{name}}",
		conditionalBadgeRuleSummaryEmpty: "Rule {{index}}",
		conditionalBadgeNameName: "Rule name",
		conditionalBadgeNameDesc:
			"Used only for display in settings. It does not affect matching.",
		conditionalBadgeEnabledName: "Enable this rule",
		conditionalBadgeEnabledDesc:
			"Disabled rules stay in the list but do not affect the file explorer.",
		conditionalBadgeTargetName: "Target",
		conditionalBadgeTargetDesc:
			"Limit the rule to files, folders, or both kinds of explorer items.",
		conditionalBadgeTargetBoth: "Files and folders",
		conditionalBadgeTargetFile: "Files only",
		conditionalBadgeTargetFolder: "Folders only",
		conditionalBadgeMatchModeName: "Match mode",
		conditionalBadgeMatchModeDesc:
			"Choose which part of the item should be matched against the pattern.",
		conditionalBadgeMatchModeFullNameExact: "Exact full name",
		conditionalBadgeMatchModeDisplayNameExact: "Exact display name",
		conditionalBadgeMatchModeExtensionExact: "Exact file extension",
		conditionalBadgeMatchModeFullNameRegex: "Regex on full name",
		conditionalBadgeMatchModePathRegex: "Regex on path",
		conditionalBadgePatternName: "Pattern",
		conditionalBadgePatternDesc:
			"Examples: README.md, AGENTS.md, md, ^README(?:\\.md)?$",
		conditionalBadgeIconName: "Icon",
		conditionalBadgeIconDesc: "Choose an icon for this badge.",
		conditionalBadgeIconDescEmpty: "No icon selected. The badge can still show text only.",
		conditionalBadgeIconDescSelected: "Selected icon: {{icon}}",
		conditionalBadgePickIcon: "Choose icon",
		conditionalBadgePreviewIcon: "Current icon preview",
		conditionalBadgeClearIcon: "Clear icon",
		conditionalBadgeCustomSvgName: "Custom SVG",
		conditionalBadgeCustomSvgDesc:
			"Optional SVG file. When provided, it overrides the icon above for this rule and is tinted to follow the badge text color.",
		conditionalBadgeCustomSvgDescSelected: "Selected SVG file: {{file}}",
		conditionalBadgeChooseSvgFile: "Choose SVG file",
		conditionalBadgeClearSvgFile: "Clear SVG file",
		conditionalBadgeBackgroundColorName: "Badge background color",
		conditionalBadgeBackgroundColorDesc:
			"Optional per-rule background color override for this conditional badge.",
		conditionalBadgeTextColorName: "Badge text color",
		conditionalBadgeTextColorDesc:
			"Optional per-rule text and icon color override for this conditional badge.",
		conditionalBadgeTextName: "Badge text",
		conditionalBadgeTextDesc:
			"Optional short label shown next to the icon. Leave empty to show icon only.",
		conditionalBadgeTooltipName: "Tooltip",
		conditionalBadgeTooltipDesc:
			"Optional tooltip shown when hovering the badge.",
		conditionalBadgeDragHandle: "Drag to reorder",
		conditionalBadgeDeleteRule: "Delete rule",
		conditionalBadgeAddRuleName: "Add conditional rule",
		conditionalBadgeAddRuleDesc:
			"Rules are checked from top to bottom after prefix badges and before hidden or missing-prefix fallbacks.",
		conditionalBadgeAddRuleButton: "Add rule",
		iconPickerTitle: "Choose an icon",
		iconPickerSearchName: "Search",
		iconPickerSearchPlaceholder: "Search icons",
		iconPickerCommonHeading: "Recommended",
		iconPickerNoResults: "No icons found.",
		iconPickerSelectedLabel: "Selected",
		badgeStylesHeading: "Badge styles",
		badgeRadiusName: "Badge radius",
		badgeRadiusDesc: "Controls the roundness of every generated badge.",
		fileBadgeHeading: "File badge",
		folderBadgeHeading: "Folder badge",
		conditionBadgeHeading: "Conditional badge",
		warningBadgeHeading: "Missing-prefix badge",
		hiddenBadgeHeading: "Hidden-item badge",
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
		prefixPatternName: "前缀正则",
		prefixPatternDesc:
			"每行填写一条正则规则，用来识别前缀。\n插件会从上到下依次尝试匹配。\n如果规则里有括号，第一捕获组匹配到的内容会显示在 Badge 里。\n如果所有规则都无效，会自动改用覆盖 `03_Project` 和 `00-09_Project` 的默认规则。",
		prefixPatternResetTooltip: "重置为默认正则",
		prefixPatternPresetsHint: "常用示例",
		prefixPatternPresetDefault: "数字加下划线",
		prefixPatternPresetDefaultExample: "例：03_名称",
		prefixPatternPresetRange: "数字范围加下划线",
		prefixPatternPresetRangeExample: "例：00-09_名称",
		prefixPatternPresetBracket: "方括号里的数字",
		prefixPatternPresetBracketExample: "例：[23] 名称",
		prefixPatternPresetDot: "数字加点号",
		prefixPatternPresetDotExample: "例：03. 名称",
		prefixPatternPresetSegmented: "点分隔数字",
		prefixPatternPresetSegmentedExample: "例：02.389 名称",
		tooltipHiddenItem: "隐藏项",
		tooltipMissingPrefix: "缺少前缀",
		tooltipPrefixBadgeLabel: "前缀",
		commandCyclePrefixDisplayName: "前缀显示：循环切换",
		commandSetPrefixDisplayOriginalName: "前缀显示：显示原名",
		commandSetPrefixDisplayBadgeName: "前缀显示：Badge",
		commandSetPrefixDisplayHiddenName: "前缀显示：隐藏前缀",
		commandToggleMissingPrefixBadgeName: "无前缀警告 Badge 切换",
		noticePrefixDisplayChanged: "前缀显示：{{mode}}",
		noticeMissingPrefixBadgeEnabled: "已开启无前缀警告 Badge",
		noticeMissingPrefixBadgeDisabled: "已关闭无前缀警告 Badge",
		showMissingPrefixBadgeName: "显示无前缀警告 Badge",
		showMissingPrefixBadgeDesc:
			"为没有数字前缀的文件和文件夹添加黄色 warning 风格 Badge。",
		missingPrefixBadgeTextName: "无前缀 Badge 文本",
		missingPrefixBadgeTextDesc: "自定义无前缀警告 Badge 里的文本。",
		showHiddenItemBadgeName: "显示隐藏项 Badge",
		showHiddenItemBadgeDesc:
			"为隐藏项（如点文件、点文件夹）添加灰色 Badge。",
		hiddenItemBadgeTextName: "隐藏项 Badge 文本",
		hiddenItemBadgeTextDesc: "自定义隐藏项 Badge 里的文本。",
		showHiddenFilesName: "显示隐藏文件",
		showHiddenFilesDesc:
			"在文件树中显示隐藏文件和隐藏文件夹。大型仓库中切换此选项时可能会有卡顿，请耐心等待。",
		showHiddenFilesLoading: "正在更新隐藏文件…",
		typePriorityName: "类型优先级",
		typePriorityDesc: "仅在启用数字混合排序后可用。",
		typePriorityMixed: "混排",
		typePriorityFoldersFirst: "文件夹优先",
		typePriorityFilesFirst: "文件优先",
		conditionalBadgesHeading: "条件 Badge",
		conditionalBadgesDesc:
			"同一条目只显示一个 Badge。优先级依次为：前缀 Badge、第一条命中的条件规则、隐藏项 Badge、无前缀 Badge。",
		conditionalBadgeRuleSummary: "规则 {{index}}：{{name}}",
		conditionalBadgeRuleSummaryEmpty: "规则 {{index}}",
		conditionalBadgeNameName: "规则名称",
		conditionalBadgeNameDesc: "仅用于设置界面显示，不会影响匹配逻辑。",
		conditionalBadgeEnabledName: "启用此规则",
		conditionalBadgeEnabledDesc: "关闭后规则会保留，但不会影响文件树显示。",
		conditionalBadgeTargetName: "作用对象",
		conditionalBadgeTargetDesc: "限制规则只匹配文件、文件夹，或两者都匹配。",
		conditionalBadgeTargetBoth: "文件和文件夹",
		conditionalBadgeTargetFile: "仅文件",
		conditionalBadgeTargetFolder: "仅文件夹",
		conditionalBadgeMatchModeName: "匹配方式",
		conditionalBadgeMatchModeDesc: "选择要和规则模式进行匹配的字段。",
		conditionalBadgeMatchModeFullNameExact: "完整名称精确匹配",
		conditionalBadgeMatchModeDisplayNameExact: "显示名称精确匹配",
		conditionalBadgeMatchModeExtensionExact: "文件扩展名精确匹配",
		conditionalBadgeMatchModeFullNameRegex: "完整名称正则匹配",
		conditionalBadgeMatchModePathRegex: "路径正则匹配",
		conditionalBadgePatternName: "匹配模式",
		conditionalBadgePatternDesc:
			"例如：README.md、AGENTS.md、md、^README(?:\\.md)?$",
		conditionalBadgeIconName: "图标",
		conditionalBadgeIconDesc: "为这个 Badge 选择图标。",
		conditionalBadgeIconDescEmpty: "当前未选择图标，也可以只显示文本。",
		conditionalBadgeIconDescSelected: "当前图标：{{icon}}",
		conditionalBadgePickIcon: "选择图标",
		conditionalBadgePreviewIcon: "当前图标预览",
		conditionalBadgeClearIcon: "清除图标",
		conditionalBadgeCustomSvgName: "自定义 SVG",
		conditionalBadgeCustomSvgDesc:
			"可选的 SVG 文件。设置后会覆盖上方图标，作为当前规则的专属图标，并会跟随 Badge 文字颜色着色。",
		conditionalBadgeCustomSvgDescSelected: "当前 SVG 文件：{{file}}",
		conditionalBadgeChooseSvgFile: "选择 SVG 文件",
		conditionalBadgeClearSvgFile: "清除 SVG 文件",
		conditionalBadgeBackgroundColorName: "Badge 背景颜色",
		conditionalBadgeBackgroundColorDesc:
			"可选的单条规则背景色覆盖，只影响当前条件 Badge。",
		conditionalBadgeTextColorName: "Badge 文字颜色",
		conditionalBadgeTextColorDesc:
			"可选的单条规则文字和图标颜色覆盖，只影响当前条件 Badge。",
		conditionalBadgeTextName: "Badge 文本",
		conditionalBadgeTextDesc:
			"可选的短文本，会显示在图标旁边。留空则仅显示图标。",
		conditionalBadgeTooltipName: "提示文本",
		conditionalBadgeTooltipDesc: "鼠标悬停在 Badge 上时显示的可选提示。",
		conditionalBadgeDragHandle: "拖动排序",
		conditionalBadgeDeleteRule: "删除规则",
		conditionalBadgeAddRuleName: "添加条件规则",
		conditionalBadgeAddRuleDesc:
			"规则会按从上到下顺序检查，位置在前缀 Badge 之后、隐藏项和无前缀兜底之前。",
		conditionalBadgeAddRuleButton: "添加规则",
		iconPickerTitle: "选择图标",
		iconPickerSearchName: "搜索",
		iconPickerSearchPlaceholder: "搜索图标",
		iconPickerCommonHeading: "常用图标",
		iconPickerNoResults: "没有找到图标。",
		iconPickerSelectedLabel: "已选",
		badgeStylesHeading: "Badge 样式",
		badgeRadiusName: "Badge 圆角",
		badgeRadiusDesc: "控制所有自动生成的 Badge 的圆角大小。",
		fileBadgeHeading: "文件 Badge",
		folderBadgeHeading: "文件夹 Badge",
		conditionBadgeHeading: "条件 Badge",
		warningBadgeHeading: "无前缀 Badge",
		hiddenBadgeHeading: "隐藏项 Badge",
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
	return (
		key: TranslationKey,
		replacements?: Record<string, string>,
	): string => {
		let text = TRANSLATIONS[resolvedLanguage][key];
		if (!replacements) {
			return text;
		}

		for (const [token, value] of Object.entries(replacements)) {
			text = text.split(`{{${token}}}`).join(value);
		}

		return text;
	};
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

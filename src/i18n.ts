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
	| "statusSuffixHeading"
	| "statusSuffixDesc"
	| "hideMatchedStatusSuffixName"
	| "hideMatchedStatusSuffixDesc"
	| "showStatusSuffixTrailingBadgeName"
	| "showStatusSuffixTrailingBadgeDesc"
	| "statusSuffixRuleSummary"
	| "statusSuffixRuleSummaryEmpty"
	| "statusSuffixNameName"
	| "statusSuffixNameDesc"
	| "statusSuffixEnabledName"
	| "statusSuffixEnabledDesc"
	| "statusSuffixTargetName"
	| "statusSuffixTargetDesc"
	| "statusSuffixTargetBoth"
	| "statusSuffixTargetFile"
	| "statusSuffixTargetFolder"
	| "statusSuffixPatternName"
	| "statusSuffixPatternDesc"
	| "statusSuffixReplaceWithName"
	| "statusSuffixReplaceWithDesc"
	| "statusSuffixShowInMenuName"
	| "statusSuffixShowInMenuDesc"
	| "statusSuffixIconName"
	| "statusSuffixIconDescEmpty"
	| "statusSuffixIconDescSelected"
	| "statusSuffixPickIcon"
	| "statusSuffixClearIcon"
	| "statusSuffixCustomSvgName"
	| "statusSuffixCustomSvgDesc"
	| "statusSuffixCustomSvgDescSelected"
	| "statusSuffixChooseSvgFile"
	| "statusSuffixClearSvgFile"
	| "statusSuffixBackgroundColorName"
	| "statusSuffixBackgroundColorDesc"
	| "statusSuffixTextColorName"
	| "statusSuffixTextColorDesc"
	| "statusSuffixTextName"
	| "statusSuffixTextDesc"
	| "statusSuffixTooltipName"
	| "statusSuffixTooltipDesc"
	| "statusSuffixDragHandle"
	| "statusSuffixDeleteRule"
	| "statusSuffixAddRuleName"
	| "statusSuffixAddRuleDesc"
	| "statusSuffixAddRuleButton"
	| "statusSuffixMenuLabel"
	| "statusSuffixMenuSetRule"
	| "statusSuffixMenuClear"
	| "tooltipStatusSuffixLabel"
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
	| "statusBadgeHeading"
	| "statusTrailingBadgeHeading"
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
		languageDesc: "Choose the language for this plugin's settings.",
		languageAuto: "Use Obsidian language",
		languageEnglish: "English",
		languageChinese: "Chinese",
		settingsSectionHeading: "File explorer",
		enableMixedSortingName: "Enable numeric mixed sorting",
		enableMixedSortingDesc:
			"Sort files and folders together by prefix inside each folder.",
		prefixDisplayModeName: "Prefix display",
		prefixDisplayModeDesc:
			"Choose how prefixes appear in the file explorer. Renaming always shows the real filename.",
		prefixDisplayModeOriginal: "Original",
		prefixDisplayModeBadge: "Badge",
		prefixDisplayModeHidden: "Hidden",
		prefixPatternName: "Prefix rule",
		prefixPatternDesc:
			"Use one rule per line.\nRules are checked from top to bottom.\nIf a rule has a capture group, the first captured text is shown in the badge.\nIf all rules are invalid, the built-in defaults are used.",
		prefixPatternResetTooltip: "Reset to default rule",
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
			"Toggle missing-prefix badge",
		noticePrefixDisplayChanged: "Prefix display: {{mode}}",
		noticeMissingPrefixBadgeEnabled: "Missing-prefix badge enabled",
		noticeMissingPrefixBadgeDisabled:
			"Missing-prefix badge disabled",
		showMissingPrefixBadgeName: "Show missing-prefix badge",
		showMissingPrefixBadgeDesc:
			"Show a badge on items without a recognized numeric prefix.",
		missingPrefixBadgeTextName: "Missing-prefix text",
		missingPrefixBadgeTextDesc:
			"Text shown inside the missing-prefix badge.",
		showHiddenItemBadgeName: "Show hidden-item badge",
		showHiddenItemBadgeDesc:
			"Show a badge on hidden items such as dotfiles and dotfolders.",
		hiddenItemBadgeTextName: "Hidden-item text",
		hiddenItemBadgeTextDesc:
			"Text shown inside the hidden-item badge.",
		showHiddenFilesName: "Show hidden files",
		showHiddenFilesDesc:
			"Show hidden files and folders in the file explorer. This may take a moment in large vaults.",
		showHiddenFilesLoading: "Updating hidden files…",
		typePriorityName: "File and folder order",
		typePriorityDesc:
			"Only applies when mixed sorting is enabled.",
		typePriorityMixed: "Mixed",
		typePriorityFoldersFirst: "Folders first",
		typePriorityFilesFirst: "Files first",
		statusSuffixHeading: "Status suffix",
		statusSuffixDesc:
			"Status suffix badges have the highest priority among leading badges. The first matching status rule can also be written back from the file menu.",
		hideMatchedStatusSuffixName: "Hide matched status text",
		hideMatchedStatusSuffixDesc:
			"Hide matched suffix text from the displayed title, such as _[done].",
		showStatusSuffixTrailingBadgeName: "Show trailing status badge",
		showStatusSuffixTrailingBadgeDesc:
			"Show an extra status badge after the title while keeping the leading status badge as the highest priority badge.",
		statusSuffixRuleSummary: "Status rule {{index}}: {{name}}",
		statusSuffixRuleSummaryEmpty: "Status rule {{index}}",
		statusSuffixNameName: "Rule name",
		statusSuffixNameDesc: "Only shown in settings so you can recognize this rule.",
		statusSuffixEnabledName: "Enable this rule",
		statusSuffixEnabledDesc: "Turn this off without deleting the rule.",
		statusSuffixTargetName: "Target",
		statusSuffixTargetDesc: "Choose which kinds of items this rule can match.",
		statusSuffixTargetBoth: "Files and folders",
		statusSuffixTargetFile: "Files only",
		statusSuffixTargetFolder: "Folders only",
		statusSuffixPatternName: "Suffix regex",
		statusSuffixPatternDesc:
			"Matched against the filename part before the first dot. Example: _\\[done\\]$",
		statusSuffixReplaceWithName: "Write-back suffix",
		statusSuffixReplaceWithDesc:
			"Used by the file menu when setting this status. Example: _[done]",
		statusSuffixShowInMenuName: "Show in file menu",
		statusSuffixShowInMenuDesc:
			"Allow this rule to appear in the file or folder context menu.",
		statusSuffixIconName: "Icon",
		statusSuffixIconDescEmpty: "No icon selected. You can still show text only.",
		statusSuffixIconDescSelected: "Selected icon: {{icon}}",
		statusSuffixPickIcon: "Choose icon",
		statusSuffixClearIcon: "Clear icon",
		statusSuffixCustomSvgName: "Custom SVG",
		statusSuffixCustomSvgDesc:
			"Optional. If set, it replaces the icon above and follows the badge text color.",
		statusSuffixCustomSvgDescSelected: "Selected SVG file: {{file}}",
		statusSuffixChooseSvgFile: "Choose SVG file",
		statusSuffixClearSvgFile: "Clear SVG file",
		statusSuffixBackgroundColorName: "Badge background color",
		statusSuffixBackgroundColorDesc:
			"Optional. Override the background color for this status rule only.",
		statusSuffixTextColorName: "Badge text color",
		statusSuffixTextColorDesc:
			"Optional. Override the text and icon color for this status rule only.",
		statusSuffixTextName: "Badge text",
		statusSuffixTextDesc:
			"Short text shown after the icon. Leave empty to show only the icon.",
		statusSuffixTooltipName: "Tooltip",
		statusSuffixTooltipDesc: "Shown when hovering over the badge.",
		statusSuffixDragHandle: "Drag to reorder",
		statusSuffixDeleteRule: "Delete rule",
		statusSuffixAddRuleName: "Add status rule",
		statusSuffixAddRuleDesc:
			"Rules are checked from top to bottom. The first matching status wins.",
		statusSuffixAddRuleButton: "Add rule",
		statusSuffixMenuLabel: "Status",
		statusSuffixMenuSetRule: "Set status: {{status}}",
		statusSuffixMenuClear: "Clear status",
		tooltipStatusSuffixLabel: "Status",
		conditionalBadgesHeading: "Conditional badges",
		conditionalBadgesDesc:
			"Only one badge is shown per item. Order: prefix badge, first matching rule, hidden-item badge, then missing-prefix badge.",
		conditionalBadgeRuleSummary: "Rule {{index}}: {{name}}",
		conditionalBadgeRuleSummaryEmpty: "Rule {{index}}",
		conditionalBadgeNameName: "Rule name",
		conditionalBadgeNameDesc:
			"Only shown in settings so you can recognize this rule.",
		conditionalBadgeEnabledName: "Enable this rule",
		conditionalBadgeEnabledDesc:
			"Turn this off without deleting the rule.",
		conditionalBadgeTargetName: "Target",
		conditionalBadgeTargetDesc:
			"Choose which kinds of items this rule can match.",
		conditionalBadgeTargetBoth: "Files and folders",
		conditionalBadgeTargetFile: "Files only",
		conditionalBadgeTargetFolder: "Folders only",
		conditionalBadgeMatchModeName: "Match mode",
		conditionalBadgeMatchModeDesc:
			"Choose what part of the item should be matched.",
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
		conditionalBadgeIconDescEmpty: "No icon selected. You can still show text only.",
		conditionalBadgeIconDescSelected: "Selected icon: {{icon}}",
		conditionalBadgePickIcon: "Choose icon",
		conditionalBadgePreviewIcon: "Current icon preview",
		conditionalBadgeClearIcon: "Clear icon",
		conditionalBadgeCustomSvgName: "Custom SVG",
		conditionalBadgeCustomSvgDesc:
			"Optional. If set, it replaces the icon above and follows the badge text color.",
		conditionalBadgeCustomSvgDescSelected: "Selected SVG file: {{file}}",
		conditionalBadgeChooseSvgFile: "Choose SVG file",
		conditionalBadgeClearSvgFile: "Clear SVG file",
		conditionalBadgeBackgroundColorName: "Badge background color",
		conditionalBadgeBackgroundColorDesc:
			"Optional. Override the background color for this rule only.",
		conditionalBadgeTextColorName: "Badge text color",
		conditionalBadgeTextColorDesc:
			"Optional. Override the text and icon color for this rule only.",
		conditionalBadgeTextName: "Badge text",
		conditionalBadgeTextDesc:
			"Short text shown after the icon. Leave empty to show only the icon.",
		conditionalBadgeTooltipName: "Tooltip",
		conditionalBadgeTooltipDesc:
			"Shown when hovering over the badge.",
		conditionalBadgeDragHandle: "Drag to reorder",
		conditionalBadgeDeleteRule: "Delete rule",
		conditionalBadgeAddRuleName: "Add conditional rule",
		conditionalBadgeAddRuleDesc:
			"Rules are checked from top to bottom, after prefix badges and before hidden or missing-prefix badges.",
		conditionalBadgeAddRuleButton: "Add rule",
		iconPickerTitle: "Choose an icon",
		iconPickerSearchName: "Search",
		iconPickerSearchPlaceholder: "Search icon names",
		iconPickerCommonHeading: "Recommended",
		iconPickerNoResults: "No icons found.",
		iconPickerSelectedLabel: "Selected",
		badgeStylesHeading: "Badge styles",
		badgeRadiusName: "Badge radius",
		badgeRadiusDesc: "Controls how rounded badges look.",
		fileBadgeHeading: "File badge",
		folderBadgeHeading: "Folder badge",
		conditionBadgeHeading: "Conditional badge",
		statusBadgeHeading: "Status badge",
		statusTrailingBadgeHeading: "Trailing status badge",
		warningBadgeHeading: "Missing-prefix badge",
		hiddenBadgeHeading: "Hidden-item badge",
		badgeBackgroundColorName: "Background color",
		badgeBackgroundColorDesc:
			"Choose a custom background color, or reset to use the theme default.",
		badgeTextColorName: "Text color",
		badgeTextColorDesc:
			"Choose a custom text color, or reset to use the theme default.",
		badgeBackgroundOpacityName: "Background opacity",
		badgeBackgroundOpacityDesc:
			"Adjust how strong the background looks.",
		advancedStylesSummary: "Advanced styles",
		advancedCustomCssName: "Custom CSS override",
		advancedCustomCssDesc:
			"Optional CSS added after the generated styles. Use this for advanced tweaks.",
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
		languageDesc: "选择此插件设置使用的语言。",
		languageAuto: "跟随 Obsidian",
		languageEnglish: "英语",
		languageChinese: "中文",
		settingsSectionHeading: "文件树",
		enableMixedSortingName: "启用数字混合排序",
		enableMixedSortingDesc:
			"让同级文件和文件夹按前缀一起排序。",
		prefixDisplayModeName: "前缀显示",
		prefixDisplayModeDesc:
			"选择文件树里前缀的显示方式。重命名时会显示真实文件名。",
		prefixDisplayModeOriginal: "显示原名",
		prefixDisplayModeBadge: "Badge",
		prefixDisplayModeHidden: "隐藏前缀",
		prefixPatternName: "前缀识别规则",
		prefixPatternDesc:
			"每行填写一条规则。\n会从上到下依次检查。\n如果规则里有捕获组，会把第一组匹配到的内容显示在 Badge 里。\n如果所有规则都无效，会改用内置默认规则。",
		prefixPatternResetTooltip: "重置为默认规则",
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
		commandToggleMissingPrefixBadgeName: "切换无前缀 Badge",
		noticePrefixDisplayChanged: "前缀显示：{{mode}}",
		noticeMissingPrefixBadgeEnabled: "已开启无前缀 Badge",
		noticeMissingPrefixBadgeDisabled: "已关闭无前缀 Badge",
		showMissingPrefixBadgeName: "显示无前缀 Badge",
		showMissingPrefixBadgeDesc:
			"为没有识别到数字前缀的项目显示 Badge。",
		missingPrefixBadgeTextName: "无前缀文字",
		missingPrefixBadgeTextDesc: "显示在无前缀 Badge 里的文字。",
		showHiddenItemBadgeName: "显示隐藏项 Badge",
		showHiddenItemBadgeDesc:
			"为隐藏项（如点文件、点文件夹）显示 Badge。",
		hiddenItemBadgeTextName: "隐藏项文字",
		hiddenItemBadgeTextDesc: "显示在隐藏项 Badge 里的文字。",
		showHiddenFilesName: "显示隐藏文件",
		showHiddenFilesDesc:
			"在文件树中显示隐藏文件和隐藏文件夹。大型仓库中切换时可能需要一点时间。",
		showHiddenFilesLoading: "正在更新隐藏文件…",
		typePriorityName: "文件和文件夹顺序",
		typePriorityDesc: "仅在启用混合排序时生效。",
		typePriorityMixed: "混排",
		typePriorityFoldersFirst: "文件夹优先",
		typePriorityFilesFirst: "文件优先",
		statusSuffixHeading: "状态后缀",
		statusSuffixDesc:
			"状态后缀 Badge 在所有前置 Badge 中优先级最高。第一条命中的状态规则也可以从文件菜单直接写回。",
		hideMatchedStatusSuffixName: "隐藏已匹配的状态文本",
		hideMatchedStatusSuffixDesc:
			"在显示标题中隐藏已匹配的后缀文本，例如 _[done]。",
		showStatusSuffixTrailingBadgeName: "显示名称末尾状态 Badge",
		showStatusSuffixTrailingBadgeDesc:
			"在保留前置状态 Badge 的同时，在标题末尾额外显示一个状态 Badge。",
		statusSuffixRuleSummary: "状态规则 {{index}}：{{name}}",
		statusSuffixRuleSummaryEmpty: "状态规则 {{index}}",
		statusSuffixNameName: "规则名称",
		statusSuffixNameDesc: "只在设置里显示，方便你识别这条规则。",
		statusSuffixEnabledName: "启用此规则",
		statusSuffixEnabledDesc: "关闭后会保留规则，但暂时不生效。",
		statusSuffixTargetName: "作用对象",
		statusSuffixTargetDesc: "选择这条规则可以匹配哪些项目。",
		statusSuffixTargetBoth: "文件和文件夹",
		statusSuffixTargetFile: "仅文件",
		statusSuffixTargetFolder: "仅文件夹",
		statusSuffixPatternName: "后缀正则",
		statusSuffixPatternDesc:
			"只匹配第一个点号前的文件名部分。例：_\\[done\\]$",
		statusSuffixReplaceWithName: "写回后缀",
		statusSuffixReplaceWithDesc:
			"从文件菜单设置状态时写入的标准后缀。例：_[done]",
		statusSuffixShowInMenuName: "显示在文件菜单中",
		statusSuffixShowInMenuDesc:
			"允许这条规则出现在文件或文件夹右键菜单里。",
		statusSuffixIconName: "图标",
		statusSuffixIconDescEmpty: "当前未选择图标，也可以只显示文字。",
		statusSuffixIconDescSelected: "当前图标：{{icon}}",
		statusSuffixPickIcon: "选择图标",
		statusSuffixClearIcon: "清除图标",
		statusSuffixCustomSvgName: "自定义 SVG",
		statusSuffixCustomSvgDesc:
			"可选。设置后会替代上方图标，并跟随 Badge 文字颜色着色。",
		statusSuffixCustomSvgDescSelected: "当前 SVG 文件：{{file}}",
		statusSuffixChooseSvgFile: "选择 SVG 文件",
		statusSuffixClearSvgFile: "清除 SVG 文件",
		statusSuffixBackgroundColorName: "Badge 背景颜色",
		statusSuffixBackgroundColorDesc:
			"可选。只覆盖这条状态规则的背景颜色。",
		statusSuffixTextColorName: "Badge 文字颜色",
		statusSuffixTextColorDesc:
			"可选。只覆盖这条状态规则的文字和图标颜色。",
		statusSuffixTextName: "Badge 文本",
		statusSuffixTextDesc:
			"显示在图标后面的短文字。留空则只显示图标。",
		statusSuffixTooltipName: "提示文本",
		statusSuffixTooltipDesc: "鼠标悬停在 Badge 上时显示。",
		statusSuffixDragHandle: "拖动排序",
		statusSuffixDeleteRule: "删除规则",
		statusSuffixAddRuleName: "添加状态规则",
		statusSuffixAddRuleDesc:
			"规则会从上到下依次检查，第一条命中的状态规则优先生效。",
		statusSuffixAddRuleButton: "添加规则",
		statusSuffixMenuLabel: "状态",
		statusSuffixMenuSetRule: "设为状态：{{status}}",
		statusSuffixMenuClear: "清除状态",
		tooltipStatusSuffixLabel: "状态",
		conditionalBadgesHeading: "条件 Badge",
		conditionalBadgesDesc:
			"同一条目只显示一个 Badge。顺序是：前缀 Badge、第一条命中的规则、隐藏项 Badge、无前缀 Badge。",
		conditionalBadgeRuleSummary: "规则 {{index}}：{{name}}",
		conditionalBadgeRuleSummaryEmpty: "规则 {{index}}",
		conditionalBadgeNameName: "规则名称",
		conditionalBadgeNameDesc: "只在设置里显示，方便你识别这条规则。",
		conditionalBadgeEnabledName: "启用此规则",
		conditionalBadgeEnabledDesc: "关闭后会保留规则，但暂时不生效。",
		conditionalBadgeTargetName: "作用对象",
		conditionalBadgeTargetDesc: "选择这条规则可以匹配哪些项目。",
		conditionalBadgeTargetBoth: "文件和文件夹",
		conditionalBadgeTargetFile: "仅文件",
		conditionalBadgeTargetFolder: "仅文件夹",
		conditionalBadgeMatchModeName: "匹配方式",
		conditionalBadgeMatchModeDesc: "选择要拿什么内容来匹配。",
		conditionalBadgeMatchModeFullNameExact: "完整名称精确匹配",
		conditionalBadgeMatchModeDisplayNameExact: "显示名称精确匹配",
		conditionalBadgeMatchModeExtensionExact: "文件扩展名精确匹配",
		conditionalBadgeMatchModeFullNameRegex: "完整名称正则匹配",
		conditionalBadgeMatchModePathRegex: "路径正则匹配",
		conditionalBadgePatternName: "匹配模式",
		conditionalBadgePatternDesc:
			"例如：README.md、AGENTS.md、md、^README(?:\\.md)?$",
		conditionalBadgeIconName: "图标",
		conditionalBadgeIconDesc: "为这条规则选择图标。",
		conditionalBadgeIconDescEmpty: "当前未选择图标，也可以只显示文字。",
		conditionalBadgeIconDescSelected: "当前图标：{{icon}}",
		conditionalBadgePickIcon: "选择图标",
		conditionalBadgePreviewIcon: "当前图标预览",
		conditionalBadgeClearIcon: "清除图标",
		conditionalBadgeCustomSvgName: "自定义 SVG",
		conditionalBadgeCustomSvgDesc:
			"可选。设置后会替代上方图标，并跟随 Badge 文字颜色着色。",
		conditionalBadgeCustomSvgDescSelected: "当前 SVG 文件：{{file}}",
		conditionalBadgeChooseSvgFile: "选择 SVG 文件",
		conditionalBadgeClearSvgFile: "清除 SVG 文件",
		conditionalBadgeBackgroundColorName: "Badge 背景颜色",
		conditionalBadgeBackgroundColorDesc:
			"可选。只覆盖这条规则的背景颜色。",
		conditionalBadgeTextColorName: "Badge 文字颜色",
		conditionalBadgeTextColorDesc:
			"可选。只覆盖这条规则的文字和图标颜色。",
		conditionalBadgeTextName: "Badge 文本",
		conditionalBadgeTextDesc:
			"显示在图标后面的短文字。留空则只显示图标。",
		conditionalBadgeTooltipName: "提示文本",
		conditionalBadgeTooltipDesc: "鼠标悬停在 Badge 上时显示。",
		conditionalBadgeDragHandle: "拖动排序",
		conditionalBadgeDeleteRule: "删除规则",
		conditionalBadgeAddRuleName: "添加条件规则",
		conditionalBadgeAddRuleDesc:
			"规则会从上到下依次检查，排在前缀 Badge 之后、隐藏项和无前缀 Badge 之前。",
		conditionalBadgeAddRuleButton: "添加规则",
		iconPickerTitle: "选择图标",
		iconPickerSearchName: "搜索",
		iconPickerSearchPlaceholder: "搜索图标名称",
		iconPickerCommonHeading: "常用图标",
		iconPickerNoResults: "没有找到图标。",
		iconPickerSelectedLabel: "已选",
		badgeStylesHeading: "Badge 样式",
		badgeRadiusName: "Badge 圆角",
		badgeRadiusDesc: "控制 Badge 的圆角大小。",
		fileBadgeHeading: "文件 Badge",
		folderBadgeHeading: "文件夹 Badge",
		conditionBadgeHeading: "条件 Badge",
		statusBadgeHeading: "状态 Badge",
		statusTrailingBadgeHeading: "名称末尾状态 Badge",
		warningBadgeHeading: "无前缀 Badge",
		hiddenBadgeHeading: "隐藏项 Badge",
		badgeBackgroundColorName: "背景颜色",
		badgeBackgroundColorDesc: "选择自定义背景色，或恢复为主题默认值。",
		badgeTextColorName: "文字颜色",
		badgeTextColorDesc: "选择自定义文字颜色，或恢复为主题默认值。",
		badgeBackgroundOpacityName: "背景透明度",
		badgeBackgroundOpacityDesc: "调整背景的显眼程度。",
		advancedStylesSummary: "高级样式",
		advancedCustomCssName: "自定义 CSS 覆盖",
		advancedCustomCssDesc:
			"会追加到自动生成的样式之后，适合做更高级的微调。",
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

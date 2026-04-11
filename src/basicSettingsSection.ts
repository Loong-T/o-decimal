import { setIcon, Setting } from "obsidian";
import { createTranslator, type PluginLanguage } from "./i18n";
import type ODecimalPlugin from "./main";
import {
	DEFAULT_NUMERIC_PREFIX_PATTERN,
	normalizePrefixPatternSource,
} from "./prefix";
import type { PrefixDisplayMode, TreeItemTypePriority } from "./prefixStyle";
import { appendPrefixPatternRule } from "./settingsHelpers";

type Translate = ReturnType<typeof createTranslator>;

interface BasicSettingsSectionOptions {
	containerEl: HTMLElement;
	plugin: ODecimalPlugin;
	t: Translate;
}

export function renderBasicSettingsSection({
	containerEl,
	plugin,
	t,
}: BasicSettingsSectionOptions): void {
	new Setting(containerEl)
		.setName(t("settingsSectionHeading"))
		.setHeading();

	let typePrioritySetting: Setting | null = null;

	const updateTypePriorityState = (enabled: boolean): void => {
		typePrioritySetting?.settingEl.toggleClass(
			"o-decimal-setting-disabled",
			!enabled,
		);
		const dropdown = typePrioritySetting?.controlEl.querySelector("select");
		if (dropdown instanceof HTMLSelectElement) {
			dropdown.disabled = !enabled;
		}
	};

	new Setting(containerEl)
		.setName(t("languageName"))
		.setDesc(t("languageDesc"))
		.addDropdown((dropdown) =>
			dropdown
				.addOption("auto", t("languageAuto"))
				.addOption("en", t("languageEnglish"))
				.addOption("zh", t("languageChinese"))
				.setValue(plugin.settings.language)
				.onChange(async (value) => {
					await plugin.applySettings({
						language: value as PluginLanguage,
					});
				}),
		);

	new Setting(containerEl)
		.setName(t("prefixDisplayModeName"))
		.setDesc(t("prefixDisplayModeDesc"))
		.addDropdown((dropdown) =>
			dropdown
				.addOption("original", t("prefixDisplayModeOriginal"))
				.addOption("badge", t("prefixDisplayModeBadge"))
				.addOption("hidden", t("prefixDisplayModeHidden"))
				.setValue(plugin.settings.prefixDisplayMode)
				.onChange(async (value) => {
					await plugin.applySettings({
						prefixDisplayMode: value as PrefixDisplayMode,
					});
				}),
		);

	renderPrefixPatternSetting(containerEl, plugin, t);

	new Setting(containerEl)
		.setName(t("enableMixedSortingName"))
		.setDesc(t("enableMixedSortingDesc"))
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.enableNumericMixedSorting)
				.onChange(async (value) => {
					await plugin.applySettings({
						enableNumericMixedSorting: value,
					});
					updateTypePriorityState(value);
				}),
		);

	typePrioritySetting = new Setting(containerEl)
		.setName(t("typePriorityName"))
		.setDesc(t("typePriorityDesc"))
		.addDropdown((dropdown) =>
			dropdown
				.addOption("mixed", t("typePriorityMixed"))
				.addOption("folders-first", t("typePriorityFoldersFirst"))
				.addOption("files-first", t("typePriorityFilesFirst"))
				.setValue(plugin.settings.treeItemTypePriority)
				.onChange(async (value) => {
					await plugin.applySettings({
						treeItemTypePriority: value as TreeItemTypePriority,
					});
				}),
		);

	updateTypePriorityState(plugin.settings.enableNumericMixedSorting);

	containerEl.createDiv({
		cls: "o-decimal-settings-section-separator",
	});
}

function renderPrefixPatternSetting(
	containerEl: HTMLElement,
	plugin: ODecimalPlugin,
	t: Translate,
): void {
	const prefixPatternSetting = new Setting(containerEl)
		.setName(t("prefixPatternName"))
		.setDesc(t("prefixPatternDesc"));
	(prefixPatternSetting as Setting & { descEl: HTMLElement }).descEl.addClass(
		"o-decimal-prefix-pattern-desc",
	);
	prefixPatternSetting.controlEl.addClass("o-decimal-prefix-pattern-control");
	const applyPrefixPatternValue = async (value: string): Promise<void> => {
		const normalizedValue = normalizePrefixPatternSource(value);
		prefixPatternInputEl.value = normalizedValue;
		await plugin.applySettings({
			prefixPattern: normalizedValue,
		});
	};
	const prefixPatternInputEl = prefixPatternSetting.controlEl.createEl("textarea", {
		cls: "o-decimal-prefix-pattern-input",
		attr: {
			rows: 4,
			spellcheck: "false",
		},
	});
	prefixPatternInputEl.placeholder = DEFAULT_NUMERIC_PREFIX_PATTERN;
	prefixPatternInputEl.value = normalizePrefixPatternSource(
		plugin.settings.prefixPattern,
	);
	prefixPatternInputEl.addEventListener("change", () => {
		void applyPrefixPatternValue(prefixPatternInputEl.value);
	});

	const resetButtonEl = prefixPatternSetting.controlEl.createEl("button", {
		cls: "clickable-icon o-decimal-prefix-pattern-reset",
		attr: {
			type: "button",
			"aria-label": t("prefixPatternResetTooltip"),
		},
	});
	setIcon(resetButtonEl, "reset");
	resetButtonEl.setAttribute("title", t("prefixPatternResetTooltip"));
	prefixPatternSetting.controlEl.prepend(resetButtonEl);

	resetButtonEl.addEventListener("click", () => {
		void applyPrefixPatternValue(DEFAULT_NUMERIC_PREFIX_PATTERN);
	});

	const presetListEl = prefixPatternSetting.controlEl.createDiv({
		cls: "o-decimal-prefix-pattern-presets is-hidden",
	});

	const presetDefinitions = [
		{
			label: t("prefixPatternPresetDefault"),
			example: t("prefixPatternPresetDefaultExample"),
			pattern: "^(\\d+)_",
		},
		{
			label: t("prefixPatternPresetRange"),
			example: t("prefixPatternPresetRangeExample"),
			pattern: "^((?:\\d+-\\d+))_",
		},
		{
			label: t("prefixPatternPresetBracket"),
			example: t("prefixPatternPresetBracketExample"),
			pattern: "^\\[(\\d+)\\]\\s*",
		},
		{
			label: t("prefixPatternPresetDot"),
			example: t("prefixPatternPresetDotExample"),
			pattern: "^(\\d+)\\.\\s*",
		},
		{
			label: t("prefixPatternPresetSegmented"),
			example: t("prefixPatternPresetSegmentedExample"),
			pattern: "^((?:\\d+\\.)+\\d+)\\s*",
		},
	];

	for (const preset of presetDefinitions) {
		const presetButtonEl = presetListEl.createEl("button", {
			cls: "o-decimal-prefix-pattern-preset",
			attr: {
				type: "button",
			},
		});
		const presetTextEl = presetButtonEl.createDiv({
			cls: "o-decimal-prefix-pattern-preset-text",
		});
		const presetMetaEl = presetTextEl.createDiv({
			cls: "o-decimal-prefix-pattern-preset-meta",
		});
		presetMetaEl.createSpan({
			cls: "o-decimal-prefix-pattern-preset-label",
			text: preset.label,
		});
		presetMetaEl.createSpan({
			cls: "o-decimal-prefix-pattern-preset-example",
			text: preset.example,
		});
		presetButtonEl.createSpan({
			cls: "o-decimal-prefix-pattern-preset-code",
			text: preset.pattern,
		});
		presetButtonEl.addEventListener("mousedown", (event) => {
			event.preventDefault();
		});
		presetButtonEl.addEventListener("click", () => {
			void applyPrefixPatternValue(
				appendPrefixPatternRule(prefixPatternInputEl.value, preset.pattern),
			).then(() => {
				prefixPatternInputEl.focus();
			});
		});
	}

	prefixPatternInputEl.addEventListener("focus", () => {
		presetListEl.removeClass("is-hidden");
	});
	prefixPatternInputEl.addEventListener("blur", () => {
		window.setTimeout(() => {
			presetListEl.addClass("is-hidden");
		}, 120);
	});
}

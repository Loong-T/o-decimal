import { App, PluginSettingTab, Setting, setIcon } from "obsidian";
import { createTranslator, type PluginLanguage } from "./i18n";
import type ODecimalPlugin from "./main";
import {
	DEFAULT_NUMERIC_PREFIX_PATTERN,
	normalizePrefixPatternSource,
} from "./prefix";
import {
	DEFAULT_PREFIX_STYLE_SETTINGS,
	PREFIX_STYLE_SLOT_DEFINITIONS,
	type PrefixDisplayMode,
	type PrefixStyleSettings,
	type PrefixStyleSlotId,
	type TreeItemTypePriority,
} from "./prefixStyle";
export type {
	PrefixDisplayMode,
	PrefixStyleSettings,
	PrefixStyleSlotId,
	TreeItemTypePriority,
} from "./prefixStyle";

export interface ODecimalSettings {
	language: PluginLanguage;
	enableNumericMixedSorting: boolean;
	treeItemTypePriority: TreeItemTypePriority;
	prefixDisplayMode: PrefixDisplayMode;
	prefixPattern: string;
	showMissingPrefixBadge: boolean;
	showHiddenFiles: boolean;
	showHiddenItemBadge: boolean;
	missingPrefixBadgeText: string;
	hiddenItemBadgeText: string;
	prefixStyles: PrefixStyleSettings;
}

export const DEFAULT_SETTINGS: ODecimalSettings = {
	language: "auto",
	enableNumericMixedSorting: true,
	treeItemTypePriority: "mixed",
	prefixDisplayMode: "badge",
	prefixPattern: DEFAULT_NUMERIC_PREFIX_PATTERN,
	showMissingPrefixBadge: false,
	showHiddenFiles: false,
	showHiddenItemBadge: false,
	missingPrefixBadgeText: "?",
	hiddenItemBadgeText: ".",
	prefixStyles: DEFAULT_PREFIX_STYLE_SETTINGS,
};

export class ODecimalSettingTab extends PluginSettingTab {
	plugin: ODecimalPlugin;

	constructor(app: App, plugin: ODecimalPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const t = createTranslator(this.plugin.settings.language);

		new Setting(containerEl)
			.setName(t("settingsSectionHeading"))
			.setHeading();

		let typePrioritySetting: Setting | null = null;

		const updateTypePriorityState = (enabled: boolean): void => {
			typePrioritySetting?.settingEl.toggleClass(
				"o-decimal-setting-disabled",
				!enabled,
			);
			const dropdown =
				typePrioritySetting?.controlEl.querySelector("select");
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
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						await this.plugin.applySettings({
							language: value as PluginLanguage,
						});
						this.display();
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
					.setValue(this.plugin.settings.prefixDisplayMode)
					.onChange(async (value) => {
						await this.plugin.applySettings({
							prefixDisplayMode: value as PrefixDisplayMode,
						});
					}),
			);

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
			await this.plugin.applySettings({
				prefixPattern: normalizedValue,
			});
		};
		const prefixPatternInputEl = prefixPatternSetting.controlEl.createEl(
			"textarea",
			{
				cls: "o-decimal-prefix-pattern-input",
				attr: {
					rows: 4,
					spellcheck: "false",
				},
			},
		);
		prefixPatternInputEl.placeholder = DEFAULT_NUMERIC_PREFIX_PATTERN;
		prefixPatternInputEl.value = normalizePrefixPatternSource(
			this.plugin.settings.prefixPattern,
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
					appendPrefixPatternRule(
						prefixPatternInputEl.value,
						preset.pattern,
					),
				).then(() => {
					prefixPatternInputEl.focus();
				});
			});
		}

		const showPresets = (): void => {
			presetListEl.removeClass("is-hidden");
		};
		const hidePresets = (): void => {
			window.setTimeout(() => {
				presetListEl.addClass("is-hidden");
			}, 120);
		};

		prefixPatternInputEl.addEventListener("focus", showPresets);
		prefixPatternInputEl.addEventListener("blur", hidePresets);

		new Setting(containerEl)
			.setName(t("enableMixedSortingName"))
			.setDesc(t("enableMixedSortingDesc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableNumericMixedSorting)
					.onChange(async (value) => {
						await this.plugin.applySettings({
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
					.setValue(this.plugin.settings.treeItemTypePriority)
					.onChange(async (value) => {
						await this.plugin.applySettings({
							treeItemTypePriority: value as TreeItemTypePriority,
						});
					}),
			);

		updateTypePriorityState(this.plugin.settings.enableNumericMixedSorting);

		new Setting(containerEl).setName(t("badgeStylesHeading")).setHeading();

		new Setting(containerEl)
			.setName(t("badgeRadiusName"))
			.setDesc(t("badgeRadiusDesc"))
			.addSlider((slider) =>
				slider
					.setLimits(0, 99, 1)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.prefixStyles.badgeRadius)
					.onChange(async (value) => {
						await this.plugin.applySettings({
							prefixStyles: {
								...this.plugin.settings.prefixStyles,
								badgeRadius: value,
							},
						});
					}),
			);

		for (const slot of PREFIX_STYLE_SLOT_DEFINITIONS) {
			const slotDetailsEl = containerEl.createEl("details", {
				cls: "o-decimal-style-slot",
			});
			slotDetailsEl.createEl("summary", {
				text: t(`${slot.id}Heading`),
			});
			const slotContainerEl = slotDetailsEl.createDiv(
				"o-decimal-style-slot-body",
			);

			if (slot.id === "warningBadge") {
				new Setting(slotContainerEl)
					.setName(t("showMissingPrefixBadgeName"))
					.setDesc(t("showMissingPrefixBadgeDesc"))
					.addToggle((toggle) =>
						toggle
							.setValue(
								this.plugin.settings.showMissingPrefixBadge,
							)
							.onChange(async (value) => {
								await this.plugin.applySettings({
									showMissingPrefixBadge: value,
								});
							}),
					);

				new Setting(slotContainerEl)
					.setName(t("missingPrefixBadgeTextName"))
					.setDesc(t("missingPrefixBadgeTextDesc"))
					.addText((text) =>
						text
							.setPlaceholder("?")
							.setValue(
								this.plugin.settings.missingPrefixBadgeText,
							)
							.onChange(async (value) => {
								await this.plugin.applySettings({
									missingPrefixBadgeText: value || "?",
								});
							}),
					);
			}

			if (slot.id === "hiddenBadge") {
				new Setting(slotContainerEl)
					.setName(t("showHiddenFilesName"))
					.setDesc(t("showHiddenFilesDesc"))
					.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.showHiddenFiles)
							.onChange(async (value) => {
								await this.plugin.applySettings({
									showHiddenFiles: value,
								});
							}),
					);

				new Setting(slotContainerEl)
					.setName(t("showHiddenItemBadgeName"))
					.setDesc(t("showHiddenItemBadgeDesc"))
					.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.showHiddenItemBadge)
							.onChange(async (value) => {
								await this.plugin.applySettings({
									showHiddenItemBadge: value,
								});
							}),
					);

				new Setting(slotContainerEl)
					.setName(t("hiddenItemBadgeTextName"))
					.setDesc(t("hiddenItemBadgeTextDesc"))
					.addText((text) =>
						text
							.setPlaceholder(".")
							.setValue(this.plugin.settings.hiddenItemBadgeText)
							.onChange(async (value) => {
								await this.plugin.applySettings({
									hiddenItemBadgeText: value || ".",
								});
							}),
					);
			}

			new Setting(slotContainerEl)
				.setName(t("badgeBackgroundColorName"))
				.setDesc(t("badgeBackgroundColorDesc"))
				.addColorPicker((picker) =>
					picker
						.setValue(
							this.plugin.settings.prefixStyles.slots[slot.id]
								.backgroundColor || slot.colorPickerFallback,
						)
						.onChange(async (value) => {
							await this.plugin.applySettings({
								prefixStyles: updatePrefixStyleSlot(
									this.plugin.settings.prefixStyles,
									slot.id,
									{
										backgroundColor: value,
									},
								),
							});
						}),
				)
				.addExtraButton((button) =>
					button
						.setIcon("reset")
						.setTooltip(t("resetThemeDefault"))
						.onClick(async () => {
							await this.plugin.applySettings({
								prefixStyles: updatePrefixStyleSlot(
									this.plugin.settings.prefixStyles,
									slot.id,
									{
										backgroundColor: "",
									},
								),
							});
							this.display();
						}),
				);

			new Setting(slotContainerEl)
				.setName(t("badgeTextColorName"))
				.setDesc(t("badgeTextColorDesc"))
				.addColorPicker((picker) =>
					picker
						.setValue(
							this.plugin.settings.prefixStyles.slots[slot.id]
								.textColor || slot.textColorPickerFallback,
						)
						.onChange(async (value) => {
							await this.plugin.applySettings({
								prefixStyles: updatePrefixStyleSlot(
									this.plugin.settings.prefixStyles,
									slot.id,
									{
										textColor: value,
									},
								),
							});
						}),
				)
				.addExtraButton((button) =>
					button
						.setIcon("reset")
						.setTooltip(t("resetThemeDefault"))
						.onClick(async () => {
							await this.plugin.applySettings({
								prefixStyles: updatePrefixStyleSlot(
									this.plugin.settings.prefixStyles,
									slot.id,
									{
										textColor: "",
									},
								),
							});
							this.display();
						}),
				);

			new Setting(slotContainerEl)
				.setName(t("badgeBackgroundOpacityName"))
				.setDesc(t("badgeBackgroundOpacityDesc"))
				.addSlider((slider) =>
					slider
						.setLimits(0, 100, 1)
						.setDynamicTooltip()
						.setValue(
							this.plugin.settings.prefixStyles.slots[slot.id]
								.backgroundOpacity,
						)
						.onChange(async (value) => {
							await this.plugin.applySettings({
								prefixStyles: updatePrefixStyleSlot(
									this.plugin.settings.prefixStyles,
									slot.id,
									{
										backgroundOpacity: value,
									},
								),
							});
						}),
				);
		}

		const advancedDetailsEl = containerEl.createEl("details", {
			cls: "o-decimal-advanced-settings",
		});
		advancedDetailsEl.createEl("summary", {
			text: t("advancedStylesSummary"),
		});
		const advancedContainerEl = advancedDetailsEl.createDiv(
			"o-decimal-advanced-settings-body",
		);
		new Setting(advancedContainerEl)
			.setName(t("advancedCustomCssName"))
			.setDesc(t("advancedCustomCssDesc"));
		const advancedCssEditorEl = advancedContainerEl.createDiv(
			"o-decimal-advanced-css-editor",
		);
		const advancedCssInputEl = advancedCssEditorEl.createEl("textarea", {
			cls: "o-decimal-advanced-css-input",
			attr: {
				rows: 10,
				spellcheck: "false",
			},
		});
		advancedCssInputEl.placeholder = t("advancedCustomCssPlaceholder");
		advancedCssInputEl.value =
			this.plugin.settings.prefixStyles.advancedCss;
		advancedCssInputEl.addEventListener("change", () => {
			void this.plugin.applySettings({
				prefixStyles: {
					...this.plugin.settings.prefixStyles,
					advancedCss: advancedCssInputEl.value,
				},
			});
		});
		const advancedHelpEl = advancedContainerEl.createDiv(
			"o-decimal-advanced-css-help",
		);
		advancedHelpEl.createDiv({
			cls: "o-decimal-advanced-css-help-title",
			text: t("advancedCustomCssHelpTitle"),
		});
		const advancedHelpListEl = advancedHelpEl.createEl("ul", {
			cls: "o-decimal-advanced-css-help-list",
		});
		advancedHelpListEl.createEl("li", {
			text: t("advancedCustomCssHelp1"),
		});
		advancedHelpListEl.createEl("li", {
			text: t("advancedCustomCssHelp2"),
		});
	}
}

function updatePrefixStyleSlot(
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

function appendPrefixPatternRule(currentValue: string, nextRule: string): string {
	const normalizedCurrentRules = normalizePrefixPatternSource(currentValue)
		.split("\n")
		.map((rule) => rule.trim())
		.filter((rule) => rule.length > 0);

	if (normalizedCurrentRules.includes(nextRule)) {
		return normalizedCurrentRules.join("\n");
	}

	return [...normalizedCurrentRules, nextRule].join("\n");
}

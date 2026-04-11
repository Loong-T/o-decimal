import { App, setIcon, PluginSettingTab, Setting } from "obsidian";
import {
	createEmptyConditionalBadgeRule,
	getConditionalBadgeRuleIconId,
	type ConditionalBadgeMatchMode,
	type ConditionalBadgeRule,
	type ConditionalBadgeTarget,
} from "./conditionalBadgeRules";
import { IconPickerModal } from "./iconPickerModal";
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
	conditionalBadgeRules: ConditionalBadgeRule[];
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
	conditionalBadgeRules: [],
	showMissingPrefixBadge: false,
	showHiddenFiles: false,
	showHiddenItemBadge: false,
	missingPrefixBadgeText: "?",
	hiddenItemBadgeText: ".",
	prefixStyles: DEFAULT_PREFIX_STYLE_SETTINGS,
};

export class ODecimalSettingTab extends PluginSettingTab {
	plugin: ODecimalPlugin;
	private readonly conditionalRuleOpenState = new Map<string, boolean>();
	private draggingConditionalRuleId: string | null = null;

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

		containerEl.createDiv({
			cls: "o-decimal-settings-section-separator",
		});
		new Setting(containerEl)
			.setName(t("conditionalBadgesHeading"))
			.setHeading();

		const conditionalBadgeInfoEl = containerEl.createDiv({
			cls: "o-decimal-conditional-badge-info",
		});
		conditionalBadgeInfoEl.setText(t("conditionalBadgesDesc"));

		const conditionalBadgeListEl = containerEl.createDiv({
			cls: "o-decimal-conditional-badge-list",
		});

		const updateConditionalBadgeRules = async (
			nextRules: ConditionalBadgeRule[],
		): Promise<void> => {
			await this.plugin.applySettings({
				conditionalBadgeRules: nextRules,
			});
			renderConditionalBadgeRules();
		};

		const renderConditionalBadgeRules = (): void => {
			conditionalBadgeListEl.empty();

			for (const [index, rule] of this.plugin.settings.conditionalBadgeRules.entries()) {
				const ruleDetailsEl = conditionalBadgeListEl.createEl("details", {
					cls: "o-decimal-style-slot",
				});
				ruleDetailsEl.addClass("o-decimal-conditional-rule");
				ruleDetailsEl.open = this.conditionalRuleOpenState.get(rule.id) ?? false;
				ruleDetailsEl.addEventListener("toggle", () => {
					this.conditionalRuleOpenState.set(rule.id, ruleDetailsEl.open);
				});
				ruleDetailsEl.addEventListener("dragover", (event) => {
					if (!this.draggingConditionalRuleId || this.draggingConditionalRuleId === rule.id) {
						return;
					}

					event.preventDefault();
					ruleDetailsEl.addClass("is-drag-target");
				});
				ruleDetailsEl.addEventListener("dragleave", () => {
					ruleDetailsEl.removeClass("is-drag-target");
				});
				ruleDetailsEl.addEventListener("drop", (event) => {
					event.preventDefault();
					ruleDetailsEl.removeClass("is-drag-target");
					const draggedRuleId = this.draggingConditionalRuleId;
					this.draggingConditionalRuleId = null;
					if (!draggedRuleId || draggedRuleId === rule.id) {
						return;
					}

					const currentRules = this.plugin.settings.conditionalBadgeRules;
					const fromIndex = currentRules.findIndex(
						(candidateRule) => candidateRule.id === draggedRuleId,
					);
					if (fromIndex === -1) {
						return;
					}

					void updateConditionalBadgeRules(
						moveConditionalBadgeRule(currentRules, fromIndex, index),
					);
				});
				const summaryEl = ruleDetailsEl.createEl("summary", {
					cls: "o-decimal-conditional-rule-summary",
				});
				summaryEl.createSpan({
					cls: "o-decimal-conditional-rule-summary-label",
					text:
						rule.name.trim().length > 0
							? t("conditionalBadgeRuleSummary", {
								index: String(index + 1),
								name: rule.name,
							})
							: t("conditionalBadgeRuleSummaryEmpty", {
								index: String(index + 1),
							}),
				});
				const dragHandleEl = summaryEl.createSpan({
					cls: "o-decimal-conditional-rule-drag-handle",
					attr: {
						draggable: "true",
						role: "button",
						"aria-label": t("conditionalBadgeDragHandle"),
						title: t("conditionalBadgeDragHandle"),
					},
				});
				dragHandleEl.setText("⋮⋮");
				dragHandleEl.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
				});
				dragHandleEl.addEventListener("dragstart", (event) => {
					this.draggingConditionalRuleId = rule.id;
					ruleDetailsEl.addClass("is-dragging");
					event.dataTransfer?.setData("text/plain", rule.id);
					if (event.dataTransfer) {
						event.dataTransfer.effectAllowed = "move";
					}
				});
				dragHandleEl.addEventListener("dragend", () => {
					this.draggingConditionalRuleId = null;
					ruleDetailsEl.removeClass("is-dragging");
					conditionalBadgeListEl
						.querySelectorAll(".o-decimal-conditional-rule.is-drag-target")
						.forEach((element) => element.removeClass("is-drag-target"));
				});
				const ruleBodyEl = ruleDetailsEl.createDiv("o-decimal-style-slot-body");

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeNameName"))
					.setDesc(t("conditionalBadgeNameDesc"))
					.addText((text) =>
						bindRuleTextInput(text.inputEl, rule.name, async (value) => {
							await updateConditionalBadgeRules(
								updateConditionalBadgeRuleAt(
									this.plugin.settings.conditionalBadgeRules,
									index,
									{ name: value },
								),
							);
						}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeEnabledName"))
					.setDesc(t("conditionalBadgeEnabledDesc"))
					.addToggle((toggle) =>
						toggle
							.setValue(rule.enabled)
							.onChange(async (value) => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ enabled: value },
									),
								);
							}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeTargetName"))
					.setDesc(t("conditionalBadgeTargetDesc"))
					.addDropdown((dropdown) =>
						dropdown
							.addOption("both", t("conditionalBadgeTargetBoth"))
							.addOption("file", t("conditionalBadgeTargetFile"))
							.addOption("folder", t("conditionalBadgeTargetFolder"))
							.setValue(rule.target)
							.onChange(async (value) => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ target: value as ConditionalBadgeTarget },
									),
								);
							}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeMatchModeName"))
					.setDesc(t("conditionalBadgeMatchModeDesc"))
					.addDropdown((dropdown) =>
						dropdown
							.addOption(
								"full-name-exact",
								t("conditionalBadgeMatchModeFullNameExact"),
							)
							.addOption(
								"display-name-exact",
								t("conditionalBadgeMatchModeDisplayNameExact"),
							)
							.addOption(
								"extension-exact",
								t("conditionalBadgeMatchModeExtensionExact"),
							)
							.addOption(
								"full-name-regex",
								t("conditionalBadgeMatchModeFullNameRegex"),
							)
							.addOption("path-regex", t("conditionalBadgeMatchModePathRegex"))
							.setValue(rule.matchMode)
							.onChange(async (value) => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ matchMode: value as ConditionalBadgeMatchMode },
									),
								);
							}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgePatternName"))
					.setDesc(t("conditionalBadgePatternDesc"))
					.addText((text) =>
						bindRuleTextInput(text.inputEl, rule.pattern, async (value) => {
							await updateConditionalBadgeRules(
								updateConditionalBadgeRuleAt(
									this.plugin.settings.conditionalBadgeRules,
									index,
									{ pattern: value },
								),
							);
						}),
					);

				const iconSetting = new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeIconName"))
					.setDesc(
						rule.icon.trim().length > 0
							? t("conditionalBadgeIconDescSelected", {
								icon: rule.icon,
							})
					: t("conditionalBadgeIconDescEmpty"),
					);
				const pickIconButtonEl = iconSetting.controlEl.createEl("button", {
					cls: "o-decimal-icon-picker-trigger",
					attr: {
						type: "button",
						"aria-label": t("conditionalBadgePickIcon"),
					},
				});
				renderIconPickerButton(
					pickIconButtonEl,
					t("conditionalBadgePickIcon"),
					rule.icon || null,
				);
				pickIconButtonEl.addEventListener("click", () => {
					new IconPickerModal(
						this.app,
						rule.icon,
						{
							title: t("iconPickerTitle"),
							searchName: t("iconPickerSearchName"),
							searchPlaceholder: t("iconPickerSearchPlaceholder"),
							commonHeading: t("iconPickerCommonHeading"),
							noResults: t("iconPickerNoResults"),
							selectedLabel: t("iconPickerSelectedLabel"),
						},
						(iconId) => {
							void updateConditionalBadgeRules(
								updateConditionalBadgeRuleAt(
									this.plugin.settings.conditionalBadgeRules,
									index,
									{ icon: iconId },
								),
							);
						},
					).open();
				});
				const clearIconButtonEl = iconSetting.controlEl.createEl("button", {
					cls: "clickable-icon o-decimal-icon-picker-clear",
					attr: {
						type: "button",
						"aria-label": t("conditionalBadgeClearIcon"),
					},
				});
				setIcon(clearIconButtonEl, "x");
				clearIconButtonEl.setAttribute("title", t("conditionalBadgeClearIcon"));
				clearIconButtonEl.addEventListener("click", () => {
					void updateConditionalBadgeRules(
						updateConditionalBadgeRuleAt(
							this.plugin.settings.conditionalBadgeRules,
							index,
							{ icon: "" },
						),
					);
				});

				const svgSetting = new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeCustomSvgName"))
					.setDesc(
						rule.customSvgName.trim().length > 0
							? t("conditionalBadgeCustomSvgDescSelected", {
								file: rule.customSvgName,
							})
							: t("conditionalBadgeCustomSvgDesc"),
					)
					.addButton((button) =>
						button
							.setButtonText(t("conditionalBadgeChooseSvgFile"))
							.onClick(() => {
								void pickSvgFile().then(async (selectedFile) => {
									if (!selectedFile) {
										return;
									}

								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{
											customSvg: normalizeImportedSvgContent(
												selectedFile.content,
											),
											customSvgName: selectedFile.name,
										},
									),
								);
								});
							}),
					)
					.addExtraButton((button) =>
						button
							.setIcon("x")
							.setTooltip(t("conditionalBadgeClearSvgFile"))
							.onClick(async () => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{
											customSvg: "",
											customSvgName: "",
										},
									),
								);
							}),
					);
				const svgButtonEl = svgSetting.controlEl.querySelector("button");
				if (svgButtonEl instanceof HTMLButtonElement) {
					renderIconPickerButton(
						svgButtonEl,
						t("conditionalBadgeChooseSvgFile"),
						rule.customSvg.trim().length > 0
							? getConditionalBadgeRuleIconId(rule)
							: null,
					);
				}

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeBackgroundColorName"))
					.setDesc(t("conditionalBadgeBackgroundColorDesc"))
					.addColorPicker((picker) =>
						picker
							.setValue(rule.backgroundColor || "#2f343c")
							.onChange(async (value) => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ backgroundColor: value },
									),
								);
							}),
					)
					.addExtraButton((button) =>
						button
							.setIcon("reset")
							.setTooltip(t("resetThemeDefault"))
							.onClick(async () => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ backgroundColor: "" },
									),
								);
							}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeTextColorName"))
					.setDesc(t("conditionalBadgeTextColorDesc"))
					.addColorPicker((picker) =>
						picker
							.setValue(rule.textColor || "#ffffff")
							.onChange(async (value) => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ textColor: value },
									),
								);
							}),
					)
					.addExtraButton((button) =>
						button
							.setIcon("reset")
							.setTooltip(t("resetThemeDefault"))
							.onClick(async () => {
								await updateConditionalBadgeRules(
									updateConditionalBadgeRuleAt(
										this.plugin.settings.conditionalBadgeRules,
										index,
										{ textColor: "" },
									),
								);
							}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeTextName"))
					.setDesc(t("conditionalBadgeTextDesc"))
					.addText((text) =>
						bindRuleTextInput(text.inputEl, rule.text, async (value) => {
							await updateConditionalBadgeRules(
								updateConditionalBadgeRuleAt(
									this.plugin.settings.conditionalBadgeRules,
									index,
									{ text: value },
								),
							);
						}),
					);

				new Setting(ruleBodyEl)
					.setName(t("conditionalBadgeTooltipName"))
					.setDesc(t("conditionalBadgeTooltipDesc"))
					.addText((text) =>
						bindRuleTextInput(text.inputEl, rule.tooltip, async (value) => {
							await updateConditionalBadgeRules(
								updateConditionalBadgeRuleAt(
									this.plugin.settings.conditionalBadgeRules,
									index,
									{ tooltip: value },
								),
							);
						}),
					)
					.addExtraButton((button) =>
						button
							.setIcon("trash")
							.setTooltip(t("conditionalBadgeDeleteRule"))
							.onClick(async () => {
								this.conditionalRuleOpenState.delete(rule.id);
								await updateConditionalBadgeRules(
									this.plugin.settings.conditionalBadgeRules.filter(
										(_, currentIndex) => currentIndex !== index,
									),
								);
							}),
					);
			}
		};

		renderConditionalBadgeRules();

		const addRuleSetting = new Setting(containerEl)
			.setName(t("conditionalBadgeAddRuleName"))
			.setDesc(t("conditionalBadgeAddRuleDesc"))
			.addButton((button) =>
				button.setButtonText(t("conditionalBadgeAddRuleButton")).onClick(async () => {
					const nextRule = createEmptyConditionalBadgeRule();
					this.conditionalRuleOpenState.set(nextRule.id, true);
					await updateConditionalBadgeRules([
						...this.plugin.settings.conditionalBadgeRules,
						nextRule,
					]);
				}),
			);
		addRuleSetting.settingEl.addClass("o-decimal-conditional-badge-add");

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
				const showHiddenFilesSetting = new Setting(slotContainerEl)
					.setName(t("showHiddenFilesName"))
					.setDesc(t("showHiddenFilesDesc"))
					.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.showHiddenFiles)
							.onChange(async (value) => {
								setSettingLoading(
									showHiddenFilesSetting,
									true,
									t("showHiddenFilesLoading"),
								);
								try {
									await this.plugin.applySettings({
										showHiddenFiles: value,
									});
								} finally {
									setSettingLoading(
										showHiddenFilesSetting,
										false,
										t("showHiddenFilesDesc"),
									);
								}
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

function updateConditionalBadgeRuleAt(
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

function moveConditionalBadgeRule(
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

function safeSetSettingIcon(el: HTMLElement, iconId: string | null): void {
	el.empty();
	if (!iconId || iconId.trim().length === 0) {
		return;
	}

	try {
		setIcon(el, iconId);
	} catch {
		el.empty();
	}
}

function renderIconPickerButton(
	buttonEl: HTMLButtonElement,
	label: string,
	iconId: string | null,
): void {
	buttonEl.empty();
	buttonEl.toggleClass("o-decimal-icon-picker-trigger-has-icon", !!iconId);
	if (iconId) {
		const iconEl = buttonEl.createSpan({
			cls: "o-decimal-icon-picker-trigger-icon",
		});
		safeSetSettingIcon(iconEl, iconId);
		return;
	}

	buttonEl.createSpan({
		cls: "o-decimal-icon-picker-trigger-label",
		text: label,
	});
}

function bindRuleTextInput(
	inputEl: HTMLInputElement,
	value: string,
	onCommit: (value: string) => Promise<void>,
): void {
	inputEl.value = value;
	inputEl.spellcheck = false;
	const commit = (): void => {
		void onCommit(inputEl.value);
	};
	inputEl.addEventListener("change", commit);
	inputEl.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			commit();
		}
	});
}

function setSettingLoading(
	setting: Setting,
	loading: boolean,
	descriptionText: string,
): void {
	const settingEl = setting.settingEl;
	const descriptionEl = settingEl.querySelector(".setting-item-description");
	const inputEl = settingEl.querySelector(
		"input, select, textarea, button",
	);

	settingEl.toggleClass("o-decimal-setting-loading", loading);
	if (descriptionEl instanceof HTMLElement) {
		descriptionEl.setText(descriptionText);
	}
	if (
		inputEl instanceof HTMLInputElement ||
		inputEl instanceof HTMLSelectElement ||
		inputEl instanceof HTMLTextAreaElement ||
		inputEl instanceof HTMLButtonElement
	) {
		inputEl.disabled = loading;
	}
}

async function pickSvgFile(): Promise<{ name: string; content: string } | null> {
	return await new Promise((resolve) => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = ".svg,image/svg+xml";
		inputEl.addEventListener(
			"change",
			() => {
				const file = inputEl.files?.[0];
				if (!file) {
					resolve(null);
					return;
				}

				void file.text().then((content) => {
					resolve({
						name: file.name,
						content,
					});
				});
			},
			{ once: true },
		);
		inputEl.click();
	});
}

function normalizeImportedSvgContent(svgContent: string): string {
	return svgContent
		.replace(/\s(?:fill|stroke)="(?!none|currentColor|inherit)[^"]*"/gi, (match) =>
			match.replace(/="[^"]*"/, '="currentColor"'),
		)
		.replace(
			/(?:fill|stroke)\s*:\s*(?!none|currentColor|inherit)[^;"]+/gi,
			(styleValue) => styleValue.replace(/:\s*[^;"]+/, ": currentColor"),
		);
}

import { Setting } from "obsidian";
import { createTranslator } from "./i18n";
import type ODecimalPlugin from "./main";
import { PREFIX_STYLE_SLOT_DEFINITIONS } from "./prefixStyle";
import { setSettingLoading } from "./settingsHelpers";
import { updatePrefixStyleSlot } from "./settingsState";

type Translate = ReturnType<typeof createTranslator>;

interface BadgeStyleSectionOptions {
	containerEl: HTMLElement;
	plugin: ODecimalPlugin;
	t: Translate;
}

export function renderBadgeStyleSection({
	containerEl,
	plugin,
	t,
}: BadgeStyleSectionOptions): void {
	new Setting(containerEl).setName(t("badgeStylesHeading")).setHeading();

	new Setting(containerEl)
		.setName(t("badgeRadiusName"))
		.setDesc(t("badgeRadiusDesc"))
		.addSlider((slider) =>
			slider
				.setLimits(0, 99, 1)
				.setDynamicTooltip()
				.setValue(plugin.settings.prefixStyles.badgeRadius)
				.onChange(async (value) => {
					await plugin.applySettings({
						prefixStyles: {
							...plugin.settings.prefixStyles,
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
		const slotContainerEl = slotDetailsEl.createDiv("o-decimal-style-slot-body");

		if (slot.id === "warningBadge") {
			renderWarningBadgeSettings(slotContainerEl, plugin, t);
		}

		if (slot.id === "hiddenBadge") {
			renderHiddenBadgeSettings(slotContainerEl, plugin, t);
		}

		new Setting(slotContainerEl)
			.setName(t("badgeBackgroundColorName"))
			.setDesc(t("badgeBackgroundColorDesc"))
			.addColorPicker((picker) =>
				picker
					.setValue(
						plugin.settings.prefixStyles.slots[slot.id].backgroundColor ||
							slot.colorPickerFallback,
					)
					.onChange(async (value) => {
						await plugin.applySettings({
							prefixStyles: updatePrefixStyleSlot(
								plugin.settings.prefixStyles,
								slot.id,
								{ backgroundColor: value },
							),
						});
					}),
			)
			.addExtraButton((button) =>
				button
					.setIcon("reset")
					.setTooltip(t("resetThemeDefault"))
					.onClick(async () => {
						await plugin.applySettings({
							prefixStyles: updatePrefixStyleSlot(
								plugin.settings.prefixStyles,
								slot.id,
								{ backgroundColor: "" },
							),
						});
					}),
			);

		new Setting(slotContainerEl)
			.setName(t("badgeTextColorName"))
			.setDesc(t("badgeTextColorDesc"))
			.addColorPicker((picker) =>
				picker
					.setValue(
						plugin.settings.prefixStyles.slots[slot.id].textColor ||
							slot.textColorPickerFallback,
					)
					.onChange(async (value) => {
						await plugin.applySettings({
							prefixStyles: updatePrefixStyleSlot(
								plugin.settings.prefixStyles,
								slot.id,
								{ textColor: value },
							),
						});
					}),
			)
			.addExtraButton((button) =>
				button
					.setIcon("reset")
					.setTooltip(t("resetThemeDefault"))
					.onClick(async () => {
						await plugin.applySettings({
							prefixStyles: updatePrefixStyleSlot(
								plugin.settings.prefixStyles,
								slot.id,
								{ textColor: "" },
							),
						});
					}),
			);

		new Setting(slotContainerEl)
			.setName(t("badgeBackgroundOpacityName"))
			.setDesc(t("badgeBackgroundOpacityDesc"))
			.addSlider((slider) =>
				slider
					.setLimits(0, 100, 1)
					.setDynamicTooltip()
					.setValue(plugin.settings.prefixStyles.slots[slot.id].backgroundOpacity)
					.onChange(async (value) => {
						await plugin.applySettings({
							prefixStyles: updatePrefixStyleSlot(
								plugin.settings.prefixStyles,
								slot.id,
								{ backgroundOpacity: value },
							),
						});
					}),
			);
	}

	renderAdvancedBadgeStyles(containerEl, plugin, t);
}

function renderWarningBadgeSettings(
	containerEl: HTMLElement,
	plugin: ODecimalPlugin,
	t: Translate,
): void {
	new Setting(containerEl)
		.setName(t("showMissingPrefixBadgeName"))
		.setDesc(t("showMissingPrefixBadgeDesc"))
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.showMissingPrefixBadge)
				.onChange(async (value) => {
					await plugin.applySettings({
						showMissingPrefixBadge: value,
					});
				}),
		);

	new Setting(containerEl)
		.setName(t("missingPrefixBadgeTextName"))
		.setDesc(t("missingPrefixBadgeTextDesc"))
		.addText((text) =>
			text
				.setPlaceholder("?")
				.setValue(plugin.settings.missingPrefixBadgeText)
				.onChange(async (value) => {
					await plugin.applySettings({
						missingPrefixBadgeText: value || "?",
					});
				}),
		);
}

function renderHiddenBadgeSettings(
	containerEl: HTMLElement,
	plugin: ODecimalPlugin,
	t: Translate,
): void {
	const showHiddenFilesSetting = new Setting(containerEl)
		.setName(t("showHiddenFilesName"))
		.setDesc(t("showHiddenFilesDesc"))
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.showHiddenFiles)
				.onChange(async (value) => {
					setSettingLoading(
						showHiddenFilesSetting,
						true,
						t("showHiddenFilesLoading"),
					);
					try {
						await plugin.applySettings({
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

	new Setting(containerEl)
		.setName(t("showHiddenItemBadgeName"))
		.setDesc(t("showHiddenItemBadgeDesc"))
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.showHiddenItemBadge)
				.onChange(async (value) => {
					await plugin.applySettings({
						showHiddenItemBadge: value,
					});
				}),
		);

	new Setting(containerEl)
		.setName(t("hiddenItemBadgeTextName"))
		.setDesc(t("hiddenItemBadgeTextDesc"))
		.addText((text) =>
			text
				.setPlaceholder(".")
				.setValue(plugin.settings.hiddenItemBadgeText)
				.onChange(async (value) => {
					await plugin.applySettings({
						hiddenItemBadgeText: value || ".",
					});
				}),
		);
}

function renderAdvancedBadgeStyles(
	containerEl: HTMLElement,
	plugin: ODecimalPlugin,
	t: Translate,
): void {
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
	advancedCssInputEl.value = plugin.settings.prefixStyles.advancedCss;
	advancedCssInputEl.addEventListener("change", () => {
		void plugin.applySettings({
			prefixStyles: {
				...plugin.settings.prefixStyles,
				advancedCss: advancedCssInputEl.value,
			},
		});
	});
	const advancedHelpEl = advancedContainerEl.createDiv("o-decimal-advanced-css-help");
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

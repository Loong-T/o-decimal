import { setIcon, Setting, type App } from "obsidian";
import {
	createEmptyConditionalBadgeRule,
	getConditionalBadgeRuleIconId,
	type ConditionalBadgeMatchMode,
	type ConditionalBadgeRule,
	type ConditionalBadgeTarget,
} from "./conditionalBadgeRules";
import { createTranslator } from "./i18n";
import { IconPickerModal } from "./iconPickerModal";
import type ODecimalPlugin from "./main";
import {
	bindRuleTextInput,
	normalizeImportedSvgContent,
	pickSvgFile,
	renderIconPickerButton,
} from "./settingsHelpers";
import {
	moveConditionalBadgeRule,
	updateConditionalBadgeRuleAt,
} from "./settingsState";

type Translate = ReturnType<typeof createTranslator>;

export interface ConditionalBadgeSectionState {
	openState: Map<string, boolean>;
	draggingRuleId: string | null;
}

interface ConditionalBadgeSectionOptions {
	app: App;
	containerEl: HTMLElement;
	plugin: ODecimalPlugin;
	t: Translate;
	state: ConditionalBadgeSectionState;
}

export function renderConditionalBadgeSection({
	app,
	containerEl,
	plugin,
	t,
	state,
}: ConditionalBadgeSectionOptions): void {
	new Setting(containerEl)
		.setName(t("conditionalBadgesHeading"))
		.setHeading();

	containerEl.createDiv({
		cls: "o-decimal-conditional-badge-info",
		text: t("conditionalBadgesDesc"),
	});

	const conditionalBadgeListEl = containerEl.createDiv({
		cls: "o-decimal-conditional-badge-list",
	});

	const updateConditionalBadgeRules = async (
		nextRules: ConditionalBadgeRule[],
	): Promise<void> => {
		await plugin.applySettings({
			conditionalBadgeRules: nextRules,
		});
		renderConditionalBadgeRules();
	};

	const renderConditionalBadgeRules = (): void => {
		conditionalBadgeListEl.empty();

		for (const [index, rule] of plugin.settings.conditionalBadgeRules.entries()) {
			renderConditionalBadgeRule({
				app,
				containerEl: conditionalBadgeListEl,
				index,
				plugin,
				rule,
				state,
				t,
				updateConditionalBadgeRules,
			});
		}
	};

	renderConditionalBadgeRules();

	const addRuleSetting = new Setting(containerEl)
		.setName(t("conditionalBadgeAddRuleName"))
		.setDesc(t("conditionalBadgeAddRuleDesc"))
		.addButton((button) =>
			button.setButtonText(t("conditionalBadgeAddRuleButton")).onClick(async () => {
				const nextRule = createEmptyConditionalBadgeRule();
				state.openState.set(nextRule.id, true);
				await updateConditionalBadgeRules([
					...plugin.settings.conditionalBadgeRules,
					nextRule,
				]);
			}),
		);
	addRuleSetting.settingEl.addClass("o-decimal-conditional-badge-add");
}

interface ConditionalBadgeRuleOptions {
	app: App;
	containerEl: HTMLElement;
	index: number;
	plugin: ODecimalPlugin;
	rule: ConditionalBadgeRule;
	state: ConditionalBadgeSectionState;
	t: Translate;
	updateConditionalBadgeRules: (nextRules: ConditionalBadgeRule[]) => Promise<void>;
}

function renderConditionalBadgeRule({
	app,
	containerEl,
	index,
	plugin,
	rule,
	state,
	t,
	updateConditionalBadgeRules,
}: ConditionalBadgeRuleOptions): void {
	const ruleDetailsEl = containerEl.createEl("details", {
		cls: "o-decimal-style-slot",
	});
	ruleDetailsEl.addClass("o-decimal-conditional-rule");
	ruleDetailsEl.open = state.openState.get(rule.id) ?? false;
	ruleDetailsEl.addEventListener("toggle", () => {
		state.openState.set(rule.id, ruleDetailsEl.open);
	});
	ruleDetailsEl.addEventListener("dragover", (event) => {
		if (!state.draggingRuleId || state.draggingRuleId === rule.id) {
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
		const draggedRuleId = state.draggingRuleId;
		state.draggingRuleId = null;
		if (!draggedRuleId || draggedRuleId === rule.id) {
			return;
		}

		const currentRules = plugin.settings.conditionalBadgeRules;
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
		state.draggingRuleId = rule.id;
		ruleDetailsEl.addClass("is-dragging");
		event.dataTransfer?.setData("text/plain", rule.id);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "move";
		}
	});
	dragHandleEl.addEventListener("dragend", () => {
		state.draggingRuleId = null;
		ruleDetailsEl.removeClass("is-dragging");
		containerEl
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
						plugin.settings.conditionalBadgeRules,
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
							plugin.settings.conditionalBadgeRules,
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
							plugin.settings.conditionalBadgeRules,
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
				.addOption("full-name-exact", t("conditionalBadgeMatchModeFullNameExact"))
				.addOption(
					"display-name-exact",
					t("conditionalBadgeMatchModeDisplayNameExact"),
				)
				.addOption("extension-exact", t("conditionalBadgeMatchModeExtensionExact"))
				.addOption("full-name-regex", t("conditionalBadgeMatchModeFullNameRegex"))
				.addOption("path-regex", t("conditionalBadgeMatchModePathRegex"))
				.setValue(rule.matchMode)
				.onChange(async (value) => {
					await updateConditionalBadgeRules(
						updateConditionalBadgeRuleAt(
							plugin.settings.conditionalBadgeRules,
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
						plugin.settings.conditionalBadgeRules,
						index,
						{ pattern: value },
					),
				);
			}),
		);

	renderConditionalBadgeIconSetting({
		app,
		index,
		plugin,
		rule,
		ruleBodyEl,
		t,
		updateConditionalBadgeRules,
	});
	renderConditionalBadgeSvgSetting({
		index,
		plugin,
		rule,
		ruleBodyEl,
		t,
		updateConditionalBadgeRules,
	});
	renderConditionalBadgeColorSettings({
		index,
		plugin,
		rule,
		ruleBodyEl,
		t,
		updateConditionalBadgeRules,
	});

	new Setting(ruleBodyEl)
		.setName(t("conditionalBadgeTextName"))
		.setDesc(t("conditionalBadgeTextDesc"))
		.addText((text) =>
			bindRuleTextInput(text.inputEl, rule.text, async (value) => {
				await updateConditionalBadgeRules(
					updateConditionalBadgeRuleAt(
						plugin.settings.conditionalBadgeRules,
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
						plugin.settings.conditionalBadgeRules,
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
					state.openState.delete(rule.id);
					await updateConditionalBadgeRules(
						plugin.settings.conditionalBadgeRules.filter(
							(_, currentIndex) => currentIndex !== index,
						),
					);
				}),
		);
}

function renderConditionalBadgeIconSetting(
	options: {
		app: App;
		index: number;
		plugin: ODecimalPlugin;
		rule: ConditionalBadgeRule;
		ruleBodyEl: HTMLElement;
		t: Translate;
		updateConditionalBadgeRules: (nextRules: ConditionalBadgeRule[]) => Promise<void>;
	},
): void {
	const { app, index, plugin, rule, ruleBodyEl, t, updateConditionalBadgeRules } = options;
	const iconSetting = new Setting(ruleBodyEl)
		.setName(t("conditionalBadgeIconName"))
		.setDesc(
			rule.icon.trim().length > 0
				? t("conditionalBadgeIconDescSelected", { icon: rule.icon })
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
			app,
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
						plugin.settings.conditionalBadgeRules,
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
				plugin.settings.conditionalBadgeRules,
				index,
				{ icon: "" },
			),
		);
	});
}

function renderConditionalBadgeSvgSetting(
	options: {
		index: number;
		plugin: ODecimalPlugin;
		rule: ConditionalBadgeRule;
		ruleBodyEl: HTMLElement;
		t: Translate;
		updateConditionalBadgeRules: (nextRules: ConditionalBadgeRule[]) => Promise<void>;
	},
): void {
	const { index, plugin, rule, ruleBodyEl, t, updateConditionalBadgeRules } = options;
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
								plugin.settings.conditionalBadgeRules,
								index,
								{
									customSvg: normalizeImportedSvgContent(selectedFile.content),
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
							plugin.settings.conditionalBadgeRules,
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
}

function renderConditionalBadgeColorSettings(
	options: {
		index: number;
		plugin: ODecimalPlugin;
		rule: ConditionalBadgeRule;
		ruleBodyEl: HTMLElement;
		t: Translate;
		updateConditionalBadgeRules: (nextRules: ConditionalBadgeRule[]) => Promise<void>;
	},
): void {
	const { index, plugin, rule, ruleBodyEl, t, updateConditionalBadgeRules } = options;
	new Setting(ruleBodyEl)
		.setName(t("conditionalBadgeBackgroundColorName"))
		.setDesc(t("conditionalBadgeBackgroundColorDesc"))
		.addColorPicker((picker) =>
			picker
				.setValue(rule.backgroundColor || "#2f343c")
				.onChange(async (value) => {
					await updateConditionalBadgeRules(
						updateConditionalBadgeRuleAt(
							plugin.settings.conditionalBadgeRules,
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
							plugin.settings.conditionalBadgeRules,
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
							plugin.settings.conditionalBadgeRules,
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
							plugin.settings.conditionalBadgeRules,
							index,
							{ textColor: "" },
						),
					);
				}),
		);
}

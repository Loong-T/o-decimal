import { setIcon, Setting, type App } from "obsidian";
import {
	createEmptyStatusSuffixRule,
	getStatusSuffixRuleIconId,
	type StatusSuffixRule,
	type StatusSuffixTarget,
} from "./statusSuffixRules";
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
	moveStatusSuffixRule,
	updateStatusSuffixRuleAt,
} from "./settingsState";

type Translate = ReturnType<typeof createTranslator>;

export interface StatusSuffixSectionState {
	openState: Map<string, boolean>;
	draggingRuleId: string | null;
}

interface StatusSuffixSectionOptions {
	app: App;
	containerEl: HTMLElement;
	plugin: ODecimalPlugin;
	t: Translate;
	state: StatusSuffixSectionState;
}

export function renderStatusSuffixSection({
	app,
	containerEl,
	plugin,
	t,
	state,
}: StatusSuffixSectionOptions): void {
	new Setting(containerEl)
		.setName(t("statusSuffixHeading"))
		.setHeading();

	containerEl.createDiv({
		cls: "o-decimal-conditional-badge-info",
		text: t("statusSuffixDesc"),
	});

	new Setting(containerEl)
		.setName(t("hideMatchedStatusSuffixName"))
		.setDesc(t("hideMatchedStatusSuffixDesc"))
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.hideMatchedStatusSuffix)
				.onChange(async (value) => {
					await plugin.applySettings({
						hideMatchedStatusSuffix: value,
					});
				}),
		);

	new Setting(containerEl)
		.setName(t("showStatusSuffixTrailingBadgeName"))
		.setDesc(t("showStatusSuffixTrailingBadgeDesc"))
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.showStatusSuffixTrailingBadge)
				.onChange(async (value) => {
					await plugin.applySettings({
						showStatusSuffixTrailingBadge: value,
					});
				}),
		);

	const listEl = containerEl.createDiv({
		cls: "o-decimal-conditional-badge-list",
	});

	const updateRules = async (nextRules: StatusSuffixRule[]): Promise<void> => {
		await plugin.applySettings({
			statusSuffixRules: nextRules,
		});
		renderRules();
	};

	const renderRules = (): void => {
		listEl.empty();
		for (const [index, rule] of plugin.settings.statusSuffixRules.entries()) {
			renderStatusSuffixRule({
				app,
				containerEl: listEl,
				index,
				plugin,
				rule,
				state,
				t,
				updateRules,
			});
		}
	};

	renderRules();

	const addRuleSetting = new Setting(containerEl)
		.setName(t("statusSuffixAddRuleName"))
		.setDesc(t("statusSuffixAddRuleDesc"))
		.addButton((button) =>
			button.setButtonText(t("statusSuffixAddRuleButton")).onClick(async () => {
				const nextRule = createEmptyStatusSuffixRule();
				state.openState.set(nextRule.id, true);
				await updateRules([...plugin.settings.statusSuffixRules, nextRule]);
			}),
		);
	addRuleSetting.settingEl.addClass("o-decimal-conditional-badge-add");
}

interface StatusSuffixRuleOptions {
	app: App;
	containerEl: HTMLElement;
	index: number;
	plugin: ODecimalPlugin;
	rule: StatusSuffixRule;
	state: StatusSuffixSectionState;
	t: Translate;
	updateRules: (nextRules: StatusSuffixRule[]) => Promise<void>;
}

function renderStatusSuffixRule({
	app,
	containerEl,
	index,
	plugin,
	rule,
	state,
	t,
	updateRules,
}: StatusSuffixRuleOptions): void {
	const detailsEl = containerEl.createEl("details", {
		cls: "o-decimal-style-slot",
	});
	detailsEl.addClass("o-decimal-conditional-rule");
	detailsEl.open = state.openState.get(rule.id) ?? false;
	detailsEl.addEventListener("toggle", () => {
		state.openState.set(rule.id, detailsEl.open);
	});
	detailsEl.addEventListener("dragover", (event) => {
		if (!state.draggingRuleId || state.draggingRuleId === rule.id) {
			return;
		}

		event.preventDefault();
		detailsEl.addClass("is-drag-target");
	});
	detailsEl.addEventListener("dragleave", () => {
		detailsEl.removeClass("is-drag-target");
	});
	detailsEl.addEventListener("drop", (event) => {
		event.preventDefault();
		detailsEl.removeClass("is-drag-target");
		const draggedRuleId = state.draggingRuleId;
		state.draggingRuleId = null;
		if (!draggedRuleId || draggedRuleId === rule.id) {
			return;
		}

		const currentRules = plugin.settings.statusSuffixRules;
		const fromIndex = currentRules.findIndex((candidate) => candidate.id === draggedRuleId);
		if (fromIndex === -1) {
			return;
		}

		void updateRules(moveStatusSuffixRule(currentRules, fromIndex, index));
	});

	const summaryEl = detailsEl.createEl("summary", {
		cls: "o-decimal-conditional-rule-summary",
	});
	summaryEl.createSpan({
		cls: "o-decimal-conditional-rule-summary-label",
		text:
			rule.name.trim().length > 0
				? t("statusSuffixRuleSummary", {
					index: String(index + 1),
					name: rule.name,
				})
				: t("statusSuffixRuleSummaryEmpty", {
					index: String(index + 1),
				}),
	});
	const summaryActionsEl = summaryEl.createSpan({
		cls: "o-decimal-conditional-rule-summary-actions",
	});
	const deleteButtonEl = summaryActionsEl.createEl("button", {
		cls: "clickable-icon o-decimal-conditional-rule-delete",
		attr: {
			type: "button",
			"aria-label": t("statusSuffixDeleteRule"),
			title: t("statusSuffixDeleteRule"),
		},
	});
	setIcon(deleteButtonEl, "trash");
	deleteButtonEl.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		state.openState.delete(rule.id);
		void updateRules(
			plugin.settings.statusSuffixRules.filter(
				(_, currentIndex) => currentIndex !== index,
			),
		);
	});
	const dragHandleEl = summaryEl.createSpan({
		cls: "o-decimal-conditional-rule-drag-handle",
		attr: {
			draggable: "true",
			role: "button",
			"aria-label": t("statusSuffixDragHandle"),
			title: t("statusSuffixDragHandle"),
		},
	});
	dragHandleEl.setText("⋮⋮");
	summaryActionsEl.appendChild(dragHandleEl);
	dragHandleEl.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
	});
	dragHandleEl.addEventListener("dragstart", (event) => {
		state.draggingRuleId = rule.id;
		detailsEl.addClass("is-dragging");
		event.dataTransfer?.setData("text/plain", rule.id);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "move";
		}
	});
	dragHandleEl.addEventListener("dragend", () => {
		state.draggingRuleId = null;
		detailsEl.removeClass("is-dragging");
		containerEl
			.querySelectorAll(".o-decimal-conditional-rule.is-drag-target")
			.forEach((element) => element.removeClass("is-drag-target"));
	});

	const bodyEl = detailsEl.createDiv("o-decimal-style-slot-body");

	new Setting(bodyEl)
		.setName(t("statusSuffixNameName"))
		.setDesc(t("statusSuffixNameDesc"))
		.addText((text) =>
			bindRuleTextInput(text.inputEl, rule.name, async (value) => {
				await updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						name: value,
					}),
				);
			}),
		);

	new Setting(bodyEl)
		.setName(t("statusSuffixEnabledName"))
		.setDesc(t("statusSuffixEnabledDesc"))
		.addToggle((toggle) =>
			toggle.setValue(rule.enabled).onChange(async (value) => {
				await updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						enabled: value,
					}),
				);
			}),
		);

	new Setting(bodyEl)
		.setName(t("statusSuffixTargetName"))
		.setDesc(t("statusSuffixTargetDesc"))
		.addDropdown((dropdown) =>
			dropdown
				.addOption("both", t("statusSuffixTargetBoth"))
				.addOption("file", t("statusSuffixTargetFile"))
				.addOption("folder", t("statusSuffixTargetFolder"))
				.setValue(rule.target)
				.onChange(async (value) => {
					await updateRules(
						updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
							target: value as StatusSuffixTarget,
						}),
					);
				}),
		);

	new Setting(bodyEl)
		.setName(t("statusSuffixPatternName"))
		.setDesc(t("statusSuffixPatternDesc"))
		.addText((text) =>
			bindRuleTextInput(text.inputEl, rule.pattern, async (value) => {
				await updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						pattern: value,
					}),
				);
			}),
		);

	new Setting(bodyEl)
		.setName(t("statusSuffixShowInMenuName"))
		.setDesc(t("statusSuffixShowInMenuDesc"))
		.addToggle((toggle) =>
			toggle.setValue(rule.showInContextMenu).onChange(async (value) => {
				await updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						showInContextMenu: value,
					}),
				);
			}),
		);

	renderStatusSuffixIconSetting({
		app,
		index,
		plugin,
		rule,
		bodyEl,
		t,
		updateRules,
	});
	renderStatusSuffixSvgSetting({
		index,
		plugin,
		rule,
		bodyEl,
		t,
		updateRules,
	});
	renderStatusSuffixColorSettings({
		index,
		plugin,
		rule,
		bodyEl,
		t,
		updateRules,
	});

	new Setting(bodyEl)
		.setName(t("statusSuffixTextName"))
		.setDesc(t("statusSuffixTextDesc"))
		.addText((text) =>
			bindRuleTextInput(text.inputEl, rule.text, async (value) => {
				await updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						text: value,
					}),
				);
			}),
		);

	new Setting(bodyEl)
		.setName(t("statusSuffixTooltipName"))
		.setDesc(t("statusSuffixTooltipDesc"))
		.addText((text) =>
			bindRuleTextInput(text.inputEl, rule.tooltip, async (value) => {
				await updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						tooltip: value,
					}),
				);
			}),
		);
}

function renderStatusSuffixIconSetting(options: {
	app: App;
	index: number;
	plugin: ODecimalPlugin;
	rule: StatusSuffixRule;
	bodyEl: HTMLElement;
	t: Translate;
	updateRules: (nextRules: StatusSuffixRule[]) => Promise<void>;
}): void {
	const { app, index, plugin, rule, bodyEl, t, updateRules } = options;
	const iconSetting = new Setting(bodyEl)
		.setName(t("statusSuffixIconName"))
		.setDesc(
			rule.icon.trim().length > 0
				? t("statusSuffixIconDescSelected", { icon: rule.icon })
				: t("statusSuffixIconDescEmpty"),
		);
	const pickIconButtonEl = iconSetting.controlEl.createEl("button", {
		cls: "o-decimal-icon-picker-trigger",
		attr: {
			type: "button",
			"aria-label": t("statusSuffixPickIcon"),
		},
	});
	renderIconPickerButton(
		pickIconButtonEl,
		t("statusSuffixPickIcon"),
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
				void updateRules(
					updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
						icon: iconId,
					}),
				);
			},
		).open();
	});
	const clearIconButtonEl = iconSetting.controlEl.createEl("button", {
		cls: "clickable-icon o-decimal-icon-picker-clear",
		attr: {
			type: "button",
			"aria-label": t("statusSuffixClearIcon"),
		},
	});
	setIcon(clearIconButtonEl, "x");
	clearIconButtonEl.setAttribute("title", t("statusSuffixClearIcon"));
	clearIconButtonEl.addEventListener("click", () => {
		void updateRules(
			updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
				icon: "",
			}),
		);
	});
}

function renderStatusSuffixSvgSetting(options: {
	index: number;
	plugin: ODecimalPlugin;
	rule: StatusSuffixRule;
	bodyEl: HTMLElement;
	t: Translate;
	updateRules: (nextRules: StatusSuffixRule[]) => Promise<void>;
}): void {
	const { index, plugin, rule, bodyEl, t, updateRules } = options;
	const svgSetting = new Setting(bodyEl)
		.setName(t("statusSuffixCustomSvgName"))
		.setDesc(
			rule.customSvgName.trim().length > 0
				? t("statusSuffixCustomSvgDescSelected", {
					file: rule.customSvgName,
				})
				: t("statusSuffixCustomSvgDesc"),
		)
		.addButton((button) =>
			button
				.setButtonText(t("statusSuffixChooseSvgFile"))
				.onClick(() => {
					void pickSvgFile().then(async (selectedFile) => {
						if (!selectedFile) {
							return;
						}

						await updateRules(
							updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
								customSvg: normalizeImportedSvgContent(selectedFile.content),
								customSvgName: selectedFile.name,
							}),
						);
					});
				}),
		)
		.addExtraButton((button) =>
			button
				.setIcon("x")
				.setTooltip(t("statusSuffixClearSvgFile"))
				.onClick(async () => {
					await updateRules(
						updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
							customSvg: "",
							customSvgName: "",
						}),
					);
				}),
		);
	const svgButtonEl = svgSetting.controlEl.querySelector("button");
	if (svgButtonEl instanceof HTMLButtonElement) {
		renderIconPickerButton(
			svgButtonEl,
			t("statusSuffixChooseSvgFile"),
			rule.customSvg.trim().length > 0
				? getStatusSuffixRuleIconId(rule)
				: null,
		);
	}
}

function renderStatusSuffixColorSettings(options: {
	index: number;
	plugin: ODecimalPlugin;
	rule: StatusSuffixRule;
	bodyEl: HTMLElement;
	t: Translate;
	updateRules: (nextRules: StatusSuffixRule[]) => Promise<void>;
}): void {
	const { index, plugin, rule, bodyEl, t, updateRules } = options;
	new Setting(bodyEl)
		.setName(t("statusSuffixBackgroundColorName"))
		.setDesc(t("statusSuffixBackgroundColorDesc"))
		.addColorPicker((picker) =>
			picker
				.setValue(rule.backgroundColor || "#1f9d55")
				.onChange(async (value) => {
					await updateRules(
						updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
							backgroundColor: value,
						}),
					);
				}),
		)
		.addExtraButton((button) =>
			button
				.setIcon("reset")
				.setTooltip(t("resetThemeDefault"))
				.onClick(async () => {
					await updateRules(
						updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
							backgroundColor: "",
						}),
					);
				}),
		);

	new Setting(bodyEl)
		.setName(t("statusSuffixTextColorName"))
		.setDesc(t("statusSuffixTextColorDesc"))
		.addColorPicker((picker) =>
			picker
				.setValue(rule.textColor || "#ffffff")
				.onChange(async (value) => {
					await updateRules(
						updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
							textColor: value,
						}),
					);
				}),
		)
		.addExtraButton((button) =>
			button
				.setIcon("reset")
				.setTooltip(t("resetThemeDefault"))
				.onClick(async () => {
					await updateRules(
						updateStatusSuffixRuleAt(plugin.settings.statusSuffixRules, index, {
							textColor: "",
						}),
					);
				}),
		);
}

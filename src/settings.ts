import { App, PluginSettingTab, Setting } from "obsidian";
import { createTranslator, type PluginLanguage } from "./i18n";
import type ODecimalPlugin from "./main";

export type TreeItemTypePriority = "mixed" | "folders-first" | "files-first";

export interface ODecimalSettings {
	language: PluginLanguage;
	enableNumericMixedSorting: boolean;
	treeItemTypePriority: TreeItemTypePriority;
}

export const DEFAULT_SETTINGS: ODecimalSettings = {
	language: "auto",
	enableNumericMixedSorting: true,
	treeItemTypePriority: "mixed",
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

		new Setting(containerEl).setName(t("settingsSectionHeading")).setHeading();

		let typePrioritySetting: Setting | null = null;

		const updateTypePriorityState = (enabled: boolean): void => {
			typePrioritySetting?.settingEl.toggleClass("o-decimal-setting-disabled", !enabled);
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
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						await this.plugin.applySettings({
							language: value as PluginLanguage,
						});
						this.display();
					}),
			);

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
	}
}

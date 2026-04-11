import { App, PluginSettingTab } from "obsidian";
import type { ConditionalBadgeRule } from "./conditionalBadgeRules";
import { renderBasicSettingsSection } from "./basicSettingsSection";
import { renderBadgeStyleSection } from "./badgeStyleSettingsSection";
import {
	renderConditionalBadgeSection,
	type ConditionalBadgeSectionState,
} from "./conditionalBadgeSettingsSection";
import { createTranslator, type PluginLanguage } from "./i18n";
import type ODecimalPlugin from "./main";
import { DEFAULT_NUMERIC_PREFIX_PATTERN } from "./prefix";
import {
	DEFAULT_PREFIX_STYLE_SETTINGS,
	type PrefixDisplayMode,
	type PrefixStyleSettings,
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
	private readonly conditionalBadgeSectionState: ConditionalBadgeSectionState = {
		openState: new Map<string, boolean>(),
		draggingRuleId: null,
	};

	constructor(app: App, plugin: ODecimalPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const t = createTranslator(this.plugin.settings.language);

		renderBasicSettingsSection({
			containerEl,
			plugin: this.plugin,
			t,
		});
		renderConditionalBadgeSection({
			app: this.app,
			containerEl,
			plugin: this.plugin,
			t,
			state: this.conditionalBadgeSectionState,
		});
		renderBadgeStyleSection({
			containerEl,
			plugin: this.plugin,
			t,
		});
	}
}

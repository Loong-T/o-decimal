import { addIcon, Notice, Plugin } from "obsidian";
import {
	DEFAULT_CONDITIONAL_BADGE_RULES,
	getConditionalBadgeRuleIconId,
	normalizeConditionalBadgeRules,
} from "./conditionalBadgeRules";
import { FileExplorerEnhancer } from "./fileExplorerEnhancer";
import { HiddenFilesManager } from "./hiddenFilesManager";
import { createTranslator } from "./i18n";
import {
	DEFAULT_NUMERIC_PREFIX_PATTERN,
	normalizePrefixPatternSource,
} from "./prefix";
import { DEFAULT_SETTINGS, ODecimalSettingTab, type ODecimalSettings } from "./settings";
import { normalizePrefixStyleSettings, type PrefixDisplayMode } from "./prefixStyle";
import { StyleManager } from "./styleManager";

export default class ODecimalPlugin extends Plugin {
	settings: ODecimalSettings = DEFAULT_SETTINGS;
	private enhancer: FileExplorerEnhancer | null = null;
	private hiddenFilesManager: HiddenFilesManager | null = null;
	private styleManager: StyleManager | null = null;

	async onload(): Promise<void> {
		registerCustomBadgeIcons();
		await this.loadSettings();
		registerConditionalBadgeRuleIcons(this.settings);

		this.styleManager = new StyleManager();
		this.styleManager.apply(this.settings.prefixStyles);

		this.hiddenFilesManager = new HiddenFilesManager(this.app, () => this.settings);
		this.hiddenFilesManager.start();

		this.enhancer = new FileExplorerEnhancer(this.app, () => this.settings);
		this.enhancer.start();

		this.registerCommands();
		this.addSettingTab(new ODecimalSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
		});
		this.registerEvent(
			this.app.vault.on("create", () => {
				if (this.hiddenFilesManager?.isSyncing()) {
					return;
				}
				this.hiddenFilesManager?.scheduleSync();
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => {
				if (this.hiddenFilesManager?.isSyncing()) {
					return;
				}
				this.hiddenFilesManager?.scheduleSync();
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
		this.registerEvent(
			this.app.vault.on("rename", () => {
				if (this.hiddenFilesManager?.isSyncing()) {
					return;
				}
				this.hiddenFilesManager?.scheduleSync();
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
	}

	onunload(): void {
		this.enhancer?.stop();
		this.enhancer = null;
		this.hiddenFilesManager?.stop();
		this.hiddenFilesManager = null;
		this.styleManager?.destroy();
		this.styleManager = null;
	}

	async applySettings(update: Partial<ODecimalSettings>): Promise<void> {
		const shouldAwaitHiddenFilesSync =
			update.showHiddenFiles !== undefined &&
			update.showHiddenFiles !== this.settings.showHiddenFiles;
		const normalizedPrefixPattern =
			typeof update.prefixPattern === "string"
				? normalizePrefixPatternSource(update.prefixPattern)
				: this.settings.prefixPattern;
		const normalizedConditionalBadgeRules =
			update.conditionalBadgeRules !== undefined
				? normalizeConditionalBadgeRules(update.conditionalBadgeRules)
				: this.settings.conditionalBadgeRules;
		this.settings = {
			...this.settings,
			...update,
			prefixPattern: normalizedPrefixPattern,
			conditionalBadgeRules: normalizedConditionalBadgeRules,
			prefixStyles: update.prefixStyles ?? this.settings.prefixStyles,
		};
		await this.saveSettings();
		registerConditionalBadgeRuleIcons(this.settings);
		this.styleManager?.apply(this.settings.prefixStyles);
		this.hiddenFilesManager?.scheduleSync();
		this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
		if (shouldAwaitHiddenFilesSync) {
			await this.hiddenFilesManager?.whenSettled();
			if (update.showHiddenFiles === false) {
				this.hiddenFilesManager?.scheduleSync();
				await this.hiddenFilesManager?.whenSettled();
			}
		}
	}

	private async loadSettings(): Promise<void> {
		const loadedData = await this.loadData() as Partial<ODecimalSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...loadedData,
			prefixPattern:
				typeof loadedData?.prefixPattern === "string" &&
				loadedData.prefixPattern.trim().length > 0
					? normalizePrefixPatternSource(loadedData.prefixPattern)
					: DEFAULT_NUMERIC_PREFIX_PATTERN,
			conditionalBadgeRules: normalizeConditionalBadgeRules(
				loadedData?.conditionalBadgeRules ?? DEFAULT_CONDITIONAL_BADGE_RULES,
			),
			prefixStyles: normalizePrefixStyleSettings(loadedData?.prefixStyles),
		};
	}

	private async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private registerCommands(): void {
		const t = createTranslator(this.settings.language);

		this.addCommand({
			id: "cycle-prefix-display-mode",
			name: t("commandCyclePrefixDisplayName"),
			callback: async () => {
				const nextMode = getNextPrefixDisplayMode(this.settings.prefixDisplayMode);
				await this.setPrefixDisplayMode(nextMode);
			},
		});

		this.addCommand({
			id: "set-prefix-display-original",
			name: t("commandSetPrefixDisplayOriginalName"),
			callback: async () => {
				await this.setPrefixDisplayMode("original");
			},
		});

		this.addCommand({
			id: "set-prefix-display-badge",
			name: t("commandSetPrefixDisplayBadgeName"),
			callback: async () => {
				await this.setPrefixDisplayMode("badge");
			},
		});

		this.addCommand({
			id: "set-prefix-display-hidden",
			name: t("commandSetPrefixDisplayHiddenName"),
			callback: async () => {
				await this.setPrefixDisplayMode("hidden");
			},
		});

		this.addCommand({
			id: "toggle-missing-prefix-warning-badge",
			name: t("commandToggleMissingPrefixBadgeName"),
			callback: async () => {
				const enabled = !this.settings.showMissingPrefixBadge;
				await this.applySettings({
					showMissingPrefixBadge: enabled,
				});
				new Notice(
					enabled
						? t("noticeMissingPrefixBadgeEnabled")
						: t("noticeMissingPrefixBadgeDisabled"),
				);
			},
		});
	}

	private async setPrefixDisplayMode(mode: PrefixDisplayMode): Promise<void> {
		if (this.settings.prefixDisplayMode === mode) {
			return;
		}

		await this.applySettings({
			prefixDisplayMode: mode,
		});

		const t = createTranslator(this.settings.language);
		new Notice(
			t("noticePrefixDisplayChanged", {
				mode: getPrefixDisplayModeLabel(t, mode),
			}),
		);
	}
}

function registerCustomBadgeIcons(): void {
	addIcon(
		"o-decimal-readme",
		'<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M14 3v5h5"></path><path d="M9 13h6"></path><path d="M9 17h6"></path><path d="M9 9h2"></path>',
	);
	addIcon(
		"o-decimal-agent",
		'<rect x="5" y="8" width="14" height="10" rx="3"></rect><path d="M12 3v2"></path><path d="M9 13h.01"></path><path d="M15 13h.01"></path><path d="M9.5 17h5"></path><path d="M8 8a4 4 0 0 1 8 0"></path>',
	);
}

function registerConditionalBadgeRuleIcons(settings: ODecimalSettings): void {
	for (const rule of settings.conditionalBadgeRules) {
		if (rule.customSvg.trim().length === 0) {
			continue;
		}

		const iconId = getConditionalBadgeRuleIconId(rule);
		if (!iconId) {
			continue;
		}

		addIcon(iconId, rule.customSvg);
	}
}

function getNextPrefixDisplayMode(current: PrefixDisplayMode): PrefixDisplayMode {
	if (current === "original") {
		return "badge";
	}
	if (current === "badge") {
		return "hidden";
	}
	return "original";
}

function getPrefixDisplayModeLabel(
	t: ReturnType<typeof createTranslator>,
	mode: PrefixDisplayMode,
): string {
	if (mode === "original") {
		return t("prefixDisplayModeOriginal");
	}
	if (mode === "badge") {
		return t("prefixDisplayModeBadge");
	}
	return t("prefixDisplayModeHidden");
}

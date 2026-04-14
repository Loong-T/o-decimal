import { addIcon, Notice, Plugin, TAbstractFile, normalizePath } from "obsidian";
import {
	DEFAULT_CONDITIONAL_BADGE_RULES,
	getConditionalBadgeRuleIconId,
	normalizeConditionalBadgeRules,
} from "./conditionalBadgeRules";
import {
	DEFAULT_STATUS_SUFFIX_RULES,
	deriveStatusSuffixWriteBack,
	findMatchingStatusSuffixRule,
	getStatusSuffixRuleIconId,
	normalizeStatusSuffixRules,
	removeMatchedStatusSuffix,
	splitNameForStatusSuffix,
	type StatusSuffixRule,
} from "./statusSuffixRules";
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
		registerStatusSuffixRuleIcons(this.settings);

		this.styleManager = new StyleManager();
		this.styleManager.apply(this.settings.prefixStyles);

		this.hiddenFilesManager = new HiddenFilesManager(this.app, () => this.settings);
		this.hiddenFilesManager.start();

		this.enhancer = new FileExplorerEnhancer(this.app, () => this.settings);
		this.enhancer.start();

		this.registerCommands();
		this.registerStatusSuffixMenu();
		this.addSettingTab(new ODecimalSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
		});
		this.registerVaultRefreshEvents();
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
		const normalizedStatusSuffixRules =
			update.statusSuffixRules !== undefined
				? normalizeStatusSuffixRules(update.statusSuffixRules)
				: this.settings.statusSuffixRules;
		this.settings = {
			...this.settings,
			...update,
			prefixPattern: normalizedPrefixPattern,
			conditionalBadgeRules: normalizedConditionalBadgeRules,
			statusSuffixRules: normalizedStatusSuffixRules,
			prefixStyles: update.prefixStyles ?? this.settings.prefixStyles,
		};
		await this.saveSettings();
		registerConditionalBadgeRuleIcons(this.settings);
		registerStatusSuffixRuleIcons(this.settings);
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
			statusSuffixRules: normalizeStatusSuffixRules(
				loadedData?.statusSuffixRules ?? DEFAULT_STATUS_SUFFIX_RULES,
			),
			prefixStyles: normalizePrefixStyleSettings(loadedData?.prefixStyles),
		};
	}

	private async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private registerVaultRefreshEvents(): void {
		this.registerEvent(this.app.vault.on("create", () => this.handleVaultMutation()));
		this.registerEvent(this.app.vault.on("delete", () => this.handleVaultMutation()));
		this.registerEvent(this.app.vault.on("rename", () => this.handleVaultMutation()));
	}

	private handleVaultMutation(): void {
		if (this.hiddenFilesManager?.isSyncing()) {
			return;
		}

		this.hiddenFilesManager?.scheduleSync();
		this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
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

	private registerStatusSuffixMenu(): void {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				const enabledRules = this.settings.statusSuffixRules.filter(
					(rule) =>
						rule.enabled &&
						rule.showInContextMenu &&
						deriveStatusSuffixWriteBack(rule.pattern).length > 0,
				);
				const matchContext = {
					file,
					fullName: file.name,
					matchableName: splitNameForStatusSuffix(file).matchableName,
				};
				const currentMatch = findMatchingStatusSuffixRule(
					this.settings.statusSuffixRules,
					matchContext,
				);
				if (enabledRules.length === 0 && !currentMatch) {
					return;
				}

				const t = createTranslator(this.settings.language);
				menu.addSeparator();
				menu.addItem((item) =>
					item
						.setTitle(t("statusSuffixMenuLabel"))
						.setIsLabel(true)
						.setSection("o-decimal-status-suffix"),
				);

				for (const rule of enabledRules) {
					menu.addItem((item) =>
						item
							.setTitle(
								t("statusSuffixMenuSetRule", {
									status: getStatusSuffixRuleMenuLabel(rule),
								}),
							)
							.setSection("o-decimal-status-suffix")
							.setChecked(currentMatch?.rule.id === rule.id)
							.onClick(() => {
								void this.applyStatusSuffixRule(file, rule);
							}),
					);
				}

				if (currentMatch) {
					menu.addItem((item) =>
						item
							.setTitle(t("statusSuffixMenuClear"))
							.setSection("o-decimal-status-suffix")
							.onClick(() => {
								void this.clearStatusSuffix(file);
							}),
					);
				}
			}),
		);
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

	private async applyStatusSuffixRule(
		file: TAbstractFile,
		rule: StatusSuffixRule,
	): Promise<void> {
		const writeBackSuffix = deriveStatusSuffixWriteBack(rule.pattern);
		if (writeBackSuffix.length === 0) {
			return;
		}

		const parts = splitNameForStatusSuffix(file);
		const currentMatch = findMatchingStatusSuffixRule(this.settings.statusSuffixRules, {
			file,
			fullName: file.name,
			matchableName: parts.matchableName,
		});
		const nextBaseName = `${removeMatchedStatusSuffix(parts.matchableName, currentMatch)}${writeBackSuffix}`;
		const nextName = `${nextBaseName}${parts.extensionSuffix}`;
		if (nextName === file.name) {
			return;
		}

		await this.app.fileManager.renameFile(
			file,
			buildSiblingPath(file, nextName),
		);
	}

	private async clearStatusSuffix(file: TAbstractFile): Promise<void> {
		const parts = splitNameForStatusSuffix(file);
		const currentMatch = findMatchingStatusSuffixRule(this.settings.statusSuffixRules, {
			file,
			fullName: file.name,
			matchableName: parts.matchableName,
		});
		if (!currentMatch) {
			return;
		}

		const nextName = `${removeMatchedStatusSuffix(parts.matchableName, currentMatch)}${parts.extensionSuffix}`;
		if (nextName === file.name) {
			return;
		}

		await this.app.fileManager.renameFile(
			file,
			buildSiblingPath(file, nextName),
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

function registerStatusSuffixRuleIcons(settings: ODecimalSettings): void {
	for (const rule of settings.statusSuffixRules) {
		if (rule.customSvg.trim().length === 0) {
			continue;
		}

		const iconId = getStatusSuffixRuleIconId(rule);
		if (!iconId) {
			continue;
		}

		addIcon(iconId, rule.customSvg);
	}
}

function getStatusSuffixRuleMenuLabel(rule: StatusSuffixRule): string {
	if (rule.name.trim().length > 0) {
		return rule.name;
	}
	if (rule.text.trim().length > 0) {
		return rule.text;
	}
	return deriveStatusSuffixWriteBack(rule.pattern);
}

function buildSiblingPath(file: TAbstractFile, name: string): string {
	const parentPath = file.parent?.path ?? "";
	return normalizePath(parentPath.length > 0 ? `${parentPath}/${name}` : name);
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

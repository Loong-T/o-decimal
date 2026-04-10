import { Notice, Plugin } from "obsidian";
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
		await this.loadSettings();

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
				this.hiddenFilesManager?.scheduleSync();
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => {
				this.hiddenFilesManager?.scheduleSync();
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
		this.registerEvent(
			this.app.vault.on("rename", () => {
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
		const normalizedPrefixPattern =
			typeof update.prefixPattern === "string"
				? normalizePrefixPatternSource(update.prefixPattern)
				: this.settings.prefixPattern;
		this.settings = {
			...this.settings,
			...update,
			prefixPattern: normalizedPrefixPattern,
			prefixStyles: update.prefixStyles ?? this.settings.prefixStyles,
		};
		await this.saveSettings();
		this.styleManager?.apply(this.settings.prefixStyles);
		this.hiddenFilesManager?.scheduleSync();
		this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
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

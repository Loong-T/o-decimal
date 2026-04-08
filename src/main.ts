import { Plugin } from "obsidian";
import { FileExplorerEnhancer } from "./fileExplorerEnhancer";
import { DEFAULT_SETTINGS, ODecimalSettingTab, type ODecimalSettings } from "./settings";
import { normalizePrefixStyleSettings } from "./prefixStyle";
import { StyleManager } from "./styleManager";

export default class ODecimalPlugin extends Plugin {
	settings: ODecimalSettings = DEFAULT_SETTINGS;
	private enhancer: FileExplorerEnhancer | null = null;
	private styleManager: StyleManager | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.styleManager = new StyleManager();
		this.styleManager.apply(this.settings.prefixStyles);

		this.enhancer = new FileExplorerEnhancer(this.app, () => this.settings);
		this.enhancer.start();

		this.addSettingTab(new ODecimalSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
		});
		this.registerEvent(
			this.app.vault.on("create", () => {
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => {
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
		this.registerEvent(
			this.app.vault.on("rename", () => {
				this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
			}),
		);
	}

	onunload(): void {
		this.enhancer?.stop();
		this.enhancer = null;
		this.styleManager?.destroy();
		this.styleManager = null;
	}

	async applySettings(update: Partial<ODecimalSettings>): Promise<void> {
		this.settings = {
			...this.settings,
			...update,
			prefixStyles: update.prefixStyles ?? this.settings.prefixStyles,
		};
		await this.saveSettings();
		this.styleManager?.apply(this.settings.prefixStyles);
		this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
	}

	private async loadSettings(): Promise<void> {
		const loadedData = await this.loadData() as Partial<ODecimalSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...loadedData,
			prefixStyles: normalizePrefixStyleSettings(loadedData?.prefixStyles),
		};
	}

	private async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

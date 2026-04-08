import { Plugin } from "obsidian";
import { FileExplorerEnhancer } from "./fileExplorerEnhancer";
import { DEFAULT_SETTINGS, ODecimalSettingTab, type ODecimalSettings } from "./settings";

export default class ODecimalPlugin extends Plugin {
	settings: ODecimalSettings = DEFAULT_SETTINGS;
	private enhancer: FileExplorerEnhancer | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();

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
	}

	async applySettings(update: Partial<ODecimalSettings>): Promise<void> {
		this.settings = {
			...this.settings,
			...update,
		};
		await this.saveSettings();
		this.enhancer?.scheduleRefreshAll({ requestNativeSort: true });
	}

	private async loadSettings(): Promise<void> {
		this.settings = {
			...DEFAULT_SETTINGS,
			...(await this.loadData() as Partial<ODecimalSettings> | null),
		};
	}

	private async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

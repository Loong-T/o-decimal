import { App } from "obsidian";
import type { ODecimalSettings } from "./settings";

type HiddenEntryType = "file" | "folder";

interface InternalVaultAdapter {
	exists(path: string, sensitive?: boolean): Promise<boolean>;
	list(path: string): Promise<{ files: string[]; folders: string[] }>;
	getRealPath?(path: string): string;
	reconcileDeletion?(realPath: string, path: string): void;
	reconcileFileInternal?(realPath: string, path: string): void;
	reconcileFolderCreation?(realPath: string, path: string): void;
}

export class HiddenFilesManager {
	private readonly hiddenEntries = new Map<string, HiddenEntryType>();
	private lastShowHiddenFiles: boolean | null = null;
	private syncPromise: Promise<void> = Promise.resolve();

	constructor(
		private readonly app: App,
		private readonly getSettings: () => ODecimalSettings,
	) {}

	start(): void {
		this.lastShowHiddenFiles = this.getSettings().showHiddenFiles;
		void this.syncVisibility();
	}

	stop(): void {
		void this.hideAllHiddenEntries();
		this.hiddenEntries.clear();
		this.lastShowHiddenFiles = null;
	}

	scheduleSync(): void {
		this.syncPromise = this.syncPromise.then(async () => {
			await this.syncVisibility();
		});
	}

	whenSettled(): Promise<void> {
		return this.syncPromise;
	}

	private async syncVisibility(): Promise<void> {
		const shouldShowHiddenFiles = this.getSettings().showHiddenFiles;
		await this.collectHiddenEntries();

		if (shouldShowHiddenFiles) {
			await this.showAllHiddenEntries();
		} else if (this.lastShowHiddenFiles) {
			await this.hideAllHiddenEntries();
		}

		this.lastShowHiddenFiles = shouldShowHiddenFiles;
	}

	private async collectHiddenEntries(): Promise<void> {
		const adapter = this.app.vault.adapter as InternalVaultAdapter;
		const entries = new Map<string, HiddenEntryType>();

		await walkDirectory(adapter, "", entries);

		this.hiddenEntries.clear();
		for (const [path, type] of entries) {
			this.hiddenEntries.set(path, type);
		}
	}

	private async showAllHiddenEntries(): Promise<void> {
		const adapter = this.app.vault.adapter as InternalVaultAdapter;
		for (const [path, type] of sortHiddenEntries(this.hiddenEntries, "show")) {
			if (this.app.vault.getAbstractFileByPath(path)) {
				continue;
			}

			const realPath = adapter.getRealPath?.(path);
			if (!realPath) {
				continue;
			}

			if (type === "folder") {
				adapter.reconcileFolderCreation?.(realPath, path);
			} else {
				adapter.reconcileFileInternal?.(realPath, path);
			}
		}
	}

	private async hideAllHiddenEntries(): Promise<void> {
		const adapter = this.app.vault.adapter as InternalVaultAdapter;
		for (const [path] of sortHiddenEntries(this.hiddenEntries, "hide")) {
			if (!this.app.vault.getAbstractFileByPath(path)) {
				continue;
			}

			const realPath = adapter.getRealPath?.(path);
			if (!realPath) {
				continue;
			}

			adapter.reconcileDeletion?.(realPath, path);
		}
	}
}

async function walkDirectory(
	adapter: InternalVaultAdapter,
	path: string,
	entries: Map<string, HiddenEntryType>,
): Promise<void> {
	const { folders, files } = await adapter.list(path);

	for (const folderPath of folders) {
		if (isHiddenPath(folderPath)) {
			entries.set(folderPath, "folder");
		}
		await walkDirectory(adapter, folderPath, entries);
	}

	for (const filePath of files) {
		if (isHiddenPath(filePath)) {
			entries.set(filePath, "file");
		}
	}
}

function isHiddenPath(path: string): boolean {
	const basename = path.split("/").pop() ?? path;
	return basename.startsWith(".");
}

function sortHiddenEntries(
	entries: Map<string, HiddenEntryType>,
	mode: "show" | "hide",
): Array<[string, HiddenEntryType]> {
	return Array.from(entries.entries()).sort(([pathA, typeA], [pathB, typeB]) => {
		const depthDelta = getPathDepth(pathA) - getPathDepth(pathB);
		if (depthDelta !== 0) {
			return mode === "show" ? depthDelta : -depthDelta;
		}

		if (typeA !== typeB) {
			if (mode === "show") {
				return typeA === "folder" ? -1 : 1;
			}
			return typeA === "folder" ? 1 : -1;
		}

		return pathA.localeCompare(pathB);
	});
}

function getPathDepth(path: string): number {
	return path === "" ? 0 : path.split("/").length;
}

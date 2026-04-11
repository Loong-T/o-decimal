import { App, TFolder } from "obsidian";
import type { ODecimalSettings } from "./settings";

type HiddenEntryType = "file" | "folder";

interface InternalVaultAdapter {
	exists(path: string, sensitive?: boolean): Promise<boolean>;
	list(path: string): Promise<{ files: string[]; folders: string[] }>;
	getRealPath?(path: string): string;
	reconcileDeletion?(realPath: string, path: string): void | Promise<void>;
	reconcileFileInternal?(realPath: string, path: string): void | Promise<void>;
	reconcileFolderCreation?(realPath: string, path: string): void | Promise<void>;
}

export class HiddenFilesManager {
	private readonly hiddenEntries = new Map<string, HiddenEntryType>();
	private lastShowHiddenFiles: boolean | null = null;
	private syncPromise: Promise<void> = Promise.resolve();
	private syncingVisibility = false;

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

	isSyncing(): boolean {
		return this.syncingVisibility;
	}

	private async syncVisibility(): Promise<void> {
		this.syncingVisibility = true;
		try {
			const shouldShowHiddenFiles = this.getSettings().showHiddenFiles;
			await this.collectHiddenEntries();

			if (shouldShowHiddenFiles) {
				await this.showAllHiddenEntries();
			} else {
				await this.hideAllHiddenEntries();
			}

			this.lastShowHiddenFiles = shouldShowHiddenFiles;
		} finally {
			this.syncingVisibility = false;
		}
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
			const existingEntry = this.app.vault.getAbstractFileByPath(path);
			if (existingEntry && type !== "folder") {
				continue;
			}

			if (type === "folder") {
				if (existingEntry) {
					await this.showFolderChildren(adapter, path);
					continue;
				}

				const realPath = adapter.getRealPath?.(path);
				if (!realPath) {
					continue;
				}

				await adapter.reconcileFolderCreation?.(realPath, path);
				await this.showFolderChildren(adapter, path);
				continue;
			}

			await adapter.reconcileFileInternal?.(path, path);
		}
	}

	private async showFolderChildren(
		adapter: InternalVaultAdapter,
		folderPath: string,
	): Promise<void> {
		const { folders, files } = await adapter.list(folderPath);

		for (const childFolderPath of folders) {
			if (this.app.vault.getAbstractFileByPath(childFolderPath)) {
				if (isHiddenPath(childFolderPath)) {
					await this.showFolderChildren(adapter, childFolderPath);
				}
				continue;
			}

			const realPath = adapter.getRealPath?.(childFolderPath);
			if (!realPath) {
				continue;
			}

			await adapter.reconcileFolderCreation?.(realPath, childFolderPath);
		}

		for (const filePath of files) {
			if (this.app.vault.getAbstractFileByPath(filePath)) {
				continue;
			}

			await adapter.reconcileFileInternal?.(filePath, filePath);
		}
	}

	private async hideAllHiddenEntries(): Promise<void> {
		const adapter = this.app.vault.adapter as InternalVaultAdapter;
		for (const [path, type] of sortHiddenEntries(this.hiddenEntries, "hide")) {
			const existingEntry = this.app.vault.getAbstractFileByPath(path);
			if (!existingEntry) {
				continue;
			}

			if (type === "folder" && existingEntry instanceof TFolder) {
				await this.hideFolderChildren(adapter, existingEntry);
			}

			const realPath = adapter.getRealPath?.(path);
			if (!realPath) {
				continue;
			}

			await adapter.reconcileDeletion?.(realPath, path);
		}
	}

	private async hideFolderChildren(
		adapter: InternalVaultAdapter,
		folder: TFolder,
	): Promise<void> {
		for (const child of [...folder.children]) {
			if (child instanceof TFolder) {
				await this.hideFolderChildren(adapter, child);
			}

			const realPath = adapter.getRealPath?.(child.path);
			if (!realPath) {
				continue;
			}

			await adapter.reconcileDeletion?.(realPath, child.path);
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

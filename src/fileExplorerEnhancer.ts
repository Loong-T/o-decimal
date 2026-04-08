import { App } from "obsidian";
import {
	getExplorerFileItems,
	getFileExplorerViews,
	getExplorerDisplayName,
	refreshExplorerTitles,
	requestNativeExplorerSort,
	type InternalFileExplorerView,
	type InternalFileTreeItem,
} from "./fileExplorer";
import { applyPrefixDisplay, restoreRawTitle } from "./prefixDisplay";
import type { ODecimalSettings } from "./settings";
import { sortTreeItems } from "./treeSort";

type AnyFunction = (...args: unknown[]) => unknown;
type PatchedTarget = Record<string, unknown>;

export interface RefreshOptions {
	requestNativeSort: boolean;
}

const DEFAULT_REFRESH_OPTIONS: RefreshOptions = {
	requestNativeSort: true,
};

export function refreshFileExplorerViews(
	app: App,
	_settings: ODecimalSettings,
	options: RefreshOptions = DEFAULT_REFRESH_OPTIONS,
): void {
	if (!options.requestNativeSort) {
		return;
	}

	for (const view of getFileExplorerViews(app)) {
		requestNativeExplorerSort(view);
	}
}

export class FileExplorerEnhancer {
	private readonly unpatches: Array<() => void> = [];
	private readonly patchedMethods = new WeakMap<object, Set<string>>();
	private refreshAllTimer: number | null = null;

	constructor(
		private readonly app: App,
		private readonly getSettings: () => ODecimalSettings,
	) {}

	start(): void {
		this.ensurePatchesInstalled();
		this.scheduleRefreshAll({ requestNativeSort: true });
	}

	stop(): void {
		if (this.refreshAllTimer !== null) {
			window.clearTimeout(this.refreshAllTimer);
			this.refreshAllTimer = null;
		}

		const views = getFileExplorerViews(this.app);
		while (this.unpatches.length > 0) {
			this.unpatches.pop()?.();
		}

		for (const view of views) {
			requestNativeExplorerSort(view);
		}
	}

	scheduleRefreshAll(options: RefreshOptions = DEFAULT_REFRESH_OPTIONS): void {
		if (this.refreshAllTimer !== null) {
			window.clearTimeout(this.refreshAllTimer);
		}

		this.refreshAllTimer = window.setTimeout(() => {
			this.refreshAllTimer = null;
			this.ensurePatchesInstalled();
			if (options.requestNativeSort) {
				this.refreshAll();
			}
		}, 0);
	}

	private refreshAll(): void {
		for (const view of getFileExplorerViews(this.app)) {
			refreshExplorerTitles(view);
			requestNativeExplorerSort(view);
		}
	}

	private ensurePatchesInstalled(): void {
		for (const view of getFileExplorerViews(this.app)) {
			this.patchViewPrototype(Object.getPrototypeOf(view) as PatchedTarget);
			for (const item of getExplorerFileItems(view)) {
				this.patchItemPrototype(Object.getPrototypeOf(item) as PatchedTarget);
			}
		}
	}

	private patchViewPrototype(prototype: PatchedTarget): void {
		const getSettings = (): ODecimalSettings => this.getSettings();

		this.patchMethod(prototype, "getSortedFolderItems", (original) => {
			return function (this: InternalFileExplorerView, ...args: unknown[]) {
				const items = original.apply(this, args) as InternalFileTreeItem[];
				if (!getSettings().enableNumericMixedSorting || !Array.isArray(items)) {
					return items;
				}

				return sortTreeItems(items, getSettings().treeItemTypePriority);
			};
		});
	}

	private patchItemPrototype(prototype: PatchedTarget): void {
		const getSettings = (): ODecimalSettings => this.getSettings();

		this.patchMethod(prototype, "updateTitle", (original) => {
			return function (this: InternalFileTreeItem, ...args: unknown[]) {
				const result = original.apply(this, args);
				applyPrefixDisplay(this, getExplorerDisplayName(this.file), getSettings().prefixDisplayMode);
				return result;
			};
		});

		this.patchMethod(prototype, "startRename", (original) => {
			return function (this: InternalFileTreeItem, ...args: unknown[]) {
				const result = original.apply(this, args);
				restoreRawTitle(this, getExplorerDisplayName(this.file));
				return result;
			};
		});
	}

	private patchMethod(
		target: PatchedTarget,
		methodName: string,
		createWrapper: (original: AnyFunction) => AnyFunction,
	): void {
		const patchedForTarget = this.patchedMethods.get(target) ?? new Set<string>();
		if (patchedForTarget.has(methodName)) {
			return;
		}

		const current = target[methodName];
		if (typeof current !== "function") {
			return;
		}

		const original = current as AnyFunction;
		target[methodName] = createWrapper(original);

		this.unpatches.push(() => {
			target[methodName] = original;
		});
		patchedForTarget.add(methodName);
		this.patchedMethods.set(target, patchedForTarget);
	}
}

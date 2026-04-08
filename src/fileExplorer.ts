import { App, TAbstractFile, TFile, TFolder } from "obsidian";

export const FILE_EXPLORER_VIEW_TYPE = "file-explorer";

export interface InternalFileTreeItem {
	file: TAbstractFile;
	el: HTMLElement;
	selfEl: HTMLElement;
	innerEl: HTMLElement;
	view: InternalFileExplorerView;
	getTitle(): string;
	onRender(): void;
	startRename(): void;
	stopRename(): void;
	updateTitle(): void;
}

export interface InternalFileExplorerView {
	containerEl: HTMLElement;
	fileItems: Record<string, InternalFileTreeItem | undefined>;
	fileBeingRenamed?: TAbstractFile | null;
	requestSort?: (() => void) & { cancel?: () => void };
	getSortedFolderItems?(folder: TFolder): InternalFileTreeItem[];
	startRenameFile?(file: TAbstractFile): Promise<void>;
	acceptRename?(): Promise<void>;
	exitRename?(): void;
	onKeyEscInRename?(): void;
}

export function getFileExplorerViews(app: App): InternalFileExplorerView[] {
	return app.workspace
		.getLeavesOfType(FILE_EXPLORER_VIEW_TYPE)
		.map((leaf) => leaf.view as unknown)
		.filter(isInternalFileExplorerView);
}

export function getExplorerFileItems(view: InternalFileExplorerView): InternalFileTreeItem[] {
	return Object.values(view.fileItems).filter(isInternalFileTreeItem);
}

export function getExplorerDisplayName(file: TAbstractFile): string {
	if (file instanceof TFile && file.extension === "md") {
		return file.basename;
	}

	return file.name;
}

export function refreshExplorerTitles(view: InternalFileExplorerView): void {
	for (const item of getExplorerFileItems(view)) {
		item.updateTitle();
	}
}

export function requestNativeExplorerSort(view: InternalFileExplorerView): void {
	view.requestSort?.();
}

function isInternalFileExplorerView(value: unknown): value is InternalFileExplorerView {
	if (!value || typeof value !== "object") {
		return false;
	}

	const maybeView = value as Partial<InternalFileExplorerView>;
	return (
		maybeView.containerEl instanceof HTMLElement &&
		typeof maybeView.fileItems === "object"
	);
}

function isInternalFileTreeItem(value: InternalFileTreeItem | undefined): value is InternalFileTreeItem {
	if (!value || typeof value !== "object") {
		return false;
	}

	return (
		value.file instanceof TAbstractFile &&
		value.el instanceof HTMLElement &&
		value.selfEl instanceof HTMLElement &&
		value.innerEl instanceof HTMLElement &&
		typeof value.getTitle === "function" &&
		typeof value.updateTitle === "function"
	);
}

import { TFolder } from "obsidian";
import type { InternalFileTreeItem } from "./fileExplorer";
import { getExplorerDisplayName } from "./fileExplorer";
import { comparePrefixedNames } from "./prefix";
import type { TreeItemTypePriority } from "./settings";

export function sortTreeItems(
	items: InternalFileTreeItem[],
	typePriority: TreeItemTypePriority,
	prefixPattern: string,
): InternalFileTreeItem[] {
	return items
		.map((item, index) => ({
			item,
			index,
			displayName: getExplorerDisplayName(item.file),
		}))
		.sort((a, b) => {
			const typeComparison = compareTreeItemTypes(a.item, b.item, typePriority);
			if (typeComparison !== 0) {
				return typeComparison;
			}

			const comparison = comparePrefixedNames(
				a.displayName,
				b.displayName,
				prefixPattern,
			);
			return comparison !== 0 ? comparison : a.index - b.index;
		})
		.map(({ item }) => item);
}

function compareTreeItemTypes(
	a: InternalFileTreeItem,
	b: InternalFileTreeItem,
	typePriority: TreeItemTypePriority,
): number {
	if (typePriority === "mixed") {
		return 0;
	}

	const aIsFolder = a.file instanceof TFolder;
	const bIsFolder = b.file instanceof TFolder;
	if (aIsFolder === bIsFolder) {
		return 0;
	}

	if (typePriority === "folders-first") {
		return aIsFolder ? -1 : 1;
	}

	return aIsFolder ? 1 : -1;
}

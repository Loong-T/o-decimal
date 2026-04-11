import { getIconIds, Modal, setIcon, type App } from "obsidian";

const COMMON_ICON_IDS = [
	"book-open",
	"bot",
	"list-todo",
	"map",
	"file-text",
	"folder",
	"tag",
	"sparkles",
	"star",
	"bookmark",
	"clipboard-list",
	"wrench",
];

interface IconPickerText {
	title: string;
	searchName: string;
	searchPlaceholder: string;
	commonHeading: string;
	noResults: string;
	selectedLabel: string;
}

export class IconPickerModal extends Modal {
	private readonly onChoose: (iconId: string) => void;
	private readonly initialValue: string;
	private readonly text: IconPickerText;
	private searchInputEl: HTMLInputElement | null = null;
	private resultContainerEl: HTMLElement | null = null;

	constructor(
		app: App,
		initialValue: string,
		text: IconPickerText,
		onChoose: (iconId: string) => void,
	) {
		super(app);
		this.initialValue = initialValue;
		this.text = text;
		this.onChoose = onChoose;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.modalEl.addClass("o-decimal-icon-picker-shell");
		contentEl.addClass("o-decimal-icon-picker-modal");
		this.titleEl.setText(this.text.title);

		const searchSectionEl = contentEl.createDiv({
			cls: "o-decimal-icon-picker-search-section",
		});
		searchSectionEl.createSpan({
			cls: "o-decimal-icon-picker-search-title",
			text: this.text.searchName,
		});
		this.searchInputEl = searchSectionEl.createEl("input", {
			cls: "o-decimal-icon-picker-search",
			attr: {
				type: "text",
				placeholder: this.text.searchPlaceholder,
				spellcheck: "false",
			},
		});
		this.searchInputEl.value = normalizeDisplayIconId(this.initialValue);
		this.searchInputEl.addEventListener("input", () => {
			this.renderResults(this.searchInputEl?.value ?? "");
		});

		this.resultContainerEl = contentEl.createDiv({
			cls: "o-decimal-icon-picker-sections",
		});
		this.renderResults(this.initialValue);
		this.searchInputEl?.focus();
		this.searchInputEl?.select();
	}

	onClose(): void {
		this.modalEl.removeClass("o-decimal-icon-picker-shell");
		this.contentEl.empty();
	}

	private renderResults(query: string): void {
		if (!this.resultContainerEl) {
			return;
		}

		this.resultContainerEl.empty();
		const normalizedQuery = normalizeDisplayIconId(query).trim().toLowerCase();
		const allIconIds = getIconIds()
			.filter((iconId) =>
				normalizedQuery.length === 0
					? true
					: normalizeDisplayIconId(iconId).toLowerCase().includes(normalizedQuery),
			)
			.sort((left, right) => left.localeCompare(right));

		if (allIconIds.length === 0) {
			this.resultContainerEl.createDiv({
				cls: "o-decimal-icon-picker-empty",
				text: this.text.noResults,
			});
			return;
		}

		const commonIconIds = normalizedQuery.length === 0
			? COMMON_ICON_IDS.map(resolveStoredIconId)
				.filter((iconId) => allIconIds.includes(iconId))
			: [];
		const remainingIconIds = allIconIds
			.filter((iconId) => !commonIconIds.includes(iconId));

		if (commonIconIds.length > 0) {
			this.renderSection(this.text.commonHeading, commonIconIds);
		}
		this.renderSection("", remainingIconIds);
	}

	private renderSection(heading: string, iconIds: string[]): void {
		if (!this.resultContainerEl || iconIds.length === 0) {
			return;
		}

		if (heading.trim().length > 0) {
			this.resultContainerEl.createDiv({
				cls: "o-decimal-icon-picker-section-heading",
				text: heading,
			});
		}
		const sectionEl = this.resultContainerEl.createDiv({
			cls: "o-decimal-icon-picker-results",
		});

		for (const iconId of iconIds) {
			const buttonEl = sectionEl.createEl("button", {
				cls: "o-decimal-icon-picker-item",
				attr: { type: "button" },
			});
			if (normalizeStoredIconId(iconId) === normalizeStoredIconId(this.initialValue)) {
				buttonEl.addClass("is-selected");
			}
			const previewEl = buttonEl.createSpan({
				cls: "o-decimal-icon-picker-item-preview",
			});
			setIcon(previewEl, iconId);
			buttonEl.createSpan({
				cls: "o-decimal-icon-picker-item-name",
				text: normalizeDisplayIconId(iconId),
			});
			if (normalizeStoredIconId(iconId) === normalizeStoredIconId(this.initialValue)) {
				buttonEl.createSpan({
					cls: "o-decimal-icon-picker-item-selected-label",
					text: this.text.selectedLabel,
				});
			}
			buttonEl.addEventListener("click", () => {
				this.onChoose(normalizeStoredIconId(iconId));
				this.close();
			});
		}
	}
}

function normalizeDisplayIconId(iconId: string): string {
	return iconId.replace(/^lucide-/u, "");
}

function normalizeStoredIconId(iconId: string): string {
	return iconId.startsWith("lucide-") ? iconId.slice("lucide-".length) : iconId;
}

function resolveStoredIconId(iconId: string): string {
	return iconId.startsWith("lucide-") ? iconId : `lucide-${iconId}`;
}

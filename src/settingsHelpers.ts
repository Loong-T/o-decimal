import { setIcon, Setting } from "obsidian";

export function appendPrefixPatternRule(currentValue: string, nextRule: string): string {
	const normalizedCurrentRules = currentValue
		.split("\n")
		.map((rule) => rule.trim())
		.filter((rule) => rule.length > 0);

	if (normalizedCurrentRules.includes(nextRule)) {
		return normalizedCurrentRules.join("\n");
	}

	return [...normalizedCurrentRules, nextRule].join("\n");
}

export function safeSetSettingIcon(el: HTMLElement, iconId: string | null): void {
	el.empty();
	if (!iconId || iconId.trim().length === 0) {
		return;
	}

	try {
		setIcon(el, iconId);
	} catch {
		el.empty();
	}
}

export function renderIconPickerButton(
	buttonEl: HTMLButtonElement,
	label: string,
	iconId: string | null,
): void {
	buttonEl.empty();
	buttonEl.toggleClass("o-decimal-icon-picker-trigger-has-icon", !!iconId);
	if (iconId) {
		const iconEl = buttonEl.createSpan({
			cls: "o-decimal-icon-picker-trigger-icon",
		});
		safeSetSettingIcon(iconEl, iconId);
		return;
	}

	buttonEl.createSpan({
		cls: "o-decimal-icon-picker-trigger-label",
		text: label,
	});
}

export function bindRuleTextInput(
	inputEl: HTMLInputElement,
	value: string,
	onCommit: (value: string) => Promise<void>,
): void {
	inputEl.value = value;
	inputEl.spellcheck = false;
	const commit = (): void => {
		void onCommit(inputEl.value);
	};
	inputEl.addEventListener("change", commit);
	inputEl.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			commit();
		}
	});
}

export function setSettingLoading(
	setting: Setting,
	loading: boolean,
	descriptionText: string,
): void {
	const settingEl = setting.settingEl;
	const descriptionEl = settingEl.querySelector(".setting-item-description");
	const inputEl = settingEl.querySelector(
		"input, select, textarea, button",
	);

	settingEl.toggleClass("o-decimal-setting-loading", loading);
	if (descriptionEl instanceof HTMLElement) {
		descriptionEl.setText(descriptionText);
	}
	if (
		inputEl instanceof HTMLInputElement ||
		inputEl instanceof HTMLSelectElement ||
		inputEl instanceof HTMLTextAreaElement ||
		inputEl instanceof HTMLButtonElement
	) {
		inputEl.disabled = loading;
	}
}

export async function pickSvgFile(): Promise<{ name: string; content: string } | null> {
	return await new Promise((resolve) => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = ".svg,image/svg+xml";
		inputEl.addEventListener(
			"change",
			() => {
				const file = inputEl.files?.[0];
				if (!file) {
					resolve(null);
					return;
				}

				void file.text().then((content) => {
					resolve({
						name: file.name,
						content,
					});
				});
			},
			{ once: true },
		);
		inputEl.click();
	});
}

export function normalizeImportedSvgContent(svgContent: string): string {
	return svgContent
		.replace(/\s(?:fill|stroke)="(?!none|currentColor|inherit)[^"]*"/gi, (match) =>
			match.replace(/="[^"]*"/, '="currentColor"'),
		)
		.replace(
			/(?:fill|stroke)\s*:\s*(?!none|currentColor|inherit)[^;"]+/gi,
			(styleValue) => styleValue.replace(/:\s*[^;"]+/, ": currentColor"),
		);
}

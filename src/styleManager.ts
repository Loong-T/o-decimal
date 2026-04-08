import type { PrefixStyleSettings } from "./prefixStyle";
import { buildPrefixStyleCss } from "./prefixStyle";

const STYLE_ELEMENT_ID = "o-decimal-runtime-style";

export class StyleManager {
	private styleEl: HTMLStyleElement | null = null;

	apply(settings: PrefixStyleSettings): void {
		const styleEl = this.ensureStyleElement();
		styleEl.textContent = buildPrefixStyleCss(settings);
	}

	destroy(): void {
		this.styleEl?.remove();
		this.styleEl = null;
	}

	private ensureStyleElement(): HTMLStyleElement {
		if (this.styleEl?.isConnected) {
			return this.styleEl;
		}

		const styleEl = document.head.createEl("style");
		styleEl.id = STYLE_ELEMENT_ID;
		this.styleEl = styleEl;
		return styleEl;
	}
}

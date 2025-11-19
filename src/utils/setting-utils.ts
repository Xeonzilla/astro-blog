import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { siteConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = siteConfig.themeColor.hue;
	if (typeof document === "undefined") {
		return fallback;
	}
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || String(fallback), 10);
}

export function getHue(): number {
	if (typeof window === "undefined") {
		return siteConfig.themeColor.hue;
	}
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	if (typeof window === "undefined") {
		return;
	}
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	if (typeof window === "undefined") {
		return;
	}
	const html = document.documentElement;

	const optimizeStyle = document.createElement("style");
	optimizeStyle.id = "theme-transition-optimize";
	optimizeStyle.textContent = `
		@layer base {
			:root,
			body,
			.card-base,
			.float-panel,
			.link,
			.link-lg,
			.btn-card,
			.btn-plain,
			.btn-regular,
			.btn-regular-dark,
			.link-underline,
			.meta-icon,
			.expand-animation::before,
			.dash-line::before,
			[class*="bg-"],
			[class*="text-"],
			[class*="border-"],
			[class*="prose"] {
				transition-property: background-color, border-color, box-shadow, color !important;
				transition-timing-function: ease !important;
				transition-duration: 0.2s !important;
			}
		}
	`;
	document.head.appendChild(optimizeStyle);

	switch (theme) {
		case LIGHT_MODE:
			html.classList.remove("dark");
			break;
		case DARK_MODE:
			html.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				html.classList.add("dark");
			} else {
				html.classList.remove("dark");
			}
			break;
	}

	void html.offsetHeight;

	setTimeout(() => {
		optimizeStyle.remove();
	}, 300);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	if (typeof window === "undefined") {
		return;
	}
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	if (typeof window === "undefined") {
		return DEFAULT_THEME;
	}
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

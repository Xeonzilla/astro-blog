import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import astroExpressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import type { ElementContent } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import type { RollupLog } from "rollup";
import I18nKey from "./src/i18n/i18nKey";
import { i18n } from "./src/i18n/translation";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge";
import {
	AdmonitionComponent,
	type AdmonitionProperties,
} from "./src/plugins/rehype-component-admonition";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype";
import { remarkExcerpt } from "./src/plugins/remark-excerpt";
import { remarkImageComponent } from "./src/plugins/remark-image-component";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";

const commonRemarkPlugins = [
	remarkGfm,
	remarkMath,
	remarkReadingTime,
	remarkExcerpt,
	remarkGithubAdmonitionsToDirectives,
	remarkDirective,
	remarkSectionize,
	parseDirectiveNode,
];

export default defineConfig({
	site: "https://xeonzilla.top/",
	base: "/",
	trailingSlash: "always",
	integrations: [
		swup({
			theme: false,
			animationClass: "transition-swup-",
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			preload: true,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
		}),
		icon({
			include: {
				"preprocess: vitePreprocess(),": ["*"],
				"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
			},
		}),
		astroExpressiveCode({
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily: "var(--jetbrains-mono)",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
					editorTabBarBackground: "var(--codeblock-topbar-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
					terminalTitlebarBorderBottomColor: "none",
				},
				textMarkers: {
					delHue: "0",
					insHue: "180",
					markHue: "250",
				},
			},
			themes: ["github-light", "github-dark"],
			themeCssSelector: (theme) => {
				return theme.name.includes("dark") ? ".dark" : "";
			},
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		svelte(),
		sitemap(),
		mdx({
			remarkPlugins: [remarkImageComponent, ...commonRemarkPlugins],
		}),
	],
	markdown: {
		remarkPlugins: [...commonRemarkPlugins],
		remarkRehype: {
			footnoteLabel: i18n(I18nKey.footnotes),
		},
		rehypePlugins: [
			rehypeKatex,
			rehypeSlug,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "note"),
						tip: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "tip"),
						important: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "important"),
						info: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "important"),
						caution: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "caution"),
						danger: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "caution"),
						warning: (
							properties: AdmonitionProperties,
							children: ElementContent[],
						) => AdmonitionComponent(properties, children, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [
							{
								type: "text",
								value: "#",
							},
						],
					},
				},
			],
			[
				rehypeExternalLinks,
				{
					target: "_blank",
					rel: ["noopener", "noreferrer"],
					content: { type: "text", value: "↗" },
				},
			],
		],
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			rollupOptions: {
				onwarn(warning: RollupLog, warn) {
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
		},
		ssr: {
			external: ["node:path", "stream", "util"],
		},
	},
	prefetch: {
		prefetchAll: true,
	},
	image: {
		service: {
			entrypoint: "./src/services/customImageService",
		},
		remotePatterns: [
			{
				protocol: "https",
			},
		],
	},
	i18n: {
		locales: ["zh-cn"],
		defaultLocale: "zh-cn",
	},
	experimental: {
		fonts: [
			{
				provider: fontProviders.fontsource(),
				name: "JetBrains Mono",
				cssVariable: "--jetbrains-mono",
				weights: ["100 900"],
				subsets: ["latin"],
				fallbacks: [
					"ui-monospace",
					"SFMono-Regular",
					"Menlo",
					"Monaco",
					"Consolas",
					"Liberation Mono",
					"Courier New",
					"MiSans",
					"monospace",
				],
			},
		],
		clientPrerender: true,
		contentIntellisense: true,
		preserveScriptOrder: true,
		headingIdCompat: true,
		chromeDevtoolsWorkspace: true,
		failOnPrerenderConflict: true,
	},
});

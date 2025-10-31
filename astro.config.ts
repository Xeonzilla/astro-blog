import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import type { ElementContent } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import type { RollupLog } from "rollup";
import { expressiveCodeConfig } from "./src/config/index";
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
		tailwind({
			nesting: true,
		}),
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
		expressiveCode({
			themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', 'MiSans', monospace",
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
					rel: ["noopener", "noreferrer", "nofollow"],
					content: { type: "text", value: "↗" },
				},
			],
		],
	},
	vite: {
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
		remotePatterns: [
			{
				protocol: "https",
			},
		],
		responsiveStyles: true,
		layout: "constrained",
	},
	i18n: {
		locales: ["zh-cn"],
		defaultLocale: "zh-cn",
	},
	experimental: {
		clientPrerender: true,
		contentIntellisense: true,
		preserveScriptOrder: true,
		headingIdCompat: true,
	},
});

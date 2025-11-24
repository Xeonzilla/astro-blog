import type { SiteConfig } from "../types/config";

export const siteConfig: SiteConfig = {
	title: "Xeonzilla's Note",
	subtitle: "Yuri is life.",
	lang: "zh_CN",
	themeColor: {
		hue: 176,
		fixed: false,
	},
	banner: {
		src: "assets/img/banner.avif",
		position: "center",
		credit: {
			enable: true,
			text: "焦茶 / ǝɯ uo ǝʞɐ⊥",
			url: "https://www.pixiv.net/artworks/72038523",
		},
	},
	toc: {
		enable: true,
		depth: 3,
	},
	generateOgImages: true,
	favicon: [
		{
			src: "/favicon/favicon-32.png",
			sizes: "32x32",
		},
		{
			src: "/favicon/favicon-128.png",
			sizes: "128x128",
		},
		{
			src: "/favicon/favicon-180.png",
			sizes: "180x180",
		},
		{
			src: "/favicon/favicon-192.png",
			sizes: "192x192",
		},
	],
};

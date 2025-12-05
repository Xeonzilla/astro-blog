import siteConfig from "./src/utils/config";

const config = siteConfig({
	title: "x7aNote",
	prologue: "Breakfast of champion.\nIt's good, yuri is very nice.",
	author: {
		name: "Xeonzilla",
		email: "admin@xeonzilla.top",
		link: "https://xeonzilla.top/"
	},
	description: "Yuri is life.",
	copyright: {
		type: "CC BY-NC-SA 4.0",
		year: "2025"
	},
	i18n: {
		locales: ["zh-cn"],
		defaultLocale: "zh-cn"
	},
	feed: {
		section: "*",
		limit: 20
	},
	comment: {
		"max-length": 1500,
		"hide-deleted": true,
		history: true
	},
	latest: "*"
});

export const monolocale = Number(config.i18n.locales.length) === 1;

export default config;

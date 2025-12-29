import siteConfig, { providers } from "./src/utils/config";

const env = import.meta.env ?? {};

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
		"max-length": 1500
	},
	latest: "*"
});

const monolocale = Number(config.i18n.locales.length) === 1;

const turnstile = env.CLOUDFLARE_TURNSTILE_SECRET_KEY ? env.CLOUDFLARE_TURNSTILE_SITE_KEY : undefined;

const push = env.VAPID_PRIVATE_KEY ? env.VAPID_PUBLIC_KEY : undefined;

const email = Boolean(env.EMAIL_FROM);

const oauth = providers([
	{ name: "GitHub", logo: "simple-icons--github", clientID: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
	{ name: "Google", logo: "simple-icons--google", clientID: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
	{ name: "X", logo: "simple-icons--x", clientID: env.TWITTER_CLIENT_ID, clientSecret: env.TWITTER_CLIENT_SECRET }
]);

export { turnstile, oauth, monolocale, push, email };

export default config;

import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	avatar: "assets/img/avatar.avif",
	name: "Xeonzilla",
	bio: "Yuri is life.",
	links: [
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:admin@xeonzilla.top",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Xeonzilla",
		},
		{
			name: "Telegram",
			icon: "fa6-brands:telegram",
			url: "https://t.me/xeonzilla_bot",
		},
		{
			name: "Bangumi",
			icon: "fa6-brands:bilibili",
			url: "https://bgm.tv/user/xeonzilla",
		},
		{
			name: "RSS",
			icon: "fa6-solid:rss",
			url: "https://xeonzilla.top/rss.xml",
		},
	],
};

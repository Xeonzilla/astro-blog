import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Anime,
		LinkPreset.Archive,
		LinkPreset.About,
		LinkPreset.Friends,
		{
			name: "开往",
			url: "https://www.travellings.cn/go.html",
			external: true,
		},
	],
};

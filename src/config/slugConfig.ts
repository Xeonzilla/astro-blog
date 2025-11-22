export interface SlugMapping {
	[key: string]: string;
}

export const tagSlugMap: SlugMapping = {
	动画相关: "anime-misc",
	技术: "tech",
	开源: "opensource",
	漫画: "manga",
	漫画改动画: "manga-anime",
	评论系统: "comment-system",
	小说改动画: "novel-anime",
	游戏改动画: "game-anime",
	原创动画: "original-anime",
	云服务: "cloud-service",
	Astro: "astro",
	Blowfish: "blowfish",
	Fuwari: "fuwari",
	Galgame: "galgame",
	Hugo: "hugo",
	PaperMod: "papermod",
	VitePress: "vitepress",
};

export const categorySlugMap: SlugMapping = {
	动画科学: "anime-science",
	剧场版动画: "anime-movies",
	其他动画: "misc-anime",
	站点建设: "site-dev",
	转载备份: "backup",
	"TV动画-2020年10月": "anime-october2020",
	"TV动画-2022年1月": "anime-january2022",
	"TV动画-2022年10月": "anime-october2022",
	"TV动画-2023年7月": "anime-july2023",
	"TV动画-2023年10月": "anime-october2023",
	"TV动画-2024年1月": "anime-january2024",
	"TV动画-2024年4月": "anime-april2024",
	"TV动画-2024年7月": "anime-july2024",
	"TV动画-2024年10月": "anime-october2024",
	"TV动画-2025年1月": "anime-january2025",
	"TV动画-2025年4月": "anime-april2025",
	"TV动画-2025年7月": "anime-july2025",
	"TV动画-2025年10月": "anime-october2025",
};

export const slugConfig = {
	requireAllMappings: false,
};

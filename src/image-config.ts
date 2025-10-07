export const markdownImageConfig = {
	widths: [480, 750, 920, 1200, 1600, 1920, 2400],
	sizes:
		"(max-width: 767px) calc(100vw - 42px), (max-width: 1023px) calc(100vw - 104px), (max-width: 1199px) calc(100vw - 400px), 800px",
	quality: "max",
};

export const avatarImageConfig = {
	widths: [168, 192, 256, 384, 512],
	sizes: "(max-width: 767px) 168px, (max-width: 1023px) 192px, 256px",
	quality: "max",
};

export const bannerImageConfig = {
	widths: [480, 828, 1280, 1668, 1920, 2388],
	sizes: "100vw",
	quality: "max",
};

export const coverImageConfig = {
	widths: [244, 488, 732],
	sizes:
		"(max-width: 767px) calc(100vw - 28px), (max-width: 1023px) calc(28vw - 9px), (max-width: 1199px) calc(28vw - 92px), 244px",
	quality: "max",
};

export const animeImageConfig = {
	widths: [150, 300, 450, 750, 1100, 1500],
	sizes:
		"(max-width: 767px) 84px, (max-width: 1023px) calc(17.5vw - 3px), (max-width: 1199px) calc(12.15vw - 5px), 150px",
	quality: "max",
};

export const friendsImageConfig = {
	widths: [125, 182, 256, 285, 364, 512],
	sizes:
		"(max-width: 639px) calc(50vw - 35px), (max-width: 767px) calc(33.333vw - 30px), (max-width: 1023px) calc((100vw - 136px) / 3), (max-width: 1199px) calc((100vw - 432px) / 3), (max-width: 1279px) 256px, 182px",
	quality: "high",
};

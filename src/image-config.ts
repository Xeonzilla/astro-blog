export const markdownImageConfig = {
	quality: "max",
	// widths: astro.config.mjs - image - breakpoints
	sizes:
		"(max-width: 767px) calc(100vw - 42px), (max-width: 1023px) calc(100vw - 104px), (max-width: 1199px) calc(100vw - 400px), 800px",
};

export const avatarImageConfig = {
	quality: "max",
	widths: [168, 192, 256, 384, 512],
	sizes: "(max-width: 767px) 168px, (max-width: 1023px) 192px, 256px",
};

export const bannerImageConfig = {
	quality: "max",
	widths: [480, 828, 1280, 1668, 1920, 2388],
	sizes: "100vw",
};

export const coverImageConfig = {
	quality: "max",
	widths: [244, 488, 732],
	sizes:
		"(max-width: 767px) calc(100vw - 28px), (max-width: 1023px) calc(28vw - 9px), (max-width: 1199px) calc(28vw - 92px), 244px",
};

export const animeImageConfig = {
	quality: "max",
	widths: [150, 300, 450, 750, 1100, 1500],
	sizes:
		"(max-width: 767px) 84px, (max-width: 1023px) calc(17.5vw - 3px), (max-width: 1199px) calc(12.15vw - 5px), 150px",
};

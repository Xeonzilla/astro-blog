import type { ImageConfig } from "../types/config";

export const markdownImageConfig: ImageConfig = {
	widths: [400, 800, 1600],
	sizes:
		"(max-width: 767px) calc(100vw - 42px), (max-width: 1023px) calc(100vw - 104px), (max-width: 1199px) calc(100vw - 400px), 800px",
	quality: "max",
};

export const avatarImageConfig: ImageConfig = {
	widths: [192, 256, 384],
	sizes: "(max-width: 767px) 168px, (max-width: 1023px) 192px, 256px",
	quality: "high",
};

export const bannerImageConfig: ImageConfig = {
	widths: [480, 1024, 1920],
	sizes: "100vw",
	quality: "high",
};

export const coverImageConfig: ImageConfig = {
	widths: [244, 488, 732],
	sizes:
		"(max-width: 767px) calc(100vw - 28px), (max-width: 1023px) calc(28vw - 9px), (max-width: 1199px) calc(28vw - 92px), 244px",
	quality: "max",
};

export const animeImageConfig: ImageConfig = {
	widths: [150, 300, 450],
	sizes:
		"(max-width: 767px) 84px, (max-width: 1023px) calc(17.5vw - 3px), (max-width: 1199px) calc(12.15vw - 5px), 150px",
	quality: "high",
};

export const friendsImageConfig: ImageConfig = {
	widths: [182, 300, 364, 600],
	sizes:
		"(max-width: 639px) calc(50vw - 35px), (max-width: 767px) calc(33.333vw - 30px), (max-width: 1023px) calc((100vw - 136px) / 3), (max-width: 1199px) calc((100vw - 432px) / 3), (max-width: 1279px) 256px, 182px",
	quality: "high",
};

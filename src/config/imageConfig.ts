import type { ImageConfig } from "../types/config";

export const animeImageConfig: ImageConfig = {
	widths: [150, 300, 450],
	sizes:
		"(max-width: 767px) 84px, (max-width: 1023px) calc(17.5vw - 3px), (max-width: 1199px) calc(12.15vw - 5px), 150px",
};

export const friendsImageConfig: ImageConfig = {
	widths: [182, 300, 600, 900],
	sizes:
		"(max-width: 639px) calc(50vw - 35px), (max-width: 767px) calc(33.333vw - 30px), (max-width: 1023px) calc((100vw - 136px) / 3), (max-width: 1199px) calc((100vw - 432px) / 3), (max-width: 1279px) 256px, 182px",
};

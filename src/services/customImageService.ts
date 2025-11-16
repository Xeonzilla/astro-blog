import type { LocalImageService } from "astro";
import { baseService } from "astro/assets";
import sharp from "sharp";

sharp.concurrency(4);
sharp.cache({ memory: 100, files: 40, items: 200 });

// AVIF passthrough, others convert to WebP
const customImageService: LocalImageService = {
	...baseService,

	async transform(inputBuffer, transformOptions) {
		if (!inputBuffer || inputBuffer.length === 0) {
			throw new Error("Invalid input buffer: empty file");
		}

		const { format, width, height, quality } = transformOptions;

		if (format === "avif") {
			return {
				data: inputBuffer,
				format: "avif",
			};
		}

		// Clamp quality to 1-100
		const validQuality = quality
			? Math.max(1, Math.min(100, quality))
			: undefined;

		let instance = sharp(inputBuffer, {
			animated: false,
			pages: -1,
			limitInputPixels: 268402689,
			sequentialRead: true,
		});

		if (width || height) {
			instance = instance.resize({
				width,
				height,
				fit: "inside",
				withoutEnlargement: true,
			});
		}

		instance = instance.toFormat("webp", {
			quality: validQuality ?? 80,
			smartSubsample: true,
			effort: 3,
		});

		try {
			const buffer = await instance.toBuffer();
			return {
				data: new Uint8Array(buffer),
				format: "webp",
			};
		} catch (err) {
			console.error("Transform failed:", err);
			return {
				data: inputBuffer,
				format: format || "webp",
			};
		}
	},

	getSrcSet(options, imageConfig) {
		return baseService.getSrcSet?.(options, imageConfig) ?? [];
	},
};

export default customImageService;

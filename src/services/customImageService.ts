import type { LocalImageService } from "astro";
import { baseService } from "astro/assets";
import sharp from "sharp";

// AVIF passthrough, others convert to WebP
const customImageService: LocalImageService = {
	validateOptions: baseService.validateOptions,
	getHTMLAttributes: baseService.getHTMLAttributes,
	getURL: baseService.getURL,
	parseURL: baseService.parseURL,

	async transform(inputBuffer, transformOptions) {
		if (!inputBuffer || inputBuffer.length === 0) {
			throw new Error("Invalid input buffer: buffer is empty");
		}

		// Return original data
		if (transformOptions.format === "avif") {
			return {
				data: inputBuffer,
				format: "avif" as const,
			};
		}

		try {
			const { width, height, quality } = transformOptions;

			// Validate dimensions
			if (
				(width !== undefined && width < 0) ||
				(height !== undefined && height < 0)
			) {
				throw new Error(
					"Invalid dimensions: width and height must be non-negative",
				);
			}

			// Clamp quality to 1-100
			const validQuality = quality
				? Math.max(1, Math.min(100, quality))
				: undefined;

			// Create Sharp instance with optimized config
			let sharpInstance = sharp(inputBuffer, {
				failOnError: false,
				pages: -1,
				limitInputPixels: 268402689,
				sequentialRead: true,
			});

			// Resize if needed
			if (width || height) {
				sharpInstance = sharpInstance.resize({
					width,
					height,
					fit: "inside",
					withoutEnlargement: true,
				});
			}

			// Convert to WebP
			const buffer = await sharpInstance
				.webp(validQuality ? { quality: validQuality } : undefined)
				.toBuffer();
			const data = new Uint8Array(buffer);

			return {
				data,
				format: "webp",
			};
		} catch (error) {
			console.error("Image transform failed:", error);
			console.error("Transform options:", transformOptions);

			// Return original data as fallback
			return {
				data: inputBuffer,
				format: transformOptions.format || "webp",
			};
		}
	},

	getSrcSet(options, imageConfig) {
		if (options.format === "avif") {
			return [];
		}

		return baseService.getSrcSet?.(options, imageConfig) ?? [];
	},
};

export default customImageService;

/**
 * Image management module exports
 */

export {
	DEFAULT_IMAGE_SELECTOR,
	DEFAULT_PHOTOSWIPE_CONFIG,
	DEFAULT_ROOT_MARGIN,
} from "./config";
export { ImageLoader } from "./ImageLoader";
export { default as ImageManager } from "./ImageManager";
export { PhotoSwipeManager } from "./PhotoSwipeManager";
export type { ImageLoaderConfig, PhotoSwipeConfig } from "./types";

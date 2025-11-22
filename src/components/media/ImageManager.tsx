import { component$ } from "@builder.io/qwik";
import {
	DEFAULT_IMAGE_SELECTOR,
	DEFAULT_PHOTOSWIPE_CONFIG,
	DEFAULT_ROOT_MARGIN,
} from "./config";
import { ImageLoader } from "./ImageLoader";
import { PhotoSwipeManager } from "./PhotoSwipeManager";
import "photoswipe/style.css";

/**
 * Image management component optimized for Qwik best practices
 * Coordinates lazy loading and lightbox functionality
 */
export default component$(() => (
	<>
		<ImageLoader
			selector={DEFAULT_IMAGE_SELECTOR}
			rootMargin={DEFAULT_ROOT_MARGIN}
		/>
		<PhotoSwipeManager config={DEFAULT_PHOTOSWIPE_CONFIG} />
	</>
));

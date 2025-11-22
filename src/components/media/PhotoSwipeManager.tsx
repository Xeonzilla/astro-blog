import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type PhotoSwipeLightbox from "photoswipe/lightbox";
import type { PhotoSwipeConfig } from "./types";

interface PhotoSwipeManagerProps {
	config: PhotoSwipeConfig;
}

/**
 * Manages PhotoSwipe lightbox initialization and lifecycle
 * Dynamically imports PhotoSwipe library for optimal performance
 */
export const PhotoSwipeManager = component$<PhotoSwipeManagerProps>(
	({ config }) => {
		// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for DOM manipulation and third-party library integration
		useVisibleTask$(() => {
			let lightbox: PhotoSwipeLightbox | null = null;

			const initPhotoSwipe = async () => {
				lightbox?.destroy();

				const [PhotoSwipeLightboxModule, pswpModule] = await Promise.all([
					import("photoswipe/lightbox"),
					import("photoswipe"),
				]);

				lightbox = new PhotoSwipeLightboxModule.default({
					...config,
					pswpModule: async () => pswpModule,
				});

				lightbox.addFilter("domItemData", (itemData, element) => {
					if (element instanceof HTMLImageElement) {
						itemData.src = element.src;
						itemData.w = Number(
							element.getAttribute("width") || element.naturalWidth,
						);
						itemData.h = Number(
							element.getAttribute("height") || element.naturalHeight,
						);
						itemData.msrc = element.src;
					}
					return itemData;
				});

				lightbox.init();
			};

			initPhotoSwipe();

			const setupSwupIntegration = () => {
				if (!window.swup) return;

				const handlers = {
					onPageView: () => initPhotoSwipe(),
					onContentReplace: () => lightbox?.destroy(),
				};

				window.swup.hooks.on("page:view", handlers.onPageView);
				window.swup.hooks.on("content:replace", handlers.onContentReplace, {
					before: true,
				});

				return () => {
					window.swup.hooks.off("page:view", handlers.onPageView);
					window.swup.hooks.off("content:replace", handlers.onContentReplace);
				};
			};

			let cleanupSwup: (() => void) | undefined;

			if (window.swup) {
				cleanupSwup = setupSwupIntegration();
			} else {
				document.addEventListener(
					"swup:enable",
					() => {
						cleanupSwup = setupSwupIntegration();
					},
					{ once: true },
				);
			}

			return () => {
				cleanupSwup?.();
				lightbox?.destroy();
			};
		});

		return null;
	},
);

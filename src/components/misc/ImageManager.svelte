<script lang="ts">
	import PhotoSwipeLightbox from "photoswipe/lightbox";
	import { SvelteSet } from "svelte/reactivity";
	import "photoswipe/style.css";

	const PHOTOSWIPE_CONFIG = {
		gallery: ".custom-md img, #post-cover img",
		closeSVG:
			'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>',
		zoomSVG:
			'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M340-540h-40q-17 0-28.5-11.5T260-580q0-17 11.5-28.5T300-620h40v-40q0-17 11.5-28.5T380-700q17 0 28.5 11.5T420-660v40h40q17 0 28.5 11.5T500-580q0 17-11.5 28.5T460-540h-40v40q0 17-11.5 28.5T380-460q-17 0-28.5-11.5T340-500v-40Zm40 220q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>',
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		wheelToZoom: true,
		arrowPrev: false,
		arrowNext: false,
		imageClickAction: "close" as const,
		tapAction: "close" as const,
		doubleTapAction: "zoom" as const,
	};

	const INTERSECTION_OPTIONS = { rootMargin: "100px" };

	let lightbox: PhotoSwipeLightbox | null = null;
	let pswp = import("photoswipe");

	let imageObserver: IntersectionObserver | null = null;
	let mutationObserver: MutationObserver | null = null;

	// Initialize lazy loading for images
	function initImageLoader() {
		const markWrapperLoaded = (wrapper: Element) => {
			const img = wrapper.querySelector<HTMLImageElement>(
				"[data-image-element]",
			);
			const loadingBar =
				wrapper.querySelector<HTMLElement>(".loading-bar");

			if (!img || !loadingBar || img.dataset.loaded === "true") return;

			const markLoaded = () => {
				img.classList.add("loaded");
				loadingBar.classList.add("hide");
				img.dataset.loaded = "true";

				// Wait for transition to complete before hiding
				loadingBar.addEventListener(
					"transitionend",
					() => {
						loadingBar.classList.add("hidden");
					},
					{ once: true },
				);
			};

			if (img.complete && img.naturalHeight !== 0) {
				markLoaded();
			} else {
				["load", "error"].forEach((event) => {
					img.addEventListener(event, markLoaded, { once: true });
				});
			}
		};

		imageObserver = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					markWrapperLoaded(entry.target);
					imageObserver?.unobserve(entry.target);
				}
			}
		}, INTERSECTION_OPTIONS);

		document.querySelectorAll("[data-image-wrapper]").forEach((el) => {
			imageObserver?.observe(el);
		});

		// Watch for dynamically added images
		mutationObserver = new MutationObserver((mutations) => {
			const wrappers = new SvelteSet<Element>();

			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType === 1) {
						const el = node as Element;
						if (el.hasAttribute("data-image-wrapper")) {
							wrappers.add(el);
						} else {
							el.querySelectorAll?.(
								"[data-image-wrapper]",
							).forEach((child) => {
								wrappers.add(child);
							});
						}
					}
				});
			});

			wrappers.forEach((wrapper) => {
				imageObserver?.observe(wrapper);
			});
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// Create PhotoSwipe lightbox instance
	function createPhotoSwipe() {
		if (lightbox) {
			lightbox.destroy();
		}

		lightbox = new PhotoSwipeLightbox({
			...PHOTOSWIPE_CONFIG,
			pswpModule: () => pswp,
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
	}

	// Setup Swup page transition hooks
	function setupSwupHooks() {
		if (!window.swup) return;

		window.swup.hooks.on("page:view", () => {
			createPhotoSwipe();
		});

		window.swup.hooks.on(
			"content:replace",
			() => {
				lightbox?.destroy();
			},
			{ before: true },
		);
	}

	function cleanup() {
		if (imageObserver) {
			imageObserver.disconnect();
			imageObserver = null;
		}

		if (mutationObserver) {
			mutationObserver.disconnect();
			mutationObserver = null;
		}

		if (lightbox) {
			lightbox.destroy();
			lightbox = null;
		}
	}

	$effect(() => {
		initImageLoader();
		createPhotoSwipe();

		if (window.swup) {
			setupSwupHooks();
		} else {
			document.addEventListener("swup:enable", setupSwupHooks);
		}

		return () => {
			document.removeEventListener("swup:enable", setupSwupHooks);
			cleanup();
		};
	});
</script>

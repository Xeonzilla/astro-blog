import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { ImageLoaderConfig } from "./types";

/**
 * Lazy loads images using IntersectionObserver
 * Only loads images when they enter the viewport
 */
export const ImageLoader = component$<ImageLoaderConfig>(
	({ selector, rootMargin = "100px" }) => {
		// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for DOM manipulation and IntersectionObserver
		useVisibleTask$(() => {
			const handleImageLoad = (wrapper: Element) => {
				const img = wrapper.querySelector<HTMLImageElement>(
					"[data-image-element]",
				);
				const loadingBar = wrapper.querySelector<HTMLElement>(".loading-bar");

				if (!img || !loadingBar || img.dataset.loaded) return;

				const setLoaded = () => {
					img.classList.add("loaded");
					loadingBar.classList.add("hide");
					img.dataset.loaded = "true";
					loadingBar.addEventListener(
						"transitionend",
						() => loadingBar.classList.add("hidden"),
						{ once: true },
					);
				};

				img.complete && img.naturalHeight
					? setLoaded()
					: img.addEventListener("load", setLoaded, { once: true });
				img.addEventListener("error", setLoaded, { once: true });
			};

			const imageObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach(({ isIntersecting, target }) => {
						if (isIntersecting) {
							handleImageLoad(target);
							imageObserver.unobserve(target);
						}
					});
				},
				{ rootMargin },
			);

			document.querySelectorAll(selector).forEach((el) => {
				imageObserver.observe(el);
			});

			const mutationObserver = new MutationObserver((mutations) => {
				const wrappers = new Set<Element>();
				mutations.forEach(({ addedNodes }) => {
					addedNodes.forEach((node) => {
						if (node.nodeType === 1) {
							const el = node as Element;
							if (el.matches?.(selector)) {
								wrappers.add(el);
							} else {
								el.querySelectorAll?.(selector).forEach((child) => {
									wrappers.add(child);
								});
							}
						}
					});
				});
				wrappers.forEach((wrapper) => {
					imageObserver.observe(wrapper);
				});
			});

			mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});

			return () => {
				imageObserver.disconnect();
				mutationObserver.disconnect();
			};
		});

		return null;
	},
);

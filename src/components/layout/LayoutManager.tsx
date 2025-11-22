import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";
import { pathsEqual, url } from "@utils/url-utils";

export default component$(() => {
	const SCROLLBAR_CONFIG = {
		body: {
			scrollbars: {
				theme: "scrollbar-base scrollbar-auto py-1",
				autoHide: "move" as const,
				autoHideDelay: 500,
				autoHideSuspend: false,
			},
		},
		katex: {
			scrollbars: {
				theme: "scrollbar-base scrollbar-auto",
				autoHide: "leave" as const,
				autoHideDelay: 500,
				autoHideSuspend: false,
			},
		},
	};

	const KATEX_OBSERVER_OPTIONS = {
		root: null,
		rootMargin: "100px",
		threshold: 0.1,
	};

	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for DOM manipulation and browser APIs
	useVisibleTask$(() => {
		let overlayScrollbarsInstance: ReturnType<typeof OverlayScrollbars> | null =
			null;
		let katexObserver: IntersectionObserver | null = null;

		// Process individual KaTeX element for scrollbar initialization
		const processKatexElement = (element: HTMLElement) => {
			if (
				!element.parentNode ||
				element.hasAttribute("data-scrollbar-initialized")
			) {
				return;
			}

			const container = document.createElement("div");
			container.className = "katex-display-container";
			container.setAttribute("aria-label", "scrollable container for formulas");

			element.parentNode.insertBefore(container, element);
			container.appendChild(element);

			OverlayScrollbars(container, SCROLLBAR_CONFIG.katex);
			element.setAttribute("data-scrollbar-initialized", "true");
		};

		// Initialize scrollbars for KaTeX math formulas with lazy loading
		const initKatexScrollbars = () => {
			const katexElements = document.querySelectorAll(
				".katex-display",
			) as NodeListOf<HTMLElement>;

			katexObserver = new IntersectionObserver((entries, observer) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						processKatexElement(entry.target as HTMLElement);
						observer.unobserve(entry.target);
					}
				}
			}, KATEX_OBSERVER_OPTIONS);

			for (const element of katexElements) {
				katexObserver.observe(element);
			}
		};

		// Initialize custom scrollbars for body and KaTeX elements
		const initCustomScrollbar = () => {
			const bodyElement = document.querySelector("body");
			if (!bodyElement) return;

			overlayScrollbarsInstance = OverlayScrollbars(
				{
					target: bodyElement,
					cancel: { nativeScrollbarsOverlaid: true },
				},
				SCROLLBAR_CONFIG.body,
			);

			initKatexScrollbars();
		};

		const dispatchCommentLoad = () =>
			document.dispatchEvent(new Event("loadComment"));

		const toggleElementClass = (
			id: string,
			className: string,
			add: boolean,
		) => {
			const element = document.getElementById(id);
			element?.classList.toggle(className, add);
		};

		// Swup hook handlers
		const handleLinkClick = () => {
			document.documentElement.style.setProperty("--content-delay", "0ms");
		};

		const handleContentReplace = () => {
			initCustomScrollbar();
			dispatchCommentLoad();
		};

		const handleVisitStart = (visit: { to: { url: string } }) => {
			const bodyElement = document.querySelector("body");
			const isHome = pathsEqual(visit.to.url, url("/"));
			bodyElement?.classList.toggle("is-home", isHome);

			toggleElementClass("page-height-extend", "hidden", false);
			toggleElementClass("toc-wrapper", "toc-not-ready", true);
		};

		const handlePageView = () => {
			toggleElementClass("page-height-extend", "hidden", true);
		};

		const handleVisitEnd = () => {
			setTimeout(() => {
				toggleElementClass("page-height-extend", "hidden", true);
				toggleElementClass("toc-wrapper", "toc-not-ready", false);
			}, 200);
		};

		const setupSwupHooks = () => {
			if (!window.swup) return;

			const hooks = window.swup.hooks;
			hooks.on("link:click", handleLinkClick);
			hooks.on("content:replace", handleContentReplace);
			hooks.on("visit:start", handleVisitStart);
			hooks.on("page:view", handlePageView);
			hooks.on("visit:end", handleVisitEnd);
		};

		const cleanupSwupHooks = () => {
			if (!window.swup) return;

			const hooks = window.swup.hooks;
			hooks.off("link:click", handleLinkClick);
			hooks.off("content:replace", handleContentReplace);
			hooks.off("visit:start", handleVisitStart);
			hooks.off("page:view", handlePageView);
			hooks.off("visit:end", handleVisitEnd);
		};

		const cleanup = () => {
			overlayScrollbarsInstance?.destroy();
			overlayScrollbarsInstance = null;

			katexObserver?.disconnect();
			katexObserver = null;

			cleanupSwupHooks();
		};

		// Initialize
		initCustomScrollbar();
		dispatchCommentLoad();

		if (window.swup?.hooks) {
			setupSwupHooks();
		} else {
			const handleSwupEnable = () => setupSwupHooks();
			document.addEventListener("swup:enable", handleSwupEnable);

			return () => {
				document.removeEventListener("swup:enable", handleSwupEnable);
				cleanup();
			};
		}

		return () => {
			cleanup();
		};
	});

	return null;
});

<script lang="ts">
	import { OverlayScrollbars } from "overlayscrollbars";
	import "overlayscrollbars/overlayscrollbars.css";
	import { BANNER_HEIGHT_EXTEND } from "@constants/constants";
	import { pathsEqual, url } from "@utils/url-utils";
	import { siteConfig } from "@/config";

	const bannerEnabled = siteConfig.banner.enable;

	const SCROLLBAR_CONFIG = {
		body: {
			scrollbars: {
				theme: "scrollbar-base scrollbar-auto py-1",
				autoHide: "move",
				autoHideDelay: 500,
				autoHideSuspend: false,
			},
		},
		katex: {
			scrollbars: {
				theme: "scrollbar-base scrollbar-auto",
				autoHide: "leave",
				autoHideDelay: 500,
				autoHideSuspend: false,
			},
		},
	} as const;

	const KATEX_OBSERVER_OPTIONS = {
		root: null,
		rootMargin: "100px",
		threshold: 0.1,
	} as const;

	let overlayScrollbarsInstance: ReturnType<typeof OverlayScrollbars> | null =
		null;
	let katexObserver: IntersectionObserver | null = null;

	// Calculate banner height, must be multiple of 4 to avoid blurry text
	function calculateBannerHeightExtend() {
		let offset = Math.floor(
			window.innerHeight * (BANNER_HEIGHT_EXTEND / 100),
		);
		offset -= offset % 4;
		document.documentElement.style.setProperty(
			"--banner-height-extend",
			`${offset}px`,
		);
	}

	// Show banner by removing initial opacity and scale classes
	function showBanner() {
		if (!bannerEnabled) return;

		const banner = document.getElementById("banner");
		if (!banner) {
			console.error("Banner element not found");
			return;
		}

		banner.classList.remove("opacity-0", "scale-105");
	}

	// Process individual KaTeX element for scrollbar initialization
	function processKatexElement(element: HTMLElement) {
		if (
			!element.parentNode ||
			element.hasAttribute("data-scrollbar-initialized")
		) {
			return;
		}

		const container = document.createElement("div");
		container.className = "katex-display-container";
		container.setAttribute(
			"aria-label",
			"scrollable container for formulas",
		);

		element.parentNode.insertBefore(container, element);
		container.appendChild(element);

		OverlayScrollbars(container, SCROLLBAR_CONFIG.katex);
		element.setAttribute("data-scrollbar-initialized", "true");
	}

	// Initialize scrollbars for KaTeX math formulas with lazy loading
	function initKatexScrollbars() {
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
	}

	// Initialize custom scrollbars for body and KaTeX elements
	function initCustomScrollbar() {
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
	}

	const dispatchCommentLoad = () =>
		document.dispatchEvent(new Event("loadComment"));

	function toggleElementClass(id: string, className: string, add: boolean) {
		const element = document.getElementById(id);
		element?.classList.toggle(className, add);
	}

	// Swup hook handlers
	function handleLinkClick() {
		document.documentElement.style.setProperty("--content-delay", "0ms");
	}

	function handleContentReplace() {
		initCustomScrollbar();
		dispatchCommentLoad();
	}

	function handleVisitStart(visit: { to: { url: string } }) {
		const bodyElement = document.querySelector("body");
		const isHome = pathsEqual(visit.to.url, url("/"));
		bodyElement?.classList.toggle("is-home", isHome);

		toggleElementClass("page-height-extend", "hidden", false);
		toggleElementClass("toc-wrapper", "toc-not-ready", true);
	}

	function handlePageView() {
		toggleElementClass("page-height-extend", "hidden", true);
	}

	function handleVisitEnd() {
		setTimeout(() => {
			toggleElementClass("page-height-extend", "hidden", true);
			toggleElementClass("toc-wrapper", "toc-not-ready", false);
		}, 200);
	}

	function setupSwupHooks() {
		if (!window.swup) return;

		const hooks = window.swup.hooks;
		hooks.on("link:click", handleLinkClick);
		hooks.on("content:replace", handleContentReplace);
		hooks.on("visit:start", handleVisitStart);
		hooks.on("page:view", handlePageView);
		hooks.on("visit:end", handleVisitEnd);
	}

	function cleanupSwupHooks() {
		if (!window.swup) return;

		const hooks = window.swup.hooks;
		hooks.off("link:click", handleLinkClick);
		hooks.off("content:replace", handleContentReplace);
		hooks.off("visit:start", handleVisitStart);
		hooks.off("page:view", handlePageView);
		hooks.off("visit:end", handleVisitEnd);
	}

	function init() {
		calculateBannerHeightExtend();
		initCustomScrollbar();
		showBanner();
		dispatchCommentLoad();
	}

	function cleanup() {
		overlayScrollbarsInstance?.destroy();
		overlayScrollbarsInstance = null;

		katexObserver?.disconnect();
		katexObserver = null;

		window.removeEventListener("resize", calculateBannerHeightExtend);
		document.removeEventListener("swup:enable", setupSwupHooks);
		cleanupSwupHooks();
	}

	$effect(() => {
		init();

		window.addEventListener("resize", calculateBannerHeightExtend);

		if (window.swup?.hooks) {
			setupSwupHooks();
		} else {
			document.addEventListener("swup:enable", setupSwupHooks);
		}

		return cleanup;
	});
</script>

<script lang="ts">
	import {
		BANNER_HEIGHT,
		BANNER_HEIGHT_HOME,
		MAIN_PANEL_OVERLAPS_BANNER_HEIGHT,
		NAVBAR_HEIGHT,
	} from "@constants/constants";
	import { on } from "svelte/events";
	import { siteConfig } from "@/config";

	// State variables
	let scrollTop = $state(0);
	let isHome = $state(false);
	let windowWidth = $state(1024);
	let windowHeight = $state(768);

	const bannerEnabled = siteConfig.banner.enable;

	// Derived values - automatically recompute when dependencies change
	const bannerHeight = $derived(
		windowHeight *
			((isHome && windowWidth >= 1024
				? BANNER_HEIGHT_HOME
				: BANNER_HEIGHT) /
				100),
	);

	const navbarThreshold = $derived(
		bannerHeight -
			NAVBAR_HEIGHT -
			MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16 -
			16,
	);

	const isScrolledPastBanner = $derived(scrollTop > bannerHeight);
	const shouldShowNavbarHidden = $derived(scrollTop >= navbarThreshold);

	// Optimized element visibility toggler using classList.toggle
	function updateElementVisibility(
		element: HTMLElement | null,
		shouldShow: boolean,
		showClass = "",
		hideClass = "",
	) {
		if (!element) return;

		if (hideClass) element.classList.toggle(hideClass, !shouldShow);
		if (showClass) element.classList.toggle(showClass, shouldShow);
	}

	// Single $effect for all DOM updates - runs when dependencies change
	$effect(() => {
		if (typeof document === "undefined") return;

		const backToTopBtn = document.getElementById("back-to-top-btn");
		const toc = document.getElementById("toc-wrapper");
		const navbar = document.getElementById("navbar-wrapper");

		// Update back to top button (always)
		updateElementVisibility(backToTopBtn, isScrolledPastBanner, "", "hide");

		// Update TOC and navbar (only if banner is enabled)
		if (bannerEnabled) {
			updateElementVisibility(toc, isScrolledPastBanner, "", "toc-hide");
			updateElementVisibility(
				navbar,
				shouldShowNavbarHidden,
				"navbar-hidden",
				"",
			);
		}
	});

	// Event handlers - throttle not needed due to passive listeners and minimal work
	function handleScroll() {
		scrollTop =
			document.documentElement.scrollTop || document.body.scrollTop;
		isHome = document.body.classList.contains("is-home");
	}

	function handleResize() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
	}

	$effect(() => {
		// Initialize state from DOM
		handleResize();
		handleScroll();

		// Use svelte/events 'on' function with passive listeners
		const cleanupScroll = on(window, "scroll", handleScroll, {
			passive: true,
		});
		const cleanupResize = on(window, "resize", handleResize, {
			passive: true,
		});

		return () => {
			cleanupScroll();
			cleanupResize();
		};
	});
</script>

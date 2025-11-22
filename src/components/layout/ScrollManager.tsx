import {
	component$,
	useComputed$,
	useSignal,
	useVisibleTask$,
} from "@builder.io/qwik";
import {
	MAIN_PANEL_OVERLAPS_BANNER_HEIGHT,
	NAVBAR_HEIGHT,
} from "@constants/constants";
import { siteConfig } from "@/config";

export default component$(() => {
	// State variables
	const scrollTop = useSignal(0);
	const isHome = useSignal(false);
	const windowWidth = useSignal(1024);
	const windowHeight = useSignal(768);

	// Derived values - automatically recompute when dependencies change
	// Use the configured banner height from siteConfig
	const bannerHeight = useComputed$(() => {
		return windowHeight.value * (siteConfig.banner.height / 100);
	});

	// Calculate when to hide navbar - when user scrolls past banner into content area
	const navbarThreshold = useComputed$(() => {
		return (
			bannerHeight.value -
			NAVBAR_HEIGHT -
			MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16 -
			16
		);
	});

	const isScrolledPastBanner = useComputed$(
		() => scrollTop.value > bannerHeight.value,
	);

	const shouldHideNavbar = useComputed$(
		() => scrollTop.value >= navbarThreshold.value,
	);

	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for DOM manipulation based on scroll state
	useVisibleTask$(({ track }) => {
		// Track state changes
		track(() => isScrolledPastBanner.value);
		track(() => shouldHideNavbar.value);

		if (typeof document === "undefined") return;

		const backToTopBtn = document.getElementById("back-to-top-btn");
		const toc = document.getElementById("toc-wrapper");
		const navbar = document.getElementById("navbar-wrapper");

		// Update back to top button (always)
		if (backToTopBtn) {
			backToTopBtn.classList.toggle("hide", !isScrolledPastBanner.value);
		}

		// Update TOC and navbar
		if (toc) {
			toc.classList.toggle("toc-hide", !isScrolledPastBanner.value);
		}
		if (navbar) {
			navbar.classList.toggle("navbar-hidden", shouldHideNavbar.value);
		}
	});

	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for window event listeners
	useVisibleTask$(() => {
		// Event handlers
		const handleScroll = () => {
			scrollTop.value =
				document.documentElement.scrollTop || document.body.scrollTop;
			isHome.value = document.body.classList.contains("is-home");
		};

		const handleResize = () => {
			windowWidth.value = window.innerWidth;
			windowHeight.value = window.innerHeight;
		};

		// Initialize state from DOM
		handleResize();
		handleScroll();

		// Add event listeners with passive option for better performance
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleResize, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
		};
	});

	return null;
});

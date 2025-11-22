/**
 * PhotoSwipe configuration type
 * Serializable configuration object following Qwik best practices
 */
export interface PhotoSwipeConfig {
	/** Image selector */
	gallery: string;
	/** Close button SVG */
	closeSVG: string;
	/** Zoom button SVG */
	zoomSVG: string;
	/** Padding configuration */
	padding: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
	/** Enable wheel zoom */
	wheelToZoom: boolean;
	/** Show previous arrow */
	arrowPrev: boolean;
	/** Show next arrow */
	arrowNext: boolean;
	/** Image click action */
	imageClickAction: "close" | "zoom" | "next";
	/** Tap action */
	tapAction: "close" | "zoom" | "next";
	/** Double tap action */
	doubleTapAction: "close" | "zoom" | "toggle-controls";
}

/**
 * Image loader configuration
 */
export interface ImageLoaderConfig {
	/** Image wrapper selector */
	selector: string;
	/** IntersectionObserver root margin */
	rootMargin?: string;
}

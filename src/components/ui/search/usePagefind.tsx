import type { Signal } from "@builder.io/qwik";
import { $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { SearchResult } from "@/global";

interface PagefindState {
	loaded: boolean;
	initialized: boolean;
}

/**
 * Custom hook to manage Pagefind initialization state
 * Follows Qwik best practices: isolate browser-specific logic in useVisibleTask$
 */
export const usePagefind = () => {
	const pagefind = useSignal<PagefindState>({
		loaded: false,
		initialized: false,
	});

	// biome-ignore lint/correctness/noQwikUseVisibleTask: Pagefind requires browser environment initialization
	useVisibleTask$(() => {
		const initializePagefind = () => {
			pagefind.value = {
				loaded:
					typeof window !== "undefined" &&
					!!window.pagefind &&
					typeof window.pagefind.search === "function",
				initialized: true,
			};
		};

		if (import.meta.env.DEV) {
			initializePagefind();
		} else {
			const handlePagefindReady = () => {
				initializePagefind();
			};

			const handlePagefindLoadError = () => {
				initializePagefind();
			};

			document.addEventListener("pagefindready", handlePagefindReady);
			document.addEventListener("pagefindloaderror", handlePagefindLoadError);

			const timeoutId = setTimeout(() => {
				if (!pagefind.value.initialized) {
					initializePagefind();
				}
			}, 2000);

			return () => {
				document.removeEventListener("pagefindready", handlePagefindReady);
				document.removeEventListener(
					"pagefindloaderror",
					handlePagefindLoadError,
				);
				clearTimeout(timeoutId);
			};
		}
	});

	return pagefind;
};

/**
 * Create search handler function
 * Follows Qwik best practices: wrap async functions with $ for serializability
 */
export const createSearchHandler = (
	pagefind: Signal<PagefindState>,
	result: Signal<SearchResult[]>,
	setPanelVisibility: (show: boolean, isDesktop: boolean) => void,
	fakeResult: SearchResult[],
) => {
	return $(async (keyword: string, isDesktop: boolean): Promise<void> => {
		if (!keyword) {
			setPanelVisibility(false, isDesktop);
			result.value = [];
			return;
		}

		if (!pagefind.value.initialized) return;

		try {
			let searchResults: SearchResult[];

			if (import.meta.env.PROD && pagefind.value.loaded && window.pagefind) {
				const response = await window.pagefind.search(keyword);
				searchResults = await Promise.all(
					response.results.map((item) => item.data()),
				);
			} else {
				searchResults = import.meta.env.DEV ? fakeResult : [];
			}

			result.value = searchResults;
			setPanelVisibility(searchResults.length > 0, isDesktop);
		} catch (_error) {
			result.value = [];
			setPanelVisibility(false, isDesktop);
		}
	});
};

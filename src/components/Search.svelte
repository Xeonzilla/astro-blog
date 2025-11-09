<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import Icon from "@iconify/svelte";
	import offClick from "@utils/svelte/offClick";
	import { url } from "@utils/url-utils.ts";
	import { untrack } from "svelte";
	import { fly } from "svelte/transition";
	import type { SearchResult } from "@/global";

	let keywordDesktop = $state("");
	let keywordMobile = $state("");
	let result = $state<SearchResult[]>([]);
	let isSearching = $state(false);
	let pagefindLoaded = $state(false);
	let initialized = $state(false);
	let isPanelOpen = $state(false);

	const fakeResult: SearchResult[] = [
		{
			url: url("/"),
			meta: {
				title: "This Is a Fake Search Result",
			},
			excerpt:
				"Because the search cannot work in the <mark>dev</mark> environment.",
		},
		{
			url: url("/"),
			meta: {
				title: "If You Want to Test the Search",
			},
			excerpt:
				"Try running <mark>npm build && npm preview</mark> instead.",
		},
	];

	const togglePanel = () => {
		isPanelOpen = !isPanelOpen;
	};

	const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
		if (!isDesktop) return;
		isPanelOpen = show;
	};

	const search = async (
		keyword: string,
		isDesktop: boolean,
	): Promise<void> => {
		if (!keyword) {
			setPanelVisibility(false, isDesktop);
			untrack(() => {
				result = [];
			});
			return;
		}

		if (!untrack(() => initialized)) {
			return;
		}

		untrack(() => {
			isSearching = true;
		});

		try {
			let searchResults: SearchResult[] = [];

			if (
				import.meta.env.PROD &&
				untrack(() => pagefindLoaded) &&
				window.pagefind
			) {
				const response = await window.pagefind.search(keyword);
				searchResults = await Promise.all(
					response.results.map((item) => item.data()),
				);
			} else if (import.meta.env.DEV) {
				searchResults = fakeResult;
			} else {
				searchResults = [];
				console.error(
					"Pagefind is not available in production environment.",
				);
			}

			untrack(() => {
				result = searchResults;
			});
			setPanelVisibility(searchResults.length > 0, isDesktop);
		} catch (error) {
			console.error("Search error:", error);
			untrack(() => {
				result = [];
			});
			setPanelVisibility(false, isDesktop);
		} finally {
			untrack(() => {
				isSearching = false;
			});
		}
	};

	$effect(() => {
		const initializeSearch = () => {
			initialized = true;
			pagefindLoaded =
				typeof window !== "undefined" &&
				!!window.pagefind &&
				typeof window.pagefind.search === "function";
			console.log("Pagefind status on init:", pagefindLoaded);
			if (keywordDesktop) search(keywordDesktop, true);
			if (keywordMobile) search(keywordMobile, false);
		};

		if (import.meta.env.DEV) {
			console.log(
				"Pagefind is not available in development mode. Using mock data.",
			);
			initializeSearch();
		} else {
			const handlePagefindReady = () => {
				console.log("Pagefind ready event received.");
				initializeSearch();
			};

			const handlePagefindLoadError = () => {
				console.warn(
					"Pagefind load error event received. Search functionality will be limited.",
				);
				initializeSearch(); // Initialize with pagefindLoaded as false
			};

			document.addEventListener("pagefindready", handlePagefindReady);
			document.addEventListener(
				"pagefindloaderror",
				handlePagefindLoadError,
			);

			// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
			const timeoutId = setTimeout(() => {
				if (!initialized) {
					console.log("Fallback: Initializing search after timeout.");
					initializeSearch();
				}
			}, 2000); // Adjust timeout as needed

			return () => {
				document.removeEventListener(
					"pagefindready",
					handlePagefindReady,
				);
				document.removeEventListener(
					"pagefindloaderror",
					handlePagefindLoadError,
				);
				clearTimeout(timeoutId);
			};
		}
	});

	$effect(() => {
		if (initialized && keywordDesktop) {
			search(keywordDesktop, true);
		}
	});

	$effect(() => {
		if (initialized && keywordMobile) {
			search(keywordMobile, false);
		}
	});
</script>

<div
	id="search-bar"
	class="hidden md:flex lg:hidden xl:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/4 hover:bg-black/6 focus-within:bg-black/6
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
"
>
	<Icon
		icon="material-symbols:search"
		class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
	></Icon>
	<input
		placeholder={i18n(I18nKey.search)}
		bind:value={keywordDesktop}
		onfocus={() => search(keywordDesktop, true)}
		class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
	/>
</div>

<button
	onclick={togglePanel}
	aria-label="Search Panel"
	id="search-switch"
	class="btn-plain scale-animation md:hidden! lg:flex! xl:hidden! rounded-lg w-11 h-11 active:scale-90"
>
	<Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
{#if isPanelOpen}
	<div
		id="search-panel"
		class="float-panel search-panel absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2"
		{@attach offClick(() => isPanelOpen = false, ["search-bar", "search-switch"])}
		transition:fly={{ y: -4, duration: 150 }}
	>
		<div
			id="search-bar-inside"
			class="flex relative md:hidden lg:flex xl:hidden transition-all items-center h-11 rounded-xl
      bg-black/4 hover:bg-black/6 focus-within:bg-black/6
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  "
		>
			<Icon
				icon="material-symbols:search"
				class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
			></Icon>
			<input
				placeholder="Search"
				bind:value={keywordMobile}
				class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
			/>
		</div>

		<!-- search results -->
		{#each result as item}
			<a
				href={item.url}
				class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl text-lg px-3 py-2 hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active)"
			>
				<div
					class="transition text-90 inline-flex font-bold group-hover:text-(--primary)"
				>
					{item.meta.title}<Icon
						icon="fa6-solid:chevron-right"
						class="transition text-[0.75rem] translate-x-1 my-auto text-(--primary)"
					></Icon>
				</div>
				<div class="transition text-sm text-50">
					{@html item.excerpt}
				</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	input:focus {
		outline: 0;
	}
	.search-panel {
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}
</style>

import {
	$,
	component$,
	useSignal,
	useStyles$,
	useTask$,
	useVisibleTask$,
} from "@builder.io/qwik";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { url } from "@utils/url-utils";
import { IconChevronRight, IconSearch } from "@/components/icons";
import type { SearchResult } from "@/global";

export default component$(() => {
	useStyles$(`
		input:focus {
			outline: 0;
		}

		.search-panel {
			max-height: calc(100vh - 100px);
			overflow-y: auto;
		}
	`);

	const keywordDesktop = useSignal("");
	const keywordMobile = useSignal("");
	const result = useSignal<SearchResult[]>([]);
	const isSearching = useSignal(false);
	const isPanelOpen = useSignal(false);

	const pagefind = useSignal({
		loaded: false,
		initialized: false,
	});

	const fakeResult: SearchResult[] = [
		{
			url: url("/"),
			meta: {
				title: "This Is a Fake Search Result",
			},
			excerpt: "Because the search cannot work in the dev environment.",
		},
		{
			url: url("/"),
			meta: {
				title: "If You Want to Test the Search",
			},
			excerpt: "Try running npm build && npm preview instead.",
		},
	];

	const sanitizeHTML = (html: string): string => {
		const allowedTags = ["mark"];
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		const allElements = doc.body.getElementsByTagName("*");
		for (let i = allElements.length - 1; i >= 0; i--) {
			const element = allElements[i];
			if (!allowedTags.includes(element.tagName.toLowerCase())) {
				element.replaceWith(element.textContent || "");
			}
		}

		return doc.body.innerHTML;
	};

	const togglePanel = $(() => {
		isPanelOpen.value = !isPanelOpen.value;
	});

	const setPanelVisibility = $((show: boolean, isDesktop: boolean): void => {
		if (!isDesktop) return;
		isPanelOpen.value = show;
	});

	const search = $(
		async (keyword: string, isDesktop: boolean): Promise<void> => {
			if (!keyword) {
				await setPanelVisibility(false, isDesktop);
				result.value = [];
				return;
			}

			if (!pagefind.value.initialized) {
				return;
			}

			isSearching.value = true;

			try {
				let searchResults: SearchResult[] = [];

				if (import.meta.env.PROD && pagefind.value.loaded && window.pagefind) {
					const response = await window.pagefind.search(keyword);
					searchResults = await Promise.all(
						response.results.map((item) => item.data()),
					);
				} else if (import.meta.env.DEV) {
					searchResults = fakeResult;
				} else {
					searchResults = [];
				}

				result.value = searchResults;
				await setPanelVisibility(searchResults.length > 0, isDesktop);
			} catch (_error) {
				result.value = [];
				await setPanelVisibility(false, isDesktop);
			} finally {
				isSearching.value = false;
			}
		},
	);

	// Initialize pagefind
	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for browser API and pagefind initialization
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

	// Watch desktop keyword changes
	useTask$(({ track }) => {
		const keyword = track(() => keywordDesktop.value);
		if (pagefind.value.initialized && keyword) {
			search(keyword, true);
		}
	});

	// Watch mobile keyword changes
	useTask$(({ track }) => {
		const keyword = track(() => keywordMobile.value);
		if (pagefind.value.initialized && keyword) {
			search(keyword, false);
		}
	});

	// Handle clicks outside panel
	// biome-ignore lint/correctness/noQwikUseVisibleTask: Required for DOM event listeners
	useVisibleTask$(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const panel = document.getElementById("search-panel");
			const searchBar = document.getElementById("search-bar");
			const searchSwitch = document.getElementById("search-switch");

			if (
				isPanelOpen.value &&
				panel &&
				!panel.contains(target) &&
				searchBar &&
				!searchBar.contains(target) &&
				searchSwitch &&
				!searchSwitch.contains(target)
			) {
				isPanelOpen.value = false;
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	});

	return (
		<>
			<div
				id="search-bar"
				class="hidden md:flex lg:hidden xl:flex transition-all items-center h-11 mr-2 rounded-lg
                    bg-black/4 hover:bg-black/6 focus-within:bg-black/6
                    dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
			>
				<IconSearch class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30" />
				<input
					placeholder={i18n(I18nKey.search)}
					value={keywordDesktop.value}
					onInput$={(_e, target) => {
						keywordDesktop.value = target.value;
					}}
					onFocus$={() => search(keywordDesktop.value, true)}
					class="transition-all pl-10 text-sm bg-transparent outline-0
                        h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
				/>
			</div>

			<button
				type="button"
				onClick$={togglePanel}
				aria-label="Search Panel"
				id="search-switch"
				class="btn-plain scale-animation md:hidden! lg:flex! xl:hidden! rounded-lg w-11 h-11 active:scale-90"
			>
				<IconSearch class="text-[1.25rem]" />
			</button>

			{/* search panel */}
			{isPanelOpen.value && (
				<div
					id="search-panel"
					class="float-panel search-panel absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2"
					style={{
						animation: "slideIn 150ms ease-out",
						maxHeight: "calc(100vh - 100px)",
						overflowY: "auto",
					}}
				>
					<div
						id="search-bar-inside"
						class="flex relative md:hidden lg:flex xl:hidden transition-all items-center h-11 rounded-xl
                            bg-black/4 hover:bg-black/6 focus-within:bg-black/6
                            dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
					>
						<IconSearch class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30" />
						<input
							placeholder="Search"
							value={keywordMobile.value}
							onInput$={(_e, target) => {
								keywordMobile.value = target.value;
							}}
							class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
                                focus:w-60 text-black/50 dark:text-white/50"
						/>
					</div>

					{/* search results */}
					{result.value.map((item) => (
						<a
							key={item.url}
							href={item.url}
							class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
                                rounded-xl text-lg px-3 py-2 hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active)"
						>
							<div class="transition text-90 inline-flex font-bold group-hover:text-(--primary)">
								{item.meta.title}
								<IconChevronRight class="transition text-[0.75rem] translate-x-1 my-auto text-(--primary)" />
							</div>
							<div
								class="transition text-sm text-50"
								dangerouslySetInnerHTML={sanitizeHTML(item.excerpt)}
							/>
						</a>
					))}
				</div>
			)}
		</>
	);
});

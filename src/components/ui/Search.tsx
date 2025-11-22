import {
	$,
	component$,
	useSignal,
	useStyles$,
	useTask$,
	useVisibleTask$,
} from "@builder.io/qwik";
import { url } from "@utils/url-utils";
import type { SearchResult } from "@/global";
import { SearchButton } from "./search/SearchButton";
import { SearchInput } from "./search/SearchInput";
import { SearchPanelMobile } from "./search/SearchPanelMobile";
import { SearchResultItem } from "./search/SearchResultItem";
import { createSearchHandler, usePagefind } from "./search/usePagefind";

const FAKE_RESULTS: SearchResult[] = [
	{
		url: url("/"),
		meta: { title: "This Is a Fake Search Result" },
		excerpt: "Because the search cannot work in the dev environment.",
	},
	{
		url: url("/"),
		meta: { title: "If You Want to Test the Search" },
		excerpt: "Try running npm build && npm preview instead.",
	},
];

/**
 * Search component optimized with Qwik best practices
 */
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
	const isPanelOpen = useSignal(false);

	const pagefind = usePagefind();

	const setPanelVisibility = $((show: boolean, isDesktop: boolean): void => {
		if (!isDesktop) return;
		isPanelOpen.value = show;
	});

	const togglePanel = $(() => {
		isPanelOpen.value = !isPanelOpen.value;
	});

	const search = createSearchHandler(
		pagefind,
		result,
		setPanelVisibility,
		FAKE_RESULTS,
	);

	const handleInput = $((value: string, isDesktop: boolean) => {
		if (isDesktop) {
			keywordDesktop.value = value;
		} else {
			keywordMobile.value = value;
		}
	});

	const handleDesktopFocus = $(() => {
		search(keywordDesktop.value, true);
	});

	useTask$(({ track }) => {
		const desktopKeyword = track(() => keywordDesktop.value);
		const mobileKeyword = track(() => keywordMobile.value);

		if (!pagefind.value.initialized) return;

		if (desktopKeyword) {
			search(desktopKeyword, true);
		} else if (mobileKeyword) {
			search(mobileKeyword, false);
		}
	});

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
			<SearchInput
				keyword={keywordDesktop.value}
				onInput$={(value) => handleInput(value, true)}
				onFocus$={handleDesktopFocus}
			/>

			<SearchButton onClick$={togglePanel} />

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
					<SearchPanelMobile
						keyword={keywordMobile.value}
						onInput$={(value) => handleInput(value, false)}
						results={result.value}
					/>

					<div class="hidden md:block lg:hidden xl:block">
						{result.value.map((item) => (
							<SearchResultItem key={item.url} item={item} />
						))}
					</div>
				</div>
			)}
		</>
	);
});

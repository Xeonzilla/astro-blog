import { component$, type QRL } from "@builder.io/qwik";
import { IconSearch } from "@/components/icons";
import type { SearchResult } from "@/global";
import { SearchResultItem } from "./SearchResultItem";

interface SearchPanelMobileProps {
	keyword: string;
	onInput$: QRL<(value: string) => void>;
	results: SearchResult[];
}

export const SearchPanelMobile = component$<SearchPanelMobileProps>(
	({ keyword, onInput$, results }) => {
		return (
			<>
				<div
					id="search-bar-inside"
					class="flex relative md:hidden lg:flex xl:hidden transition-all items-center h-11 rounded-xl
                        bg-black/4 hover:bg-black/6 focus-within:bg-black/6
                        dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
				>
					<IconSearch class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30" />
					<input
						placeholder="Search"
						value={keyword}
						onInput$={(_e, target) => onInput$(target.value)}
						class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
                            focus:w-60 text-black/50 dark:text-white/50"
					/>
				</div>

				{results.map((item) => (
					<SearchResultItem key={item.url} item={item} />
				))}
			</>
		);
	},
);

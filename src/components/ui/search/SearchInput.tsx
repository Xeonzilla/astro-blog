import { component$, type QRL } from "@builder.io/qwik";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { IconSearch } from "@/components/icons";

interface SearchInputProps {
	keyword: string;
	onInput$: QRL<(value: string) => void>;
	onFocus$: QRL<() => void>;
}

export const SearchInput = component$<SearchInputProps>(
	({ keyword, onInput$, onFocus$ }) => {
		return (
			<div
				id="search-bar"
				class="hidden md:flex lg:hidden xl:flex transition-all items-center h-11 mr-2 rounded-lg
                    bg-black/4 hover:bg-black/6 focus-within:bg-black/6
                    dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
			>
				<IconSearch class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30" />
				<input
					placeholder={i18n(I18nKey.search)}
					value={keyword}
					onInput$={(_e, target) => onInput$(target.value)}
					onFocus$={onFocus$}
					class="transition-all pl-10 text-sm bg-transparent outline-0
                        h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
				/>
			</div>
		);
	},
);

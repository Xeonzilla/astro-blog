import { component$, type QRL } from "@builder.io/qwik";
import { IconSearch } from "@/components/icons";

interface SearchButtonProps {
	onClick$: QRL<() => void>;
}

export const SearchButton = component$<SearchButtonProps>(({ onClick$ }) => {
	return (
		<button
			type="button"
			onClick$={onClick$}
			aria-label="Search Panel"
			id="search-switch"
			class="btn-plain scale-animation md:hidden! lg:flex! xl:hidden! rounded-lg w-11 h-11 active:scale-90"
		>
			<IconSearch class="text-[1.25rem]" />
		</button>
	);
});

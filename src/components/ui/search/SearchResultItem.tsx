import { component$, useComputed$ } from "@builder.io/qwik";
import { IconChevronRight } from "@/components/icons";
import type { SearchResult } from "@/global";

interface SearchResultItemProps {
	item: SearchResult;
}

// Sanitize HTML, only allow <mark> tags
const sanitizeHTML = (html: string): string => {
	if (typeof DOMParser === "undefined") return html;

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const elements = doc.body.getElementsByTagName("*");

	for (let i = elements.length - 1; i >= 0; i--) {
		const el = elements[i];
		if (el.tagName.toLowerCase() !== "mark") {
			el.replaceWith(el.textContent || "");
		}
	}

	return doc.body.innerHTML;
};

export const SearchResultItem = component$<SearchResultItemProps>(
	({ item }) => {
		const sanitizedExcerpt = useComputed$(() => sanitizeHTML(item.excerpt));

		return (
			<a
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
					dangerouslySetInnerHTML={sanitizedExcerpt.value}
				/>
			</a>
		);
	},
);

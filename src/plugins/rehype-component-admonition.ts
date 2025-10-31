import type { Element, ElementContent } from "hast";
import { h } from "hastscript";

type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";

export interface AdmonitionProperties {
	title?: string;
	"has-directive-label"?: boolean;
}

function isElement(node: ElementContent): node is Element {
	return node.type === "element";
}

/**
 * Creates an admonition component.
 *
 * @param properties - The properties of the component.
 * @param properties.title - An optional title.
 * @param children - The children elements of the component.
 * @param type - The admonition type.
 * @returns The created admonition component.
 */
export function AdmonitionComponent(
	properties: AdmonitionProperties,
	children: ElementContent[],
	type: AdmonitionType,
): Element {
	if (!Array.isArray(children) || children.length === 0)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid admonition directive. (Admonition directives must be of block type ":::note{name="name"} <content> :::")',
		);

	let label: Element | null = null;
	if (properties?.["has-directive-label"]) {
		const firstChild = children[0];
		if (firstChild && isElement(firstChild)) {
			label = { ...firstChild }; // Create a copy to avoid modifying the original
			label.tagName = "div"; // Change the tag from <p> to <div>
		}
		const bodyContent = children.slice(1);
		return h("blockquote", { class: `admonition bdm-${type}` }, [
			h("span", { class: "bdm-title" }, label || type.toUpperCase()),
			...bodyContent,
		]);
	}

	return h("blockquote", { class: `admonition bdm-${type}` }, [
		h("span", { class: "bdm-title" }, type.toUpperCase()),
		...children,
	]);
}

import type { Properties } from "hast";
import { h } from "hastscript";
import type { Root } from "mdast";
import type { Transformer } from "unified";
import type { Data, Node, Parent } from "unist";
import { visit } from "unist-util-visit";

interface DirectiveNode extends Parent {
	type: "containerDirective" | "leafDirective" | "textDirective";
	name: string;
	attributes: Properties;
	children: Node[];
	data?: Data & {
		hName?: string;
		hProperties?: Properties;
	};
}

function isDirectiveNode(node: Node): node is DirectiveNode {
	return (
		node.type === "containerDirective" ||
		node.type === "leafDirective" ||
		node.type === "textDirective"
	);
}

/**
 * Transforms directive nodes in the AST to hast elements.
 *
 * @returns A unified transformer function
 */
export function parseDirectiveNode(): Transformer<Root, Root> {
	return (tree: Root) => {
		visit(tree, (node: Node) => {
			if (isDirectiveNode(node)) {
				node.data ??= {};
				node.attributes ??= {};

				const firstChild = node.children?.[0];

				if (
					(firstChild?.data as { directiveLabel?: boolean })?.directiveLabel
				) {
					// Add a flag to the node to indicate that it has a directive label
					node.attributes["has-directive-label"] = true;
				}

				const hast = h(node.name, node.attributes);

				node.data.hName = hast.tagName;
				node.data.hProperties = hast.properties;
			}
		});
	};
}

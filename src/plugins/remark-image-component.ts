import path from "node:path";
import type { Image, Root } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

/**
 * Checks if a URL is a relative path.
 *
 * @param url - The URL to check
 * @returns True if the URL is a relative path, false otherwise
 */
const isRelativePath = (url: string): boolean =>
	!/^\/|^(?:[a-z]+:)?\/\//i.test(url);

/**
 * Creates a remark plugin that transforms image nodes to ImageWrapper components.
 *
 * @returns A unified transformer function that converts image nodes to JSX components
 */
export function remarkImageComponent(): Transformer<Root> {
	return (tree: Root, file: VFile) => {
		visit(tree, "image", (node: Image) => {
			const imageUrl = node.url;
			let finalSrc = imageUrl;

			if (isRelativePath(imageUrl)) {
				const fileDir = file.dirname;
				if (!fileDir) {
					return;
				}
				const srcDir = path.join(file.cwd, "src");
				const contentDir = path.relative(srcDir, fileDir);
				finalSrc = path.join(contentDir, imageUrl).replace(/\\/g, "/");
			}

			const transformedNode = node as unknown as Record<string, unknown>;

			transformedNode.type = "mdxJsxFlowElement";
			transformedNode.name = "ImageWrapper";
			transformedNode.attributes = [
				{ type: "mdxJsxAttribute", name: "src", value: finalSrc },
				{ type: "mdxJsxAttribute", name: "alt", value: node.alt },
			];

			delete transformedNode.url;
			delete transformedNode.alt;
			delete transformedNode.title;
		});
	};
}

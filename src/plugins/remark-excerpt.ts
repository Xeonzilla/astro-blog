import type { Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Transformer } from "unified";
import type { VFile } from "vfile";

interface ExcerptFrontmatter {
	excerpt?: string;
	[key: string]: unknown;
}

interface AstroVFileData {
	astro: {
		frontmatter: ExcerptFrontmatter;
	};
}

/**
 * Creates a remark plugin that extracts the first paragraph of a document as an excerpt.
 *
 * @returns A unified transformer function that sets the excerpt in frontmatter
 */
export function remarkExcerpt(): Transformer<Root> {
	return (tree: Root, vfile: VFile) => {
		const data = vfile.data as AstroVFileData;
		data.astro ??= { frontmatter: {} };
		data.astro.frontmatter ??= {};

		const firstParagraph = tree.children.find(
			(node) => node.type === "paragraph",
		);

		const excerpt = firstParagraph ? mdastToString(firstParagraph) : "";

		data.astro.frontmatter.excerpt = excerpt;
	};
}

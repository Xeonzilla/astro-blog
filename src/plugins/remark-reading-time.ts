import type { Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime, { type ReadTimeResults } from "reading-time";
import type { Plugin } from "unified";
import type { VFile } from "vfile";

interface ReadingTimeFrontmatter {
	minutes?: number;
	words?: number;
	[key: string]: unknown;
}

interface AstroVFileData {
	astro: {
		frontmatter: ReadingTimeFrontmatter;
	};
}

/**
 * A remark plugin that calculates the reading time of a document.
 *
 * @returns A unified plugin that adds reading time metadata
 */
export const remarkReadingTime: Plugin<[], Root> = () => {
	return (tree: Root, vfile: VFile) => {
		const textOnPage = mdastToString(tree);
		const readingTime: ReadTimeResults = getReadingTime(textOnPage);
		const data = vfile.data as AstroVFileData;

		data.astro ??= { frontmatter: {} };
		data.astro.frontmatter ??= {};
		data.astro.frontmatter.minutes = Math.max(
			1,
			Math.round(readingTime.minutes),
		);
		data.astro.frontmatter.words = readingTime.words;
	};
};

import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import type { Author, FeedOptions } from "feed";
import { Feed } from "feed";
import type { Root as HastRoot, RootContent } from "hast";
import type { Code, Root as MdastRoot } from "mdast";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { Plugin } from "unified";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { profileConfig, siteConfig } from "@/config";

type UrlLike = URL | string;

const mdxCache = new Map<string, Promise<string>>();

/**
 * The main feed generation function.
 *
 * @param context The Astro API context.
 * @returns A configured and populated `Feed` instance.
 */
export async function generateFeed(context: APIContext) {
	if (!context.site) {
		throw new Error(
			"Please set the 'site' option in `astro.config.ts` to generate the feed.",
		);
	}

	const site = context.site.toString();

	const author: Author = {
		name: profileConfig.name,
		link: site,
	};

	const feedOptions: FeedOptions = {
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		id: site,
		link: site,
		language: siteConfig.lang,
		favicon: url(siteConfig.favicon.at(-1)?.src || ""),
		copyright: `All rights reserved ${new Date().getFullYear()}, ${
			profileConfig.name
		}`,
		author,
		feedLinks: {
			rss: url("/rss.xml"),
			atom: url("/atom.xml"),
		},
	};

	const feed = new Feed(feedOptions);
	const posts = await getSortedPosts();

	for (const post of posts) {
		const postUrl = url(`/posts/${post.slug}/`);
		// Process description and body HTML conversion in parallel.
		// The caching in `mdxToHtml` will prevent redundant work.
		const [descriptionHtml, contentHtml] = await Promise.all([
			mdxToHtml(post.data.description || "", site),
			mdxToHtml(post.body, site),
		]);

		feed.addItem({
			title: post.data.title,
			id: postUrl,
			link: postUrl,
			description: descriptionHtml,
			content: contentHtml,
			author: [author],
			published: post.data.published,
			date: post.data.updated || post.data.published,
		});
	}

	return feed;
}

/**
 * Converts an MDX string to an HTML string using a cached unified pipeline.
 * This prevents reprocessing the same content multiple times.
 *
 * @param mdxContent The MDX content to process.
 * @param site The base URL of the site for resolving relative links.
 * @returns A promise that resolves to the processed HTML string.
 */
async function mdxToHtml(mdxContent: string, site: UrlLike): Promise<string> {
	const cacheKey = `${site.toString()}:${mdxContent}`;
	const cachedPromise = mdxCache.get(cacheKey);

	if (cachedPromise) {
		return cachedPromise;
	}

	const processingPromise = (async () => {
		const result = await unified()
			.use(remarkParse)
			.use(remarkMdx)
			.use(remarkGfm)
			.use(remarkMath)
			.use(remarkRemoveAnsiBlocks)
			.use(remarkRemoveImports)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeKatex)
			.use(rehypeAbsoluteUrls, site)
			.use(rehypeStringify)
			.process(mdxContent);

		return result.toString();
	})();

	mdxCache.set(cacheKey, processingPromise);
	return processingPromise;
}

/**
 * Helper function to safely convert a relative path to an absolute URL.
 *
 * @param path The path string.
 * @param baseUrl The base URL.
 * @returns A full absolute URL, or the original path on failure.
 */
function createUrlForPlugins(path: string, baseUrl: UrlLike): string {
	try {
		return new URL(path, baseUrl).href;
	} catch {
		return path;
	}
}

/**
 * A Remark plugin to remove all code blocks with lang="ansi" to prevent
 * illegal characters from entering the XML feed.
 */
const remarkRemoveAnsiBlocks: Plugin<[], MdastRoot> = () => (tree) => {
	visit(tree, "code", (node: Code, index, parent) => {
		if (node.lang === "ansi") {
			if (parent && typeof index === "number") {
				parent.children.splice(index, 1);
				// Return the index to re-evaluate the new node at this position.
				return index;
			}
		}
	});
	return tree;
};

/**
 * A Remark plugin to remove MDX `import`/`export` statements.
 */
const remarkRemoveImports: Plugin<[], MdastRoot> = () => (tree) => {
	tree.children = tree.children.filter((node) => node.type !== "mdxjsEsm");
	return tree;
};

/**
 * A Rehype plugin to convert relative URLs in `href`, `src`, and `srcset`
 * attributes to absolute URLs.
 */
const rehypeAbsoluteUrls: Plugin<[UrlLike], HastRoot> = (baseUrl) => (tree) => {
	visit(tree, "element", (node: HastRoot | RootContent) => {
		if (node.type !== "element" || !node.properties) return;

		const urlAttributes = ["href", "src"];
		for (const attr of urlAttributes) {
			const value = node.properties[attr];
			if (typeof value === "string" && value.startsWith("/")) {
				node.properties[attr] = createUrlForPlugins(value, baseUrl);
			}
		}

		// Special handling for srcset
		if (typeof node.properties.srcset === "string") {
			const srcset = node.properties.srcset;
			node.properties.srcset = srcset
				.split(",")
				.map((part) => {
					const [url, ...descriptor] = part.trim().split(/\s+/);
					if (url.startsWith("/")) {
						return `${createUrlForPlugins(url, baseUrl)} ${descriptor.join(
							" ",
						)}`;
					}
					return part.trim();
				})
				.join(", ");
		}
	});
	return tree;
};

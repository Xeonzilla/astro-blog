import { getCategorySlug, getTagSlug } from "@utils/slug-utils";

export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(id: string): string {
	return url(`/posts/${id}/`);
}

export function getTagUrl(tag: string): string {
	if (!tag) return url("/archive/tag/");

	const slug = getTagSlug(tag);
	const tagUrl = `/archive/tag/${slug}/`;
	return url(tagUrl);
}

export function getCategoryUrl(category: string | null): string {
	const slug = getCategorySlug(category?.trim() || "");
	return url(`/archive/category/${slug}/`);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return path ? `${path}/` : "";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string) {
	return joinUrl("", import.meta.env.BASE_URL, path);
}

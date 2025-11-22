import { UNCATEGORIZED } from "@constants/constants";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { categorySlugMap, slugConfig, tagSlugMap } from "@/config/slugConfig";

function isUrlFriendly(str: string): boolean {
	return /^[a-z0-9_-]+$/.test(str.trim());
}

function buildReverseMap(
	mapping: Record<string, string>,
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(mapping).map(([name, slug]) => [slug, name]),
	);
}

const slugToTagMap = buildReverseMap(tagSlugMap);
const slugToCategoryMap = buildReverseMap(categorySlugMap);

function validateMapping(
	mapping: Record<string, string>,
	type: "Tag" | "Category",
	errors: string[],
): void {
	const slugSet = new Set<string>();
	const isTag = type === "Tag";

	for (const [name, slug] of Object.entries(mapping)) {
		const trimmed = slug.trim();

		if (!isUrlFriendly(trimmed)) {
			errors.push(
				`${type} "${name}" has invalid slug "${trimmed}". Slug must only contain lowercase letters, numbers, hyphens, and underscores.`,
			);
		}

		if (slugSet.has(trimmed)) {
			const existing = Object.entries(mapping).find(
				([n, s]) => s.trim() === trimmed && n !== name,
			)?.[0];
			errors.push(
				`Duplicate ${type.toLowerCase()} slug "${trimmed}" used by both "${name}" and "${existing}"`,
			);
		}

		slugSet.add(trimmed);

		if (isTag && trimmed === UNCATEGORIZED) {
			errors.push(
				`Tag "${name}" uses reserved slug "${UNCATEGORIZED}". This slug is reserved for uncategorized categories.`,
			);
		}
	}
}

function validateSlugMappings(): void {
	const errors: string[] = [];
	validateMapping(tagSlugMap, "Tag", errors);
	validateMapping(categorySlugMap, "Category", errors);

	if (errors.length > 0) {
		throw new Error(
			`[Slug] Configuration errors found:\n\n${errors.join("\n")}\n\nPlease fix these issues in src/config/slugConfig.ts`,
		);
	}
}
validateSlugMappings();

function getSlug(
	name: string,
	mapping: Record<string, string>,
	type: "tag" | "category",
): string {
	const trimmed = name.trim();
	const configured = mapping[trimmed];

	if (configured) {
		if (!isUrlFriendly(configured)) {
			throw new Error(
				`[Slug] Invalid slug mapping for ${type} "${trimmed}". The configured slug "${configured}" is not URL-friendly.\nSlug must only contain: lowercase letters (a-z), numbers (0-9), hyphens (-), underscores (_)\nPlease fix the mapping in src/config/slugConfig.ts:\n  "${trimmed}": "${configured}" ← Invalid\n  "${trimmed}": "valid-slug-here" ← Correct`,
			);
		}
		return configured;
	}

	if (slugConfig.requireAllMappings) {
		throw new Error(
			`[Slug] ${type.charAt(0).toUpperCase() + type.slice(1)} "${trimmed}" has no mapping. When requireAllMappings is true, all ${type}s must be configured in src/config/slugConfig.ts`,
		);
	}

	if (isUrlFriendly(trimmed)) return trimmed;

	throw new Error(
		`[Slug] ${type.charAt(0).toUpperCase() + type.slice(1)} "${trimmed}" is not URL-friendly (contains special characters, uppercase letters, spaces, or non-ASCII characters).\nPlease add a mapping in src/config/slugConfig.ts ${type}SlugMap, for example:\n  "${trimmed}": "your-slug-here"\nURL-friendly characters: lowercase letters (a-z), numbers (0-9), hyphens (-), underscores (_)`,
	);
}

export function getTagSlug(tag: string): string {
	return getSlug(tag, tagSlugMap, "tag");
}

export function getCategorySlug(category: string): string {
	const trimmed = category.trim();
	if (!trimmed || trimmed === i18n(I18nKey.uncategorized)) {
		return UNCATEGORIZED;
	}
	return getSlug(trimmed, categorySlugMap, "category");
}

export function getTagBySlug(slug: string): string | null {
	return slugToTagMap[slug] ?? null;
}

export function getCategoryBySlug(slug: string): string | null {
	if (slug === UNCATEGORIZED) {
		return i18n(I18nKey.uncategorized);
	}
	return slugToCategoryMap[slug] ?? null;
}

function getAllSlugs(
	items: string[],
	getSlugFn: (item: string) => string,
	type: string,
): Map<string, string> {
	const slugMap = new Map<string, string>();

	for (const item of new Set(items)) {
		try {
			slugMap.set(item, getSlugFn(item));
		} catch (error) {
			throw new Error(`Failed to get slug for ${type} "${item}": ${error}`);
		}
	}
	return slugMap;
}

export function getAllTagSlugs(tags: string[]): Map<string, string> {
	return getAllSlugs(tags, getTagSlug, "tag");
}

export function getAllCategorySlugs(categories: string[]): Map<string, string> {
	return getAllSlugs(categories, getCategorySlug, "category");
}

function checkDuplicates(
	mapping: Record<string, string>,
	type: string,
	errors: string[],
): void {
	const slugCounts = new Map<string, string[]>();

	for (const [name, slug] of Object.entries(mapping)) {
		if (!slugCounts.has(slug)) slugCounts.set(slug, []);
		slugCounts.get(slug)?.push(name);
	}

	for (const [slug, names] of slugCounts) {
		if (names.length > 1) {
			errors.push(
				`Duplicate ${type} slug "${slug}" used by: ${names.join(", ")}`,
			);
		}
	}
}

export function validateSlugConfig(): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	checkDuplicates(tagSlugMap, "tag", errors);
	checkDuplicates(categorySlugMap, "category", errors);
	return { valid: errors.length === 0, errors };
}

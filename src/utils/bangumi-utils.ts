const BANGUMI_USER_ID = "Xeonzilla";
const BANGUMI_API_BASE = "https://api.bgm.tv";
const CONTAINS_NUMBER_REGEX = /\d/;
const BANGUMI_DETAIL_BASE = "https://bgm.tv/subject/";

export interface ProcessedAnime {
	title: string;
	cover: string;
	originalTitle: string;
	year: string;
	genre: string[];
	progress: number;
	totalEpisodes: number;
	detailUrl: string;
}

interface BangumiSubject {
	id: number;
	date: string;
	eps: number;
	name_cn: string;
	name: string;
	images: { large: string };
	tags: { name: string }[];
}

interface BangumiCollectionItem {
	subject: BangumiSubject;
	ep_status: number;
}

async function fetchCollectionCount(type: number): Promise<number> {
	try {
		const response = await fetch(
			`${BANGUMI_API_BASE}/v0/users/${BANGUMI_USER_ID}/collections?subject_type=2&type=${type}&limit=1&offset=0`,
		);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch Bangumi count. Status: ${response.status} ${response.statusText}`,
			);
		}

		const data: { total: number; data: unknown[] } = await response.json();
		return data.total || 0;
	} catch (error) {
		console.error(`Error fetching Bangumi count for type ${type}:`, error);
		throw error;
	}
}

async function fetchWatchingCollection(): Promise<BangumiCollectionItem[]> {
	try {
		const limit = 50;

		const firstResponse = await fetch(
			`${BANGUMI_API_BASE}/v0/users/${BANGUMI_USER_ID}/collections?subject_type=2&type=3&limit=${limit}&offset=0`,
		);

		if (!firstResponse.ok) {
			throw new Error(
				`Failed to fetch Bangumi data. Status: ${firstResponse.status} ${firstResponse.statusText}`,
			);
		}

		const firstData: { total: number; data: BangumiCollectionItem[] } =
			await firstResponse.json();
		const total = firstData.total || 0;
		const allData: BangumiCollectionItem[] = firstData.data || [];

		if (total > limit) {
			const totalPages = Math.ceil(total / limit);
			const remainingRequests = [];

			for (let page = 1; page < totalPages; page++) {
				const offset = page * limit;
				remainingRequests.push(
					fetch(
						`${BANGUMI_API_BASE}/v0/users/${BANGUMI_USER_ID}/collections?subject_type=2&type=3&limit=${limit}&offset=${offset}`,
					)
						.then(async (response) => {
							if (!response.ok) {
								throw new Error(`Failed to fetch page ${page}`);
							}
							const data: { data: BangumiCollectionItem[] } =
								await response.json();
							return data.data || [];
						})
						.then(async (data) => {
							await new Promise((resolve) => setTimeout(resolve, 100 * page));
							return data;
						}),
				);
			}

			const results = await Promise.all(remainingRequests);
			for (const pageData of results) {
				allData.push(...pageData);
			}
		}

		return allData;
	} catch (error) {
		console.error("Error fetching Bangumi data:", error);
		let errorMessage = "An unknown error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		throw new Error(
			`Could not fetch Bangumi "watching" collection. Original error: ${errorMessage}`,
		);
	}
}

function processBangumiData(data: BangumiCollectionItem[]): ProcessedAnime[] {
	if (!data) return [];

	return data.map((item) => {
		const progress = item.ep_status || 0;
		const totalEpisodes = item.subject.eps || progress;

		const genre =
			item.subject.tags
				?.filter((tag) => !CONTAINS_NUMBER_REGEX.test(tag.name))
				.slice(0, 2)
				.map((tag) => tag.name) || [];

		const title = item.subject.name_cn || item.subject.name;
		const originalTitle = item.subject.name_cn ? item.subject.name : "";

		return {
			title,
			cover: item.subject.images.large,
			originalTitle,
			year: item.subject.date,
			genre,
			progress,
			totalEpisodes,
			detailUrl: `${BANGUMI_DETAIL_BASE}${item.subject.id}`,
		};
	});
}

export async function getAnimeData() {
	const [watchingData, completedCount] = await Promise.all([
		fetchWatchingCollection(),
		fetchCollectionCount(2),
	]);

	const animeList = processBangumiData(watchingData);

	const watchingCount = watchingData.length;
	const totalCount = watchingCount + completedCount;

	const stats = {
		total: totalCount,
		watching: watchingCount,
		completed: completedCount,
	};

	return { stats, animeList };
}

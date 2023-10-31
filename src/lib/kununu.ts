export const kununu_search_url = 'https://www.kununu.com/middlewares/kununu-search/top-company-profiles?sort=number-reviews-desc'

export const company_sizes = [
	"konzerne",
	"grossunternehmen",
	"kmu",
]

export interface KununuFilterKeyword {
	name: string
	key: string
}

export async function fetch_keywords(): Promise<
	{
		industry: KununuFilterKeyword[],
		company_size: KununuFilterKeyword[],
		country: KununuFilterKeyword[],
	}
> {
	const response = await fetch(kununu_search_url);
	const data = await response.json();
	return {
		industry: data['filters']['possibleFilters']['industries']['options'].map(
			(industry: Record<string, string>) => {
				return {
					name: industry['value'],
					key: industry['slug'],
				} satisfies KununuFilterKeyword;
			}
		),
		company_size: data['filters']['possibleFilters']['employerSegments']['options'].map(
			(employer_segment: Record<string, string>) => {
				return {
					name: employer_segment['slug'],
					key: employer_segment['slug'],
				} satisfies KununuFilterKeyword;
			}
		),
		country: data['filters']['possibleFilters']['locations'].map(
			(location: Record<string, string>) => {
				return {
					name: location['name'],
					key: location['slug'],
				} satisfies KununuFilterKeyword;
			}
		),
	};
}

export async function fetch_pagination(keywords: string[]): Promise<
	{
		num_pages: number,
	}
> {
	let url = kununu_search_url;
	keywords.forEach(
		keyword => {
			url += `&filterKeywords[]=${keyword}`
		}
	);
	const response = await fetch(url);
	const data = await response.json();
	return {
		num_pages: data['meta']['pagination']['totalPages'],
	};
}

export async function fetch_page(keywords: string[], page: number): Promise<Object> {
	let url = kununu_search_url;
	keywords.forEach(
		keyword => {
			url += `&filterKeywords[]=${keyword}`
		}
	);
	url += `&page=${page}`;
	const response = await fetch(url);
	return await response.json();
}

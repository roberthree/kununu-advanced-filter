import type { PageLoad } from './$types';

import { fetch_keywords } from '$lib/kununu';

export const load: PageLoad = async () => {
	return {
		kununu_filter_keywords: fetch_keywords(),
	};
};
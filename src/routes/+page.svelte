<script lang="ts">
	import { kununu_search_url, fetch_page, fetch_pagination } from '$lib/kununu';
	import { db, type KununuCompany } from "$lib/db";
	import { liveQuery } from "dexie";
	import { Label, Button, Select, Input, Checkbox, Spinner, Toast } from 'flowbite-svelte';
	import {  } from 'flowbite-svelte-icons';

	import KununuCompanyTable from '$lib/KununuCompanyTable.svelte';

	import type { PageData } from './$types';
	
	export let data: PageData;

	let page = 0;
	let num_pages = 0;

	let kununu_filter_keyword = {
		industry: 'it',
		company_size: '',
		country: '',
	}

	interface NumericFilter {
		key: keyof KununuCompany;
		name: string;
		min_value: number | undefined;
		max_value: number | undefined;
		sort_priority: number;
		sort_descending: boolean;
	}

	const numeric_filters: NumericFilter[] = [
		{
			key: 'num_reviews',
			name: 'Number of Reviews',
			min_value: undefined,
			max_value: undefined,
			sort_priority: 2,
			sort_descending: true,
		} satisfies NumericFilter,
		{
			key: 'kununu_score',
			name: 'Kununu Score',
			min_value: undefined,
			max_value: undefined,
			sort_priority: 1,
			sort_descending: true,
		} satisfies NumericFilter,
		{
			key: 'salary_satisfaction',
			name: 'Salary Satisfaction',
			min_value: undefined,
			max_value: undefined,
			sort_priority: 4,
			sort_descending: true,
		} satisfies NumericFilter,
		{
			key: 'recommendation_rate',
			name: 'Recommendation Rate',
			min_value: undefined,
			max_value: undefined,
			sort_priority: 3,
			sort_descending: true,
		} satisfies NumericFilter,
	]

	$: kununu_top_companies = liveQuery(
		() => {
			return db.kununu_top_companies
			.filter(
				kununu_company => numeric_filters.map(
					numeric_filter => {
						const value_min = numeric_filter.min_value ?? Number.MIN_VALUE
						const value_max = numeric_filter.max_value ?? Number.MAX_VALUE
						const value = kununu_company[numeric_filter.key]
						if (typeof(value) != 'number') {
							throw TypeError(`kununu_company[${numeric_filter.key}] = ${value} is not a number`);
						}
						return value_min <= value && value <= value_max
					}
				).every(Boolean)
			)
			.toArray()
		}
	);

	function sort_kununu_companies(kununu_companies: KununuCompany[]) {
		return kununu_companies.sort(
			(a: KununuCompany, b: KununuCompany) => {
				const comparisons = [...numeric_filters].sort(
					(a: NumericFilter, b: NumericFilter) => a.sort_priority - b.sort_priority
				).map(
					numeric_filter => (
						(a[numeric_filter.key] as number)
						- (b[numeric_filter.key] as number)
					) * (numeric_filter.sort_descending ? -1 : +1)
				)
				for (const comparison of comparisons) {
					if (comparison != 0) {
						return comparison
					}
				}
				return 0;
			}
		)
	}

	async function add_company_data(company_data: Record<string, any>) {
		const id = await db.kununu_top_companies.add({
			name: company_data["name"],
			verified: company_data["isVerified"],
			country_code: company_data["location"]["countryCode"],
			city: company_data["location"]["city"],
			num_reviews: company_data["totalReviews"],
			kununu_score: company_data["score"]["value"],
			salary_satisfaction: company_data["salarySatisfaction"],
			recommendation_rate: company_data["recommendationRate"],
			kununu_url: company_data["slug"],
		});
		console.log(`id = ${id}`);
	}

	let fetching_kununu_data = false;

	async function process_fetching_request(event: MouseEvent): Promise<void> {
		if (fetching_kununu_data) {
			fetching_kununu_data = false;
		} else {
			fetch_kununu_data();
		}
	}

	async function fetch_kununu_data(): Promise<void> {
		console.assert(!fetching_kununu_data);
		fetching_kununu_data = true;
		db.kununu_top_companies.clear();
		let keywords: string[] = [];
		for (const keyword of Object.values(kununu_filter_keyword)) {
			if (keyword !== '') {
				keywords.push(keyword);
			}
		}
		console.log(`keywords = ${keywords}`)
		const pagination = await fetch_pagination(keywords);
		console.log(pagination);
		num_pages = pagination.num_pages;
		// num_pages = 3;
		console.assert(window.indexedDB);
		for (page = 1; fetching_kununu_data && page <= num_pages; ++page) {
			const data = await fetch_page(keywords, page) as Record<string, any>;
			await data["data"].forEach(add_company_data);
		}
		fetching_kununu_data = false;
	}
</script>

<div class="flex flex-col space-y-4 p-4">
	<div class="flex flex-col space-y-4">
		<h1 class="inline-block text-2xl font-extrabold text-slate-900 tracking-tight">Advanced Filter for Kununu's Top Companies</h1>

		<p class="border shadow-lg rounded-lg p-4">
			<a href="https://www.kununu.com/" target="_blank" class="text-blue-600 hover:underline">Kununu</a>'s default <a href="https://www.kununu.com/de/beste-arbeitgeber" target="_blank" class="text-blue-600 hover:underline">search</a> for the current top companies based on predefined <a href="https://arbeitgeberportal.kununu.com/top-company-siegel-box/" target="_blank" class="text-blue-600 hover:underline">criteria</a> is quite limited.
			Sorting by a descending <a href="https://arbeitgeber-support.kununu.com/hc/de/articles/5140268998673-Der-kununu-Gesamt-Score-" target="_blank" class="text-blue-600 hover:underline">Kununu score</a> shows mostly companies with only a few reviews.
			These reviews are probably not representative and artificially boost a company's score.
			Furthermore, the number of reviews is correlated with the size of the company.
			Therefore it is quite difficult to scout for mid-sized companies with a high score.
			This tool fetches Kununu's Top Companies using their <a href={kununu_search_url} target="_blank" class="text-blue-600 hover:underline">RESTful JSON API</a> and provides an advanced filter and sort method.
		</p>
	</div>

	<div class="flex flex-row space-x-4">
		<div class="border shadow-lg rounded-lg p-4">
			<div class="flex flex-col space-y-2">
				{#await data.kununu_filter_keywords}
					<Spinner />
					Fetching Kununu keywords...
				{:then kununu_filter_keywords}
					<div class="flex flex-col space-y-1">
						<Label for="kununu_filter_industry">Industry</Label>
						<Select id="kununu_filter_industry" bind:value={kununu_filter_keyword.industry} bind:disabled={fetching_kununu_data} placeholder="" size="sm">
							<!-- <option selected value="">Include all</option> -->
							{#each kununu_filter_keywords.industry as { name, key }}
								<option value={key}>{name}</option>
							{/each}
						</Select>
					</div>

					<div class="flex flex-col space-y-1">
						<Label for="kununu_filter_company_size">Company size</Label>
						<Select id="kununu_filter_company_size" bind:value={kununu_filter_keyword.company_size} bind:disabled={fetching_kununu_data} placeholder="" size="sm">
							<option selected value="">Include all</option>
							{#each kununu_filter_keywords.company_size as { name, key }}
								<option value={key}>{name}</option>
							{/each}
						</Select>
					</div>

					<div class="flex flex-col space-y-1">
						<Label for="kununu_filter_country">Country</Label>
						<Select id="kununu_filter_country" bind:value={kununu_filter_keyword.country} bind:disabled={fetching_kununu_data} placeholder="" size="sm">
							<option selected value="">Include all</option>
							{#each kununu_filter_keywords.country as { name, key }}
								<option value={key}>{name}</option>
							{/each}
						</Select>
					</div>

					<Button class="w-80" on:click={process_fetching_request} bind:outline={fetching_kununu_data} size="sm">
						{#if fetching_kununu_data}
							<Spinner class="mr-3" size="4" color="white" />
							Fetching from Kununu ({page}/{num_pages})
						{:else}
							Clear data and fetch from Kununu
						{/if}
					</Button>
				{:catch name}
					Failed fetching Kununu keywords!
				{/await}
			</div>
		</div>

		<!-- flex flex-col justify-center items-start p-4 sm:p-8 mb-8 gap-4 border shadow-lg rounded-lg dark:bg-gray-800 dark:border-gray-700 -->

		<div class="border shadow-lg rounded-lg p-4">
			{#each numeric_filters as numeric_filter}
			<div>
				<h3>{numeric_filter.name}</h3>
				<div class="flex space-x-4">
					<div class="flex space-x-2">
						<Label class="label" for="{numeric_filter.key}_min">min</Label>
						<Input class="input min-w-16" name="{numeric_filter.key}_min" type="number" step="1" bind:value={numeric_filter.min_value} size="sm" />
						<Label class="label" for="{numeric_filter.key}_max">max</Label>
						<Input class="input min-w-16" name="{numeric_filter.key}_max" type="number" step="1" bind:value={numeric_filter.max_value} size="sm" />
					</div>
					<div class="flex space-x-2">
						<Select class="min-w-16" bind:value={numeric_filter.sort_priority} placeholder="" size="sm">
							{#each [1, 2, 3, 4] as sort_priority}
								<option value={sort_priority}>sort {sort_priority}.</option>
							{/each}
						</Select>
						<Checkbox id="scales" name="{numeric_filter.key}_descending" bind:checked={numeric_filter.sort_descending}>descending</Checkbox>
					</div>
				</div>
			</div>
			{/each}
		</div>
	</div>

	<div>
		{#if $kununu_top_companies}
			<KununuCompanyTable kununu_companies={sort_kununu_companies($kununu_top_companies)} />
		{/if}
	</div>
</div>

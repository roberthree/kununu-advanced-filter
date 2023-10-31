<script lang="ts">
	import type { KununuCompany } from "$lib/db";

	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { BadgeCheckSolid } from 'flowbite-svelte-icons';

	const head = [
		'Name',
		'City',
		'Reviews',
		'Score',
		'Salary',
		'Recommended'
	]

	export let kununu_companies: KununuCompany[] = [];
</script>

<Table shadow>
	<TableHead>
		<!-- <tr> -->
			{#each head as heading}
				<TableHeadCell class="border">{heading}</TableHeadCell>
			{/each}
		<!-- </tr> -->
	</TableHead>
	<TableBody>
		{#each kununu_companies as kununu_company}
			<TableBodyRow>
				<TableBodyCell class="inline-flex space-x-2">
					<a href={`https://kununu.com/${kununu_company.country_code}/${kununu_company.kununu_url}`} target="_blank">{kununu_company.name}</a>
					{#if kununu_company.verified}
						<BadgeCheckSolid size="xs" color="#008000" />
					{/if}
				</TableBodyCell>
				<TableBodyCell>{`${kununu_company.city} (${kununu_company.country_code.toUpperCase()})`}</TableBodyCell>
				<TableBodyCell>{kununu_company.num_reviews}</TableBodyCell>
				<TableBodyCell>{kununu_company.kununu_score}</TableBodyCell>
				<TableBodyCell>{kununu_company.salary_satisfaction}</TableBodyCell>
				<TableBodyCell>{kununu_company.recommendation_rate}</TableBodyCell>
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>

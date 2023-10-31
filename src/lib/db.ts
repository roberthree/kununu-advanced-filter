import Dexie, { type Table } from 'dexie';

export interface KununuCompany {
	id?: number;
	name: string;
	verified: boolean;
	num_reviews: number;
	kununu_score: number;
	salary_satisfaction: number;
	recommendation_rate: number;
	kununu_url: string;
	country_code: string;
	city: string;
}

export class MySubClassedDexie extends Dexie {
	// 'friends' is added by dexie when declaring the stores()
	// We just tell the typing system this is the case
	kununu_top_companies!: Table<KununuCompany>; 

	constructor() {
		super('myDatabase');
		this.version(1).stores({
			kununu_top_companies: [
				'++id',
				'name',
				'verified',
				'num_reviews',
				'kununu_score',
				'salary_satisfaction',
				'recommendation_rate',
				'kununu_url',
				'country_code',
				'city',
			].join(',')
			// Primary key and indexed props
		});
	}
}

export const db = new MySubClassedDexie();

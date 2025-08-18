// src/routes/demos/+page.server.ts
import { createClient } from '$lib/prismicio';
import { demos } from '$lib/data/demos';

export async function load({ fetch, cookies }) {
	//const client = createClient({ fetch, cookies });

	//const docs = await client.getAllByType('demo', { pageSize: 100, orderings: [{ field: 'my.demo.title' }] });

	return { demos };
};
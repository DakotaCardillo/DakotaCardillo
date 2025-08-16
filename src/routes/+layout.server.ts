export const prerender = 'auto';

import { createClient } from '$lib/prismicio';

export async function load({ fetch, cookies }) {
	const client = createClient({ fetch, cookies });

	const settings = await client.getSingle('settings');

	const navigation = await client.getSingle('navigation');

	return {
		settings,
		navigation,
	};
}
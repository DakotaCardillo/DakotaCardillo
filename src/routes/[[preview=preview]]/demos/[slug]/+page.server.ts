import { createClient } from '$lib/prismicio';
import { asText } from '@prismicio/client';
import { demos } from '$lib/data/demos';

export async function load({ fetch, cookies, params }) {
	const client = createClient({ fetch, cookies });

	const page = await client.getByUID('page', 'home');

    const demo = demos.find((d) => d.slug === params.slug);

	return {
		page,
		title: asText(page.data.title),
		meta_description: page.data.meta_description,
		meta_title: page.data.meta_title,
		meta_image: page.data.meta_image.url,
		demo
	};
}
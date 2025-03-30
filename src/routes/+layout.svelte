<script>
	import '../app.css';

	// Supports weights 100-900
	import '@fontsource-variable/outfit';
	import '@fontsource-variable/kode-mono';
	import '@fontsource/commit-mono';
	import '@fontsource-variable/source-code-pro';

	import { PrismicPreview } from '@prismicio/svelte/kit';
	import { page } from '$app/stores';
	import { repositoryName } from '$lib/prismicio';
</script>

<svelte:head>
	<title>{$page.data.title}</title>
	{#if $page.data.meta_description}
		<meta name="description" content={$page.data.meta_description} />
	{/if}
	{#if $page.data.meta_title}
		<meta name="og:title" content={$page.data.meta_title} />
	{/if}
	{#if $page.data.meta_image}
		<meta name="og:image" content={$page.data.meta_image} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>

<main>
	<slot />
</main>
<PrismicPreview {repositoryName} />

<script>
	import '../app.css';

	// Supports weights 100-900
	import '@fontsource-variable/outfit';
	import '@fontsource-variable/kode-mono';
	import '@fontsource/commit-mono';
	import '@fontsource-variable/source-code-pro';
	import '@fontsource-variable/inter';
	import '@fontsource/poppins';

	import { PrismicPreview } from '@prismicio/svelte/kit';
	import { page } from '$app/stores';
	import { repositoryName } from '$lib/prismicio';

	import Footer from '$lib/components/Footer.svelte';

	export let data;
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

<main class="flex-grow">
	<!-- +layout.svelte (near the top of <body>) -->
	<svg aria-hidden="true" class="absolute w-0 h-0">
		<defs>
		<!-- Option A: turbulence-based displacement (no external image) -->
		<!-- <filter id="displacementFilter" x="0%" y="0%" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" seed="3" result="noise" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
		</filter> -->
	
		<!-- Option B: use an external map image (keep it same-origin, e.g. /static/glass.png) -->
		<filter id="displacementFromImage" x="0%" y="0%" width="100%" height="100%">
			<feImage href="/glass.png" preserveAspectRatio="none" result="map" />
			<feDisplacementMap in="SourceGraphic" in2="map" scale="200" xChannelSelector="R" yChannelSelector="G" />
		</filter>
		</defs>
	</svg>

	<slot />
</main>
<Footer settings={data.settings} />

<PrismicPreview {repositoryName} />

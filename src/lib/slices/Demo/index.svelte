<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { Canvas } from '@threlte/core';
	import Index from '$lib/demos/ShellTexturing/index.svelte';

	export let slice: Content.DemoSlice;

	let demoComponent = Index;
	if (slice.primary.demo === 'Shell Texturing') {
		demoComponent = Index;
	}
</script>

<section
	data-slice-type={slice.slice_type}
	data-slice-variation={slice.variation}
	class="w-screen h-screen"
>
	{#if demoComponent}
		<Canvas>
			<svelte:component this={demoComponent} />
		</Canvas>
	{/if}
</section>

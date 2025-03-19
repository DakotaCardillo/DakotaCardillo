<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { Canvas } from '@threlte/core';
	import shellTexturing from '$lib/demos/ShellTexturing.svelte';

	export let slice: Content.DemoSlice;

	let demoComponent = shellTexturing;
	if (slice.primary.demo === 'Shell Texturing') {
		demoComponent = shellTexturing;
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

<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { Canvas } from '@threlte/core';
	import { default as ShellTexturing } from '$lib/demos/ShellTexturing/index.svelte';
	import { default as WaterSimulation } from '$lib/demos/WaterSimulationn/index.svelte';

	export let slice: Content.DemoSlice;

	let demoComponent = ShellTexturing;
	if (slice.primary.demo === 'Shell Texturing') {
		demoComponent = ShellTexturing;
	} else if (slice.primary.demo === 'Water Simulation') {
		demoComponent = WaterSimulation;
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

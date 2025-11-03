<script lang="ts">
	const { demo } = $props();
	import type { Content } from '@prismicio/client';
	import { default as ShellTexturing } from '$lib/demos/ShellTexturing/index.svelte';
	import { default as WaterSimulation } from '$lib/demos/WaterSimulation/index.svelte';
	import { default as BlinnPhong } from '$lib/demos/BlinnPhong/index.svelte';

	// Hardcoded to water simulation for now
	const DemoComponent = WaterSimulation;
</script>

<section class="w-full h-full">
	<div class="w-full h-full bg-black">
		{#if DemoComponent}
			<DemoComponent />
		{/if}
	</div>
</section>

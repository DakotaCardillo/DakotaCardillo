<script lang="ts">
	const { demo } = $props();
	import type { Content } from '@prismicio/client';
	import { default as ShellTexturing } from '$lib/demos/ShellTexturing/index.svelte';
	import { default as WaterSimulation } from '$lib/demos/WaterSimulation/index.svelte';
	import { default as BlinnPhong } from '$lib/demos/BlinnPhong/index.svelte';

	let DemoComponent: typeof WaterSimulation | typeof ShellTexturing | typeof BlinnPhong | undefined = undefined;
	if (demo.slug === 'shell-texturing') DemoComponent = ShellTexturing;
	if (demo.slug === 'ocean-simulation') DemoComponent = WaterSimulation;
	if (demo.slug === 'blinn-phong') DemoComponent = BlinnPhong;

	// Hardcoded to water simulation for now
</script>

<section class="w-full h-full">
	<div class="w-full h-full bg-black">
		{#if DemoComponent}
			<DemoComponent />
		{/if}
	</div>
</section>

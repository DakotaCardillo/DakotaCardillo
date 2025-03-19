<script lang="ts">
	import GrassLayer from '$lib/demos/GrassLayer.svelte';

	let layers = 100;
</script>

{#each Array(layers) as _, i (i)}
	<GrassLayer yDelta={i * 0.01} height={i * 0.01} />
{/each}
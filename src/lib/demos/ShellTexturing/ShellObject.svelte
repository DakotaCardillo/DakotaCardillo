<script lang="ts">
	import { setContext } from 'svelte';

	export let shellComponent;
	export let numShells = 10;
	export let shellDistance = 0.1;
	export let shellOpacity = 1.0;
	export let globalPosition = { x: 0, y: 0, z: 0};

	export let getShellProps = (index) => ({});

	setContext('shellConfig', { numShells, shellDistance, shellOpacity, globalPosition });

</script>

{#each Array(numShells) as _, i (i)}
	<svelte:component this={shellComponent} index={i} {...getShellProps(i)} />
{/each}
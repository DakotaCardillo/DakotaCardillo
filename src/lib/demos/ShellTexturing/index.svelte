<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { Pane } from 'svelte-tweakpane-ui';

</script>

<div class="w-full h-full">
	<Pane
		position="fixed"
		title="Shell Texturing"
	/>

	<Canvas>
		<Scene />
	</Canvas>
</div>

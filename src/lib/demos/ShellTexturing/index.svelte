<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { Pane } from 'svelte-tweakpane-ui';

</script>

<div class="pointer-events-auto relative w-full h-full">
	<div class="absolute top-0 left-0 ml-4 mt-16 z-10">
		<Pane
			position="inline"
			title="Shell Texturing"
		/>
	</div>

	<Canvas>
		<Scene />
	</Canvas>
</div>

<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { Pane } from 'svelte-tweakpane-ui';

</script>

<div class="w-full h-full">
	<div class="absolute top-10 left-10 m-4 z-10">
		<Pane
			position="inline"
			title="Shell Texturing"
		/>
	</div>

	<Canvas>
		<Scene />
	</Canvas>
</div>

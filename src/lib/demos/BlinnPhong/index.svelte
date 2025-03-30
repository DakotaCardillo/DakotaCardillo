<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { Pane, Checkbox } from 'svelte-tweakpane-ui';

	let ambient = $state(true);
	let diffuse = $state(true);
	let specular = $state(true);
</script>

<div class="relative w-full h-full">
	<div class="absolute top-0 left-0 m-4 z-10">
		<Pane
			position="inline"
			title="Blinn-Phong"
		>
			<Checkbox
				label="Ambient"
				bind:value={ambient}
			/>
			<Checkbox
				label="Diffuse"
				bind:value={diffuse}
			/>
			<Checkbox
				label="Specular"
				bind:value={specular}
			/>
		</Pane>
	</div>
	<Canvas>
		<Scene {ambient} {diffuse} {specular} />
	</Canvas>
</div>

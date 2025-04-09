<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Background from '$lib/slices/Hero/Background.svelte';
	import { WebGPURenderer } from 'three/webgpu';

	export let useWebGPU : boolean;

</script>

{#if useWebGPU}
	<Canvas
		createRenderer={(canvas) => {
    	return new WebGPURenderer({
				canvas,
				antialias: true,
				forceWebGL: false
			})
  	}}
		autoRender={false}
	>
		<Background {useWebGPU}/>
	</Canvas>
{:else}
	<Canvas autoRender={false}>
		<Background {useWebGPU}/>
	</Canvas>
{/if}

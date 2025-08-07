<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Background from '$lib/slices/Hero/Background.svelte';
	import * as THREE from 'three/webgpu';

	const { useWebGPU } = $props();

</script>

{#if useWebGPU}
	<Canvas
		createRenderer={(canvas) => {
    	return new THREE.WebGPURenderer({
				canvas,
				antialias: true,
				forceWebGL: false
			})
  	}}
		autoRender={false}
	>
		<Background {useWebGPU} />
	</Canvas>
	<!--{:else}-->
	<!--	<Canvas autoRender={false}>-->
	<!--		<Background {useWebGPU} />-->
	<!--	</Canvas>-->
{/if}

<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Shapes from './Shapes.svelte';
	import Background from '$lib/slices/Hero/Background.svelte';
</script>

<Canvas autoRender={false}>
	<Background />
</Canvas>
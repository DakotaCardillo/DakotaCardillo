<script lang="ts">
	import { T } from '@threlte/core';
	import { Environment, OrbitControls } from '@threlte/extras';
	import Grass from '$lib/demos/Grass.svelte';

</script>

<T.PerspectiveCamera
	position={[0, 20, 50]}
	fov={30}
	near={0.1}
	far={1000}
	makeDefault
>
	<OrbitControls target={[0, 0, 0]} />
</T.PerspectiveCamera>

<Environment url="/smallroom.hdr" />

<Grass />
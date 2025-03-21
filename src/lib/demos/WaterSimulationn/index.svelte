<script lang="ts">
	import { T } from '@threlte/core';
	import { Environment, OrbitControls } from '@threlte/extras';
	import Water from '$lib/demos/WaterSimulationn/Water.svelte';
</script>

<T.PerspectiveCamera
	position={[4, 7, 12]}
	fov={30}
	near={0.1}
	far={1000}
	makeDefault
>
	<OrbitControls target={[0, 0, 0]} />
</T.PerspectiveCamera>

<Environment url="/smallroom.hdr" />

<T.PointLight position={[10, 10, 10]} intensity={0} />

<T.GridHelper size={100} divisions={10} />

<Water />
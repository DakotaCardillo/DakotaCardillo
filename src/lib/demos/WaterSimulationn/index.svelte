<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { Sky, OrbitControls } from '@threlte/extras';
	import Water from '$lib/demos/WaterSimulationn/Water.svelte';

	const { scene } = useThrelte();
	scene.background = new THREE.Color(0xff0000);

	const { renderer } = useThrelte();
	renderer.setClearColor(0xff0000, 0);
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

<!--<Environment url="/smallroom.hdr" isBackground={true} />-->

<Sky
	turbidity={14.35}
	rayleigh={3.0}
	azimuth={100.0}
	elevation={0.5}
	mieCoefficient={0.005}
	mieDirectionalG={0.7}
	exposure={0.37}
/>

<T.PointLight position={[10, 10, 10]} intensity={0} />

<T.GridHelper size={100} divisions={10} />

<Water />
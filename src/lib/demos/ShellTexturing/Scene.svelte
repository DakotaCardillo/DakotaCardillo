<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Environment, OrbitControls } from '@threlte/extras';
	import ShellObject from '$lib/demos/ShellTexturing/ShellObject.svelte';
	import GrassShell from '$lib/demos/ShellTexturing/GrassShell.svelte';
	import * as THREE from 'three';

	//const { scene } = useThrelte();
	//scene.background = new THREE.Color(0xff0000);

	const { renderer } = useThrelte();
	renderer.setClearColor(0x222222, 1);

	const grassPosition = { x: 0, y: 0.5, z: 0 };
</script>

<T.PerspectiveCamera
	position={[0, 7, 10]}
	fov={30}
	near={0.1}
	far={1000}
	makeDefault
>
	<OrbitControls target={[0, 0, 0]} />
</T.PerspectiveCamera>

<Environment url="/smallroom.hdr" />

<T.GridHelper size={100} divisions={10} />

<ShellObject
	shellComponent={GrassShell}
	numShells={100}
	shellDistance={0.003}
	shellOpacity={1.0}
	globalPosition={grassPosition}
	getShellProps={(i) =>({
		width: 5,
		length: 5
	})}
/>
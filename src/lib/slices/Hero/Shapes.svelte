<script lang="ts">
	import { T as Threlte } from '@threlte/core';
	import { ContactShadows, Environment, interactivity, transitions } from '@threlte/extras';
	import * as THREE from 'three';
	import Geometry from '$lib/slices/Hero/Geometry.svelte';

	interactivity();
	transitions();
</script>

<Threlte.PerspectiveCamera
	makeDefault
	position={[0, 0, 25]}
	aspect={1}
	fov={30}
	near={0.1}
	far={1000}
/>

<Environment url="/smallroom.hdr" />

<ContactShadows
	position={[0, -3.5, 0]}
	opacity={0.65}
	scale={40}
	blur={1}
	far={9}
/>

<Geometry
	position={[0, 0, 0]}
	rate={0.3}
	geometry={new THREE.IcosahedronGeometry(3)}
/>


<Geometry
	position={[2, -1.5, 8]}
	rate={0.4}
	geometry={new THREE.CapsuleGeometry(0.5, 1.6, 2, 16)}
/>

<Geometry
	position={[-1.6, -1.5, 10]}
	rate={0.5}
	geometry={new THREE.TorusGeometry(0.6, 0.25, 16, 32)}
/>

<Geometry
	position={[-2.8, 4, -8]}
	rate={0.6}
	geometry={new THREE.DodecahedronGeometry(1.5)}
/>

<Geometry
	position={[3.2, 3.2, -8]}
	rate={0.7}
	geometry={new THREE.OctahedronGeometry(1.5)}
/>
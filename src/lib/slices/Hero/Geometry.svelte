<script lang="ts">
	import { T as Threlte } from '@threlte/core';
	import { Float } from '@threlte/extras';
	import * as THREE from 'three';
	import gsap from 'gsap';

	export let position: [number, number, number] = [0, 0, 0];
	export let geometry: THREE.BufferGeometry = new THREE.IcosahedronGeometry(3);
	export let rate = 0.5;

	const materials = [
		{ color: 0x2ecc71, roughness: 0, transparent: false },
		{ color: 0xf1c40f, roughness: 0.4, transparent: false },
		{ color: 0xe74c3c, roughness: 0.1, transparent: false },
		{ color: 0x8e44ad, roughness: 0.1, transparent: false },
		{ color: 0x1abc9c, roughness: 0.1, transparent: false },
		{ color: 0x2980b9, roughness: 0, metalness: 0.5, transparent: false },
		{ color: 0x2c3e50, roughness: 0.1, metalness: 0.5, transparent: false }
	];

	function getRandomMaterial() {
		return new THREE.MeshStandardMaterial(gsap.utils.random(materials));
	}

	function handleClick(event: MouseEvent) {
		if ('object' in event && event.object instanceof THREE.Mesh) {
			event.object.material = getRandomMaterial();
		}
	}
</script>

<Threlte.Group {position}>
	<Float
		speed={5 * rate}
		rotationSpeed={5 * rate}
		rotationIntensity={6 * rate}
		floatIntensity={5 * rate}
	>
		<Threlte.Mesh {geometry} material={getRandomMaterial()} onclick={handleClick}>
		</Threlte.Mesh>

	</Float>
</Threlte.Group>



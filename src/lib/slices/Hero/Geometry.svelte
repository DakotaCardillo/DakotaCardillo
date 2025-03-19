<script lang="ts">
	import { isInstanceOf, T as Threlte } from '@threlte/core';
	import { Float, createTransition } from '@threlte/extras';
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { elasticOut } from 'svelte/easing';

	export let position: [number, number, number] = [0, 0, 0];
	export let geometry: THREE.BufferGeometry = new THREE.IcosahedronGeometry(3);
	export let rate = 0.5;

	let visible = false;

	const materials = [
		{ color: 0x2ecc71, roughness: 0 },
		{ color: 0xf1c40f, roughness: 0.4 },
		{ color: 0xe74c3c, roughness: 0.1 },
		{ color: 0x8e44ad, roughness: 0.1 },
		{ color: 0x1abc9c, roughness: 0.1 },
		{ color: 0x2980b9, roughness: 0, metalness: 0.5 },
		{ color: 0x2c3e50, roughness: 0.1, metalness: 0.5 }
	];

	function getRandomMaterial() {
		return new THREE.MeshStandardMaterial(gsap.utils.random(materials));
	}

	function handleClick(event: MouseEvent) {
		if ('object' in event && event.object instanceof THREE.Mesh) {
			gsap.to(event.object.rotation, {
				x: `+=${gsap.utils.random(0, 3)}`,
				y: `+=${gsap.utils.random(0, 3)}`,
				z: `+=${gsap.utils.random(0, 3)}`,
				duration: 1.3,
				ease: 'elastic.out(1, 0.3)',
				yoyo: true
			});
			event.object.material = getRandomMaterial();
		}
	}

	const bounce = createTransition((ref) => {
		if (!isInstanceOf(ref, 'Object3D')) return;
		return {
			tick(t) {
				if (t > 0.5) visible = true;
				ref.scale.setScalar(t);
			},
			easing: elasticOut,
			duration: gsap.utils.random(800, 1200),
			delay: gsap.utils.random(0, 500)
		};
	});
</script>

<Threlte.Group {position}>
	<Float
		speed={5 * rate}
		rotationSpeed={5 * rate}
		rotationIntensity={6 * rate}
		floatIntensity={5 * rate}
	>
		<Threlte.Mesh {visible} {geometry} in={bounce} material={getRandomMaterial()} onclick={handleClick}>
		</Threlte.Mesh>
	</Float>
</Threlte.Group>



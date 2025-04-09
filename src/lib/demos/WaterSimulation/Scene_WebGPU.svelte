<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useRenderer, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three/webgpu';
	import { DoubleSide, MathUtils } from 'three';
	import { Environment, Gizmo, useGltf } from '@threlte/extras';
	import * as TSL from 'three/tsl';
	import { WebGPURenderer } from 'three/webgpu';

	const {
		waveCount,
		fragmentWaveCount,
		waveType,
		waveAlgorithm,
		wireframe
	} = $props();
	// export let waveCount = 0;
	// export let fragmentWaveCount = 40;
	// export let waveType = 0;
	// export let waveAlgorithm = 0;
	// export let wireframe = false;

	const { renderer } = useRenderer();
	const gpuRenderer = renderer as WebGPURenderer;
	console.log(gpuRenderer);

	const { scene } = useThrelte();
	scene.background = new THREE.Color(0x000000);

	// import waterShader from '../../shaders/water.wgsl';

	import { OrbitControls } from '@threlte/extras';
	import { SimplexNoise } from 'three/examples/jsm/Addons.js';

	let environmentUrl = 'assets/autumn_field_puresky_4k.exr';

	const renderWidth = 2048;
	const renderHeight = 2048;
	// const renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, {
	// 	minFilter: THREE.LinearFilter,
	// 	magFilter: THREE.LinearFilter,
	// 	format: THREE.RGBAFormat,
	// 	type: THREE.FloatType
	// });

	let waterGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterGeometry.rotateX(MathUtils.degToRad(-90));
	let waterOutputGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterOutputGeometry.rotateX(MathUtils.degToRad(-90));
	let underwaterGeometry = new THREE.BoxGeometry(20, 20, 20, 100, 100, 100);

	let sandGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	sandGeometry.rotateX(MathUtils.degToRad(-90));

	let flatness = 5.0;
	const positions = sandGeometry.getAttribute('position');
	const noise = new SimplexNoise();
	$effect(() => {
		for (let i = 0; i < positions.count; i += 1) {
			const x = positions.getX(i) / flatness;
			const z = positions.getZ(i) / flatness;
			positions.setY(i, noise.noise(x, z));
		}
		positions.needsUpdate = true;
		// needed for lighting
		sandGeometry.computeVertexNormals();
	});

	// Needed for wireframe shader
	function setupAttributes(geometry: THREE.BufferGeometry) {
		const vectors = [
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(0, 1, 0),
			new THREE.Vector3(0, 0, 1)
		];

		const position = geometry.attributes.position;
		const centers = new Float32Array(position.count * 3);

		for (let i = 0, l = position.count; i < l; i++) {
			vectors[i % 3].toArray(centers, i * 3);
		}
		geometry.setAttribute('center', new THREE.BufferAttribute(centers, 3));
	}

	setupAttributes(waterGeometry);
	setupAttributes(underwaterGeometry);

	let camera: THREE.PerspectiveCamera;
	let cameraPosition = new THREE.Vector3(0, 25, 30);

	const waterMaterial = new THREE.MeshBasicNodeMaterial( {color: 'blue'});

	const geo = new THREE.SphereGeometry(10);
	const water = new THREE.Mesh(geo, waterMaterial);
</script>

<T.PerspectiveCamera
	bind:ref={camera}
	position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
	fov={30}
	near={0.1}
	far={1000}
	makeDefault
>
	<OrbitControls target={[0, 0, 0]}>
		<!--		<Gizmo />-->
	</OrbitControls>
</T.PerspectiveCamera>

<!-- WATER -->
<!--<T.Mesh-->
<!--	scale={[1, 1, 1]}-->
<!--	position={[0, 10, 20]}-->
<!--	material={waterMaterial}-->
<!--	geometry={waterGeometry}-->
<!--&gt;-->
<!--</T.Mesh>-->

{water}

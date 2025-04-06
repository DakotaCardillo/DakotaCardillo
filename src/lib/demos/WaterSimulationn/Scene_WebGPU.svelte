<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { DoubleSide, MathUtils } from 'three';
	import { Environment, Gizmo, useGltf } from '@threlte/extras';


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

	const { scene, renderer } = useThrelte();
	scene.background = new THREE.Color(0xff0000);

	import waterShader from '../../shaders/waterVertex.wgsl';

	import { OrbitControls } from '@threlte/extras';
	import { SimplexNoise } from 'three/examples/jsm/Addons.js';

	let environmentUrl = 'assets/autumn_field_puresky_4k.exr';

	const renderWidth = 2048;
	const renderHeight = 2048;
	const renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType
	});

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
	let sunPosition = new THREE.Vector3(16, 10, 11);

	let newEuler = new THREE.Euler();
	const up = new THREE.Vector3(0, 1, 0);

	// Set your orbit center and parameters.
	const orbitCenter = new THREE.Vector3(0, 10, 0);
	const orbitRadius = 20;
	let angle = 0;
	const angularSpeed = 0.05;

	const uniforms = {
		uTime: { value: 0 },
		uCameraPosition: { value: cameraPosition },
		uLightPosition: { value: sunPosition },
		uLightColor: { value: new THREE.Vector3(1, 0.7, 0.5) },
		uLightIntensity: { value: 500.0 },
		uDiffuseColor: { value: new THREE.Vector3(0.0, 0.5, 1.0) },
		uAmbientColor: { value: new THREE.Vector3(0.04, 0.04, 0.04) },
		uSpecularColor: { value: new THREE.Vector3(1, 1, 1) },
		uShininess: { value: 200.0 },
		uSkybox: { value: scene.environment },
		uWaveAlgorithm: { value: waveAlgorithm },
		uNumWaves: { value: waveCount },
		uNumVertexWaves: { value: waveCount },
		uNumFragmentWaves: { value: fragmentWaveCount },
		uWaveType: { value: waveType },
		uWaterTextureMap: { value: renderTarget.texture }
	};

	const defines = {
		SUM_OF_SINES: `1`
	};

	let waterMaterial = new THREE.RawShaderMaterial({
		uniforms: uniforms,
		vertexShader: waterShader,
		fragmentShader: waterShader
	});

	useTask((delta) => {
		// Render the offscreen scene to the render target.

		uniforms.uTime.value += delta;
		uniforms.uWaveAlgorithm.value = waveAlgorithm;
		uniforms.uWaveType.value = waveType;
		uniforms.uNumWaves.value = waveCount;
		uniforms.uNumVertexWaves.value = waveCount;
		uniforms.uNumFragmentWaves.value = fragmentWaveCount;
		uniforms.uSkybox.value = scene.environment;

		// renderer.setRenderTarget(renderTarget);
		// renderer.render(offscreenScene, orthoCamera);
		// renderer.setRenderTarget(null);
		angle += angularSpeed * delta;
		angle = angle;
		const x = orbitCenter.x + orbitRadius * Math.cos(angle);
		const z = orbitCenter.z + orbitRadius * Math.sin(angle);

		const matrix = new THREE.Matrix4().lookAt(sunPosition, new THREE.Vector3(0), up);
		newEuler.setFromRotationMatrix(matrix);
		newEuler = newEuler;

		if (camera) {
			cameraPosition.set(camera.position.x, camera.position.y, camera.position.z);
			cameraPosition = cameraPosition;
			uniforms.uCameraPosition.value = cameraPosition;
		}
	});
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
<T.Mesh
	scale={[1, 1, 1]}
	position={[0, 10, 20]}
	material={waterMaterial}
	geometry={waterGeometry}
>
</T.Mesh>

<!-- SUN -->
<T.Mesh
	geometry={new THREE.SphereGeometry(1)}
	material={new THREE.MeshBasicMaterial({color: 'red'})}
	scale={[1, 1, 1]}
	position={[sunPosition.x, sunPosition.y, sunPosition.z]}
>
</T.Mesh>

<!-- SUN DIR -->
<T.Mesh
	material={new THREE.MeshBasicMaterial({color: 'yellow'})}
	position={[sunPosition.x, sunPosition.y, sunPosition.z]}
	rotation={[newEuler.x, newEuler.y, newEuler.z]}
>
	<T.CylinderGeometry
		args={[0.01, 0.01, 8, 32]}
		oncreate={(geom) => {
      // Shift the geometry upward so the bottom is at (0,0,0)
      geom.translate(0, 8 / 2, 0);
      geom.rotateX(-Math.PI / 2);
    }}
	/>
</T.Mesh>


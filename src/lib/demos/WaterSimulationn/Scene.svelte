<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { DoubleSide, MathUtils } from 'three';

	export let waveCount = 0;
	export let fragmentWaveCount = 40;
	export let waveType = 0;
	export let waveAlgorithm = 0;
	export let wireframe = false;

	const { scene } = useThrelte();
	scene.background = new THREE.Color(0xff0000);

	const { renderer } = useThrelte();
	console.log(renderer.outputColorSpace);
	renderer.setClearColor(0xff0000, 1);

	import utilsShader from '../../shaders/utils.glsl';
	import vertexShaderMain from '../../shaders/water.vert';
	import fragmentShaderMain from '../../shaders/water.frag';
	import basicVertexShader from '../../shaders/basic.vert';
	import basicFragmentShader from '../../shaders/basic.frag';
	import normalFragmentShader from '../../shaders/normal.frag';
	import normalVertexShader from '../../shaders/normal.vert';
	import halfLambertFragmentShader from '../../shaders/halfLambert.frag';
	import lambertFragmentShader from '../../shaders/lambert.frag';
	import phongFragmentShader from '../../shaders/phong.frag';
	import wireframeShader from '../../shaders/wireframe.frag';

	import { OrbitControls, Sky } from '@threlte/extras';

	const waterVertexShader = `${utilsShader}\n${vertexShaderMain}`;
	const waterFragmentShader = `${utilsShader}\n${fragmentShaderMain}`;

	let waterGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterGeometry.rotateX(MathUtils.degToRad(-90));

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
		console.log(centers);
	}

	setupAttributes(waterGeometry);
	//console.log(waterGeometry.attributes);

	let camera: THREE.PerspectiveCamera;
	let cameraPosition = new THREE.Vector3(0, 25, 30);
	let sunPosition = new THREE.Vector3(15, 13, 0);

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
		uWaveAlgorithm: { value: waveAlgorithm },
		uNumWaves: { value: waveCount },
		uNumVertexWaves: { value: waveCount },
		uNumFragmentWaves: { value: fragmentWaveCount },
		uWaveType: { value: waveType }
	};

	const defines = {
		SUM_OF_SINES: `1`
	};

	let waterMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: waterVertexShader,
		fragmentShader: waterFragmentShader,
		defines: defines
	});

	let wireframeMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: waterVertexShader,
		fragmentShader: wireframeShader,
		defines: defines,
		side: THREE.DoubleSide,
		alphaToCoverage: true
	});

	useTask((delta) => {
		uniforms.uTime.value += delta;
		uniforms.uWaveAlgorithm.value = waveAlgorithm;
		uniforms.uWaveType.value = waveType;
		uniforms.uNumWaves.value = waveCount;
		uniforms.uNumVertexWaves.value = waveCount;
		uniforms.uNumFragmentWaves.value = fragmentWaveCount;

		angle += angularSpeed * delta;
		const x = orbitCenter.x + orbitRadius * Math.cos(angle);
		const z = orbitCenter.z + orbitRadius * Math.sin(angle);

		sunPosition.set(x, sunPosition.y, z);
		sunPosition = sunPosition;

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

<T.PerspectiveCamera
	bind:ref={camera}
	position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
	fov={30}
	near={0.1}
	far={1000}
	makeDefault
>
	<OrbitControls target={[0, 0, 0]} />
</T.PerspectiveCamera>

<!-- WATER -->
<T.Mesh
	scale={[1, 1, 1]}
	position={[0, 0, 0]}
	material={wireframe ? wireframeMaterial : waterMaterial}
	geometry={waterGeometry}
>
	<!--	<T.PlaneGeometry-->
	<!--		args={[10, 10, 1000, 1000]}-->
	<!--		oncreate={(geom) => {-->
	<!--			geom.rotateX(MathUtils.degToRad(-90));-->
	<!--		}}-->
	<!--	/>-->
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

<T.Mesh
	geometry={new THREE.TorusGeometry(1)}
	scale={[1, 1, 1]}
	position={[0, 5, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={phongFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.IcosahedronGeometry(1)}
	scale={[1, 1, 1]}
	position={[3, 5, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={phongFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.DodecahedronGeometry(1)}
	scale={[1, 1, 1]}
	position={[-3, 5, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={phongFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>
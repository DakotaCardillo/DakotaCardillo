<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { MathUtils } from 'three';

	const { renderer } = useThrelte();
	renderer.setClearColor(0x222222, 1);

	export let ambient = true;
	export let diffuse = true;
	export let specular = true;


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
	import { OrbitControls } from '@threlte/extras';

	const vertexShader = `${utilsShader}\n${vertexShaderMain}`;
	const fragmentShader = `${utilsShader}\n${fragmentShaderMain}`;

	let camera: THREE.PerspectiveCamera;

	let cameraPosition = new THREE.Vector3(13, 25, 12);

	let sunPosition = new THREE.Vector3(10, 7, 0);

	let newEuler = new THREE.Euler();
	const up = new THREE.Vector3(0, 1, 0);

	// Set your orbit center and parameters.
	const orbitCenter = new THREE.Vector3(0, 10, 0);
	const orbitRadius = 5;
	let angle = 0;
	const angularSpeed = 0.05;

	const uniforms = {
		uTime: { value: 0 },
		uCameraPosition: { value: cameraPosition },
		uLightPosition: { value: sunPosition },
		uLightColor: { value: new THREE.Vector3(1, 0.7, 0.5) },
		uLightIntensity: { value: 40.0 },
		uDiffuseColor: { value: new THREE.Vector3(0.1, 0.4, 1.0) },
		uAmbientColor: { value: new THREE.Vector3(0.1, 0.1, 0.05) },
		uSpecularColor: { value: new THREE.Vector3(1, 1, 1) },
		uShininess: { value: 16.0 },
		uUseAmbient: { value: true },
		uUseDiffuse: { value: true },
		uUseSpecular: { value: true }
	};

	useTask((delta) => {
		uniforms.uTime.value += delta;
		uniforms.uUseAmbient.value = ambient;
		uniforms.uUseDiffuse.value = diffuse;
		uniforms.uUseSpecular.value = specular;

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

<T.GridHelper size={100} divisions={10} />

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

<T.DirectionalLight
	position={[sunPosition.x, sunPosition.y, sunPosition.z]}
	rotation={[newEuler.x, newEuler.y, newEuler.z]}
	color={[1, 0.7, 0.5]}
	intensity={40.0}
>

</T.DirectionalLight>

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
	geometry={new THREE.SphereGeometry(1)}
	scale={[1, 1, 1]}
	position={[0, 0, 3]}
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
	position={[0, 0, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={phongFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.BoxGeometry(1)}
	scale={[1, 1, 1]}
	position={[-3, 0, 0]}
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
	position={[3, 0, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={phongFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.TorusGeometry(1)}
	scale={[1, 1, 1]}
	position={[0, 0, -3]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={phongFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>
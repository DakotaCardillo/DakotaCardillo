<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import { MathUtils } from 'three';

	import utilsShader from '../../shaders/utils.glsl';
	import vertexShaderMain from '../../shaders/water.vert';
	import fragmentShaderMain from '../../shaders/water.frag';
	import basicVertexShader from '../../shaders/basic.vert';
	import basicFragmentShader from '../../shaders/basic.frag';
	import normalFragmentShader from '../../shaders/normal.frag';
	import normalVertexShader from '../../shaders/normal.vert';
	import halfLambertFragmentShader from '../../shaders/halfLambert.frag';
	import lambertFragmentShader from '../../shaders/lambert.frag';

	const vertexShader = `${utilsShader}\n${vertexShaderMain}`;
	const fragmentShader = `${utilsShader}\n${fragmentShaderMain}`;

	let sunPosition = new THREE.Vector3(0, 10, 0);

	let newEuler = new THREE.Euler();
	const up = new THREE.Vector3(0, 1, 0);


	// Set your orbit center and parameters.
	const orbitCenter = new THREE.Vector3(0, 10, 0);
	const orbitRadius = 5;
	let angle = 0;
	const angularSpeed = 0.5;

	const uniforms = {
		uTime: { value: 0 },
		uSunPosition: { value: sunPosition }
	};

	useTask((delta) => {
		uniforms.uTime.value += delta;

		angle += angularSpeed * delta;
		const x = orbitCenter.x + orbitRadius * Math.cos(angle);
		const z = orbitCenter.z + orbitRadius * Math.sin(angle);

		sunPosition.set(x, sunPosition.y, z);
		sunPosition = sunPosition;

		const matrix = new THREE.Matrix4().lookAt(sunPosition, new THREE.Vector3(0), up);
		newEuler.setFromRotationMatrix(matrix);
		newEuler = newEuler;
	});


	onMount(() => {
	});
</script>

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
	scale={[5, 5, 5]}
	position={[0, 1.2, 0]}
>
	<T.PlaneGeometry
		args={[1, 1, 10, 10]}
		oncreate={(geom) => {
			geom.rotateX(MathUtils.degToRad(-90));
		}}
	/>
	<T.ShaderMaterial
		vertexShader={vertexShader}
		fragmentShader={fragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	scale={[5, 5, 5]}
	position={[6, 1.2, 0]}
>
	<T.PlaneGeometry
		args={[1, 1, 1000, 1000]}
		oncreate={(geom) => {
			geom.rotateX(MathUtils.degToRad(-90));
			//geom.rotateZ(MathUtils.degToRad(-90));
		}}
	/>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={normalFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	scale={[5, 5, 5]}
	position={[12, 1.2, 0]}
	rotation={[MathUtils.degToRad(-90), 0, 0]}
>
	<T.PlaneGeometry
		args={[1, 1, 1000, 1000]}
	/>
	<T.ShaderMaterial
		vertexShader={normalVertexShader}
		fragmentShader={normalFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.SphereGeometry(1)}
	material={new THREE.MeshBasicMaterial({color: 'red'})}
	scale={[1, 1, 1]}
	position={[sunPosition.x, sunPosition.y, sunPosition.z]}
>
</T.Mesh>

<T.Mesh
	geometry={new THREE.SphereGeometry(1)}
	scale={[1, 1, 1]}
	position={[-5, 0, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={halfLambertFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.SphereGeometry(1)}
	scale={[1, 1, 1]}
	position={[-10, 0, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={lambertFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.SphereGeometry(1)}
	scale={[1, 1, 1]}
	position={[-10, 5, 0]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={basicFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>

<T.Mesh
	geometry={new THREE.BoxGeometry(1)}
	scale={[1, 1, 1]}
	position={[5, 0, 5]}
>
	<T.ShaderMaterial
		vertexShader={basicVertexShader}
		fragmentShader={normalFragmentShader}
		uniforms={uniforms}
	/>
</T.Mesh>
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import { MathUtils } from 'three';

	import utilsShader from '../shaders/utils.glsl';
	import vertexShaderMain from '../shaders/grassLayer.vert';
	import fragmentShaderMain from '../shaders/grassLayer.frag';

	const vertexShader = `${utilsShader}\n${vertexShaderMain}`;
	const fragmentShader = `${utilsShader}\n${fragmentShaderMain}`;
	export let height = 0.0;
	export let yDelta = 0.2;

	const uniforms = {
		uTime: { value: 0 },
		uHeight: { value: height },
		uThickness: { value: 1 }
	};

	const task = useTask((delta) => {
		uniforms.uTime.value += delta;
	});
</script>

<T.Mesh
	geometry={new THREE.PlaneGeometry()}
	scale={[30, 30, 1]}
	position={[0, yDelta, 0]}
	rotation={[MathUtils.degToRad(-90), 0, 0]}
>
	<T.ShaderMaterial
		vertexShader={vertexShader}
		fragmentShader={fragmentShader}
		uniforms={uniforms}
		backfaceCulling={false}
	/>
</T.Mesh>
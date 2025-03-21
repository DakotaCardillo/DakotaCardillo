<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import { MathUtils } from 'three';
	import { getContext } from 'svelte';

	import type { Vector3 } from 'three';

	import utilsShader from '../../shaders/utils.glsl';
	import vertexShaderMain from '../../shaders/grassShell.vert';
	import fragmentShaderMain from '../../shaders/grassShell.frag';

	const vertexShader = `${utilsShader}\n${vertexShaderMain}`;
	const fragmentShader = `${utilsShader}\n${fragmentShaderMain}`;

	type ShellConfig = {
		globalPosition: Vector3,
		numShells: number,
		shellDistance: number,
		shellOpacity: number
	};

	const { numShells, shellDistance, shellOpacity, globalPosition } = getContext<ShellConfig>('shellConfig');

	export let index;
	export let width = 10.0;
	export let length = 10.0;

	const uniforms = {
		uTime: { value: 0 },
		uHeight: { value: shellDistance * numShells },
		uThickness: { value: 1 },
		uIndex: { value: index },
		uDistanceDelta: { value: shellDistance },
		uOpacity: { value: shellOpacity }
	};

	useTask((delta) => {
		uniforms.uTime.value += delta;
	});
</script>

<T.Mesh
	geometry={new THREE.PlaneGeometry()}
	scale={[width, length, 1]}
	position={[globalPosition.x, globalPosition.y + (index * shellDistance), globalPosition.z]}
	rotation={[MathUtils.degToRad(-90), 0, 0]}
>
	<T.ShaderMaterial
		vertexShader={vertexShader}
		fragmentShader={fragmentShader}
		uniforms={uniforms}
		backfaceCulling={false}
	/>
</T.Mesh>
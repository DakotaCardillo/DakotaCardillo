<script lang="ts">
	import { T, useThrelte, useTask, useRenderer, extend } from '@threlte/core';
	import {
		ContactShadows,
		Environment,
		interactivity,
		transitions,
		useGltf,
		PerfMonitor,
		Text3DGeometry
	} from '@threlte/extras';
	import * as THREE from 'three';
	import { MathUtils, RenderTarget, Scene, Uniform } from 'three';
	import { vec4 } from 'three/tsl';
	import Geometry from '$lib/slices/Hero/Geometry.svelte';
	import { OrbitControls } from '@threlte/extras';
	import ScreenQuad from '$lib/slices/Hero/ScreenQuad.svelte';

	import vertexShader from '$lib/shaders/basic.vert';
	import gradientShader from '$lib/shaders/gradient.frag';
	import crtShader from '$lib/shaders/crt.frag';
	import screenQuadVertexShader from '$lib/shaders/screenQuad.vert';
	import screenQuadFragmentShader from '$lib/shaders/screenQuad.frag';
	import basicFragmentShader from '$lib/shaders/basic.frag';

	import { MeshGridMaterial } from '$lib/tsl/MeshGridMaterial.ts';
	import { MeshGridMaterialLine } from '$lib/tsl/MeshGridMaterialLine.ts';

	import { WebGPURenderer, MeshBasicNodeMaterial } from 'three/webgpu';

	extend({MeshBasicNodeMaterial})

	const { useWebGPU } = $props();

	const mat = new MeshBasicNodeMaterial({color: 'blue'});
	//mat.fragmentNode = vec4(1.0, 1.0, 0.0, 1.0);

	// Create some grid line definitions:
	const lines = [
		new MeshGridMaterialLine({ color: new THREE.Color(1, 0.8, 0.2), thickness: 0.02, offset: 0.1, cross: 0.5 }),
		new MeshGridMaterialLine({ color: new THREE.Color(0.1, 0.6, 1), thickness: 0.01, offset: 0.3, cross: 1.0 }),
		// Add more lines if needed.
	];

	// Instantiate the custom material:
	const gridMaterial = new MeshGridMaterial(lines, { scale: 1.0, maxLines: 16 });

	// Create a geometry (for example, a plane) and mesh it with our custom material:
	const geometry = new THREE.SphereGeometry(10);
	//geometry.rotateX(MathUtils.degToRad(-90));
	const grid = new THREE.Mesh(geometry, mat);
	grid.position.set(0, 3, 0);
	//const gridMesh = new THREE.Mesh(geometry, gridMaterial);

	const { camera, renderStage, scene, size } = useThrelte();
	const uResolution = new Uniform(new THREE.Vector2($size.width, $size.height));

	const { renderer } = useRenderer();
	const gpuRenderer = renderer as WebGPURenderer;
	console.log(gpuRenderer);
	const target = new RenderTarget();
	$effect(() => {
		target.setSize($size.width, $size.height);
		uResolution.value = new THREE.Vector2($size.width, $size.height);
	});
	const _scene = new Scene();
	useTask(
		() => {
			const last = gpuRenderer.getRenderTarget();
			gpuRenderer.setRenderTarget(target);
			gpuRenderer.render(scene, camera.current);
			gpuRenderer.setRenderTarget(last);
			gpuRenderer.render(_scene, camera.current);
		},
		{
			stage: renderStage
		}
	);
	// if (useWebGPU)
	// {
	// }
	// else
	// {
	// 	const { renderer } = useThrelte();
	//
	// 	const target = new WebGLRenderTarget(1, 1);
	// 	$effect(() => {
	// 		target.setSize($size.width, $size.height);
	// 		uResolution.value = new THREE.Vector2($size.width, $size.height);
	// 	});
	// 	const _scene = new Scene();
	// 	useTask(
	// 		() => {
	// 			const last = renderer.getRenderTarget();
	// 			renderer.setRenderTarget(target);
	// 			renderer.render(scene, camera.current);
	// 			renderer.setRenderTarget(last);
	// 			renderer.render(_scene, camera.current);
	// 		},
	// 		{
	// 			stage: renderStage
	// 		}
	// 	);
	// }



	const uScene = new Uniform(target.texture);
	const uRadius = new Uniform(2);
	const uTime = new Uniform(0);

	interactivity();
	transitions();

	const uniforms = {
		uTime: { value: uTime },
		uResolution: { value: uResolution },
		colorInner: { value: [1.0, 1.0, 1.0] },
		colorOuter: { value: [0.3, 0.3, 0.3] },
		center: { value: [0.5, 0.5, 0.5] },
		uScene: { value: uScene },
		uRadius: { value: uRadius }
	};

	let backgroundMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: gradientShader
	});

	const gltf = useGltf('/assets/StudioBackground.glb');


	useTask((delta) => {
		uTime.value += delta;
		uRadius.value = 1 - 0.5 * (1 + Math.sin(uTime.value));
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 2, 5]}
	aspect={1}
	fov={30}
	near={0.1}
	far={1000}
>
	<OrbitControls></OrbitControls>
</T.PerspectiveCamera>

<Environment url="/smallroom.hdr" />

<ContactShadows
	position={[0, -3.5, 0]}
	opacity={0.65}
	scale={40}
	blur={1}
	far={9}
/>

<!--
	Full screen quad for rendering the canvas render texture
	This allows for full screen post processing
-->
<T.Mesh
	frustrumCulled={false}
	attach={_scene}
>
	<T.RawShaderMaterial
		vertexShader={screenQuadVertexShader}
		fragmentShader={screenQuadFragmentShader}
		uniforms.uScene={uScene}
		uniforms.uTime={uTime}
		uniforms.uResolution={uResolution}
	/>
	<ScreenQuad />
</T.Mesh>

{grid}

<T.Mesh>
	<T.BoxGeometry/>
	<T.MeshBasicNodeMaterial/>
</T.Mesh>

<!--{#await gltf then { scene }}-->
<!--	<T is={scene} />-->
<!--{/await}-->

{#if $gltf}
	<T.Mesh
		scale={[2, 2, 2]}
		rotation={[MathUtils.degToRad(0), MathUtils.degToRad(-90), MathUtils.degToRad(0)]}
		geometry={$gltf.nodes['StudioBackground'].geometry}
		material={backgroundMaterial}
	/>
{/if}



<!--<T.Mesh-->
<!--	rotation={[MathUtils.degToRad(0), MathUtils.degToRad(time), MathUtils.degToRad(0)]}-->
<!--	geometry={new THREE.IcosahedronGeometry(1)}-->
<!--	material={new THREE.MeshBasicMaterial({color: 'red'})}-->
<!--/>-->

<Geometry
	position={[0, 0, 0]}
	rate={0.3}
	geometry={new THREE.IcosahedronGeometry(1)}
/>

<T.GridHelper
	size={10}
	divistions={10}
	position={[0, 1, 0]}
>

</T.GridHelper>

<PerfMonitor
	anchorX='right'
	logsPerSecond={30}
/>

<!--<HTML>-->
<!--<h1 class="mb-2 md:mb-8 text-[clamp(3rem,15vmin,13rem)] leading-none font-light text-nowrap z10 pointer-events-none">-->
<!--		<span class="text-slate-900">-->
<!--			>Dakota_\-->
<!--		</span>-->
<!--</h1>-->
<!--</HTML>-->
<!--<Text-->
<!--	text="Dakota"-->
<!--&gt;-->
<!--</Text>-->

<!--<T.Mesh>-->
<!--	<Text3DGeometry-->
<!--		text="Dakota"-->
<!--		font="Source Code Pro"-->
<!--		size={1}-->
<!--	/>-->
<!--	<T.MeshStandardMaterial-->
<!--		color="#666666"-->
<!--		toneMapped={false}-->
<!--		metalness={0.4}-->
<!--		roughness={0.1}-->
<!--	/>-->
<!--</T.Mesh>-->
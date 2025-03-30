<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
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
	import { MathUtils, Scene, Uniform, WebGLRenderTarget } from 'three';
	import Geometry from '$lib/slices/Hero/Geometry.svelte';
	import { OrbitControls } from '@threlte/extras';
	import ScreenQuad from '$lib/slices/Hero/ScreenQuad.svelte';

	import vertexShader from '$lib/shaders/basic.vert';
	import gradientShader from '$lib/shaders/gradient.frag';
	import crtShader from '$lib/shaders/crt.frag';
	import screenQuadShader from '$lib/shaders/screenQuad.vert';

	const { camera, renderStage, renderer, scene, size } = useThrelte();
	const uResolution = new Uniform(new THREE.Vector2($size.width, $size.height));
	const target = new WebGLRenderTarget(1, 1);
	$effect(() => {
		target.setSize($size.width, $size.height);
		uResolution.value = new THREE.Vector2($size.width, $size.height);
	});
	const _scene = new Scene();
	useTask(
		() => {
			const last = renderer.getRenderTarget();
			renderer.setRenderTarget(target);
			renderer.render(scene, camera.current);
			renderer.setRenderTarget(last);
			renderer.render(_scene, camera.current);
		},
		{
			stage: renderStage
		}
	);

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

<T.Mesh
	frustrumCulled={false}
	attach={_scene}
>
	<T.RawShaderMaterial
		vertexShader={screenQuadShader}
		fragmentShader={crtShader}
		uniforms.uScene={uScene}
		uniforms.uTime={uTime}
		uniforms.uResolution={uResolution}
	/>
	<ScreenQuad />
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
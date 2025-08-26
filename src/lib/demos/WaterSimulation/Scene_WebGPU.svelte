<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useRenderer, useTask, useThrelte } from '@threlte/core';
	import Stats from 'three/addons/libs/stats.module.js';
	import * as THREE from 'three/webgpu';
	import { DoubleSide, MathUtils } from 'three';
	import { Environment, Gizmo, useGltf } from '@threlte/extras';
	import * as TSL from 'three/tsl';
	import { WebGPURenderer } from 'three/webgpu';

	console.log('TSL vec2 test:', typeof (TSL.vec2(1, 2) as any).mul === 'function'); // should be true

	const {
		Fn, uniform, float, uint, vec2, vec3, vec4,
		floor, fract, sin, dot, mix, abs, length,
		texture, textureStore, instanceIndex, compute,
		uv, positionLocal, normalLocal
	} = TSL;

	type Vec2Node = ReturnType<typeof vec2>;

	const {
		waveCount,
		fragmentWaveCount,
		waveType,
		waveAlgorithm,
		wireframe
	} = $props();

	const { scene, dom, invalidate, renderer } = useThrelte();
	scene.background = new THREE.Color(0x000000);

	const webgpuRenderer = renderer as unknown as WebGPURenderer;

	import { OrbitControls } from '@threlte/extras';

	let environmentUrl = '../assets/autumn_field_puresky_4k.exr';

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


	// const particleCount = 200_000;

	// const positions = instancedArray( particleCount, 'vec3' );
	// const velocities = instancedArray( particleCount, 'vec3' );
	// const colors = instancedArray( particleCount, 'vec3' );

	// const separation = 0.2;
	// const amount = Math.sqrt( particleCount );
	// const offset = float( amount / 2 );

	// const computeInit = Fn( () => {
	// 	const position = positions.element( instanceIndex );
	// 	const color = colors.element( instanceIndex );

	// 	const x = instanceIndex.mod( amount );
	// 	const z = instanceIndex.div( amount );

	// 	position.x = offset.sub( x ).mul( separation );
	// 	position.z = offset.sub( z ).mul( separation );

	// 	color.x = hash( instanceIndex );
	// 	color.y = hash( instanceIndex.add( 2 ) );

	// } )().compute( particleCount );


	// const computeUpdate = Fn( () => {

	// 	const position = positions.element( instanceIndex );
	// 	const velocity = velocities.element( instanceIndex );

	// 	velocity.addAssign( vec3( 0.00, gravity, 0.00 ) );
	// 	position.addAssign( velocity );

	// 	velocity.mulAssign( friction );

	// 	// floor

	// 	If( position.y.lessThan( 0 ), () => {

	// 		position.y = 0;
	// 		velocity.y = velocity.y.negate().mul( bounce );

	// 		// floor friction

	// 		velocity.x = velocity.x.mul( .9 );
	// 		velocity.z = velocity.z.mul( .9 );

	// 	} );
	// } );

	// const mat = new THREE.ShaderMaterial({
	// 	// note: under WebGPU these fields are interpreted as WGSL
	// 	vertexShader:   waterShader,
	// 	fragmentShader: waterShader,
	// 	uniforms: {
	// 		uTime:           { value: 0.0 },
	// 		uWaveAlgorithm:  { value: 0 },
	// 		uNumWaves:       { value: 4 },
	// 		uWaveType:       { value: 0 },
	// 		modelMatrix:     { value: new THREE.Matrix4() },
	// 		viewMatrix:      { value: new THREE.Matrix4() },
	// 		projectionMatrix:{ value: new THREE.Matrix4() },
	// 		// …and any other uniforms your WGSL file declares…
	// 	},
	// 	glslVersion: THREE.GLSL3  // required even though we're really feeding WGSL
	// });

	// --- storage texture written by compute ---
	const W = 512, H = 512;
	const heightTex = new THREE.StorageTexture(W, H);

	heightTex.format = THREE.RGBAFormat;
	heightTex.colorSpace = THREE.NoColorSpace;
	heightTex.type = THREE.HalfFloatType;
	heightTex.minFilter = THREE.LinearFilter;
	heightTex.magFilter = THREE.LinearFilter;
	heightTex.generateMipmaps = false;


	const hash = Fn(([p]: [Vec2Node]) =>
		fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453123))
	);

	const valueNoise2D = Fn(([p]: [Vec2Node]) => {
		const i = floor(p), f = fract(p);
		const u = f.mul(f).mul(f.mul(-2.0).add(3.0));
		const a = hash(i);
		const b = hash(i.add(vec2(1, 0)));
		const c = hash(i.add(vec2(0, 1)));
		const d = hash(i.add(vec2(1, 1)));
		const nx0 = mix(a, b, u.x);
		const nx1 = mix(c, d, u.x);
		return mix(nx0, nx1, u.y);
	});

	const fbm = Fn(([p]: [Vec2Node]) => {
		let sum = float(0.0);
		let freq = float(1.0);
		let gain = float(0.5);

		let pFreq = p.mul(freq);
		for (let k = 0; k < 5; k++) {

			// p is read-only; we scale it per octave
			sum = sum.add(valueNoise2D(pFreq).mul(gain));
			freq = freq.mul(2.0);
			gain = gain.mul(0.5);
		}
		return sum;
	});

	const uTime = uniform(0);
	const uScale = uniform(6.0);
	const uAmp = uniform(0.25);

	const writeHeight = Fn(({ outTex }: { outTex: any }) => {
		const uiW = uint(W);
		const y = instanceIndex.div(uiW);
		const x = instanceIndex.sub(y.mul(uiW));

		const px = float(x).add(0.5).div(float(W));
		const py = float(y).add(0.5).div(float(H));

		const p = vec2(px, py);
		const q = p.mul(uScale).add(vec2(uTime, uTime.mul(0.7)));
		const n = fbm(q); // 0..1
		textureStore(outTex, vec2(x, y), vec4(n, n, n, 1.0));
	});

	const heightmapPass = compute(writeHeight({ outTex: heightTex }), W * H); // omit workgroupSize for now


	const mat = new THREE.MeshStandardNodeMaterial({ roughness: 1, metalness: 0 });

	const h = texture(heightTex).sample(uv()).r;

	const albedo = mix(vec3(0.1, 0.3, 0.6), vec3(0.8, 0.9, 1.0), h);

	mat.positionNode = positionLocal.add(normalLocal.mul(h.mul(uAmp)));
	mat.colorNode = albedo;
	mat.side = THREE.DoubleSide;

	const geo = new THREE.PlaneGeometry(1, 1, W, H);
	geo.rotateX(-Math.PI / 2);
	const mesh2 = new THREE.Mesh(geo, mat);
	scene.add(mesh2);


	// uniforms for compute
	//const params = new THREE.Uniform({ time: 0.0, width: TEX_SIZE, height: TEX_SIZE });

	//let flatness = 5.0;
	//const positions = sandGeometry.getAttribute('position');
	//const noise = new SimplexNoise();
	// $effect(() => {
	// 	for (let i = 0; i < positions.count; i += 1) {
	// 		const x = positions.getX(i) / flatness;
	// 		const z = positions.getZ(i) / flatness;
	// 		positions.setY(i, noise.noise(x, z));
	// 	}
	// 	positions.needsUpdate = true;
	// 	// needed for lighting
	// 	sandGeometry.computeVertexNormals();
	// });

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


	const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	let cameraPosition = new THREE.Vector3(0, 0, 3);
	camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

	//const waterMaterial = new THREE.MeshBasicNodeMaterial( {color: 'blue'});
	const waterMaterial = new THREE.NodeMaterial();

	// expose the storage texture as a sampleable texture for nodes:
	//const heightTex = heightST.texture; // read view of the same GPU resource

	const main = Fn(() => {
		const p = positionLocal.toVar();

		//p.addAssign(0.25);
		p.mulAssign(10);

		p.assign(fract(p).sub(0.5));
		p.assign(length(p));
		p.assign(sin(p.mul(20).add(uTime)));
		p.assign(abs(p));

		return p;
	});


	//const amp = float(0.3);
	//const h = texture(heightTex, uv()).r.mul(2.0).sub(1.0);   // [-1, 1]
	//waterMaterial.positionNode = TSL.positionLocal.add(TSL.normalLocal.mul(height));
	waterMaterial.fragmentNode = main();


	//const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), waterMaterial);

	//scene.add(mesh);

	// webgpuRenderer.debug.getShaderAsync(scene, camera, mesh).then((e) => {
	// 	console.log(e.fragmentShader);
	// });

	const stats = new Stats();
	dom.appendChild(stats.dom);
	stats.begin();
	useTask(() => {
		stats.end();

		uTime.value += 0.01;
		webgpuRenderer.compute(heightmapPass);

		stats.begin();
	});
</script>

<T.DirectionalLight intensity={3.4} />

<!-- <Environment
	isBackground={true}
	url={environmentUrl}
/> -->

<T.PerspectiveCamera
	ref={camera}
	position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
	fov={30}
	near={0.1}
	far={1000}
	makeDefault
>
	<OrbitControls target={[0, 0, 0]}>
		<!-- <Gizmo /> -->
	</OrbitControls>
</T.PerspectiveCamera>


<!-- WATER -->
<!-- <T.Mesh
	ref={mesh}
>
</T.Mesh> -->

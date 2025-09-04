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
		Fn, If, uniform, float, uint, vec2, vec3, vec4,
		floor, fract, sin, dot, mix, abs, length,
		texture, textureStore, instanceIndex, compute,
		uv, positionLocal, normalLocal, positionWorld, min,
		attribute, fwidth, smoothstep, frontFacing, select
	} = TSL;

	type Vec2Node = ReturnType<typeof vec2>;

	const {
		waveCount,
		fragmentWaveCount,
		waveType,
		waveAlgorithm,
		isWireframe
	} = $props();

	const { scene, dom, invalidate, renderer } = useThrelte();
	scene.background = new THREE.Color(0x000000);

	const webgpuRenderer = renderer as unknown as WebGPURenderer;

	import { OrbitControls } from '@threlte/extras';

	let environmentUrl = '../assets/autumn_field_puresky_4k.exr';

	let waterGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterGeometry.rotateX(MathUtils.degToRad(-90));
	let waterOutputGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterOutputGeometry.rotateX(MathUtils.degToRad(-90));
	let underwaterGeometry = new THREE.BoxGeometry(20, 20, 20, 100, 100, 100);

	let sandGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	sandGeometry.rotateX(MathUtils.degToRad(-90));

	const W = 100, H = 100;
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

		for (let k = 0; k < 5; k++) {
			sum = sum.add(valueNoise2D(p.mul(freq)).mul(gain));
			freq = freq.mul(2.0);
			gain = gain.mul(0.5);
		}
		return sum;
	});

	const uTime = uniform(0);
	const uScale = uniform(6.0);
	const uAmp = uniform(0.25);


	// For each texel, create a normalized value and assign it to vec2 p.
	// Then, scale p by uScale and add uTime.
	// Then, pass p into FBM to calculate the fractional brownian motion value.
	// p will now be in the range of [0, uScale] + uTime.
	// The FBM function will loop over 5 octaves, doubling the frequency each time while halving the gain.
	// The frequency is multiplied with p and passed into valueNoise2D, and the result is multiplied by gain.
	// The sum of these is returned.
	const writeHeight = Fn(({ outTex }: { outTex: THREE.StorageTexture }) => {
		const uiW = uint(W);
		const y = instanceIndex.div(uiW);
		const x = instanceIndex.sub(y.mul(uiW));

		const px = float(x).add(0.5).div(float(W));
		const py = float(y).add(0.5).div(float(H));

		const p = vec2(px, py);
		const q = p.mul(uScale).add(vec2(uTime, uTime.mul(0.7)));
		const n = fbm(q);
		textureStore(outTex, vec2(x, y), vec4(n, n, n, 1.0));
	});

	const heightmapPass = compute(writeHeight({ outTex: heightTex }), W * H); // omit workgroupSize for now

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

	class Wave {
		amplitude = uniform(Math.random() * 0.5 + 0.1);
		frequency = uniform(Math.random() * 1.0 + 0.1);
		direction = uniform(new THREE.Vector2(Math.random(), Math.random()));
		phase = uniform(Math.random() * Math.PI * 2);
		speed = uniform(Math.random() * 2.0 + 0.1);

		eval = Fn(([p]: [ReturnType<typeof vec3>]) => {
			const d = vec2(this.direction.value.x, this.direction.value.y);
			const k = this.frequency.mul(2.0 * Math.PI);
			const arg = dot(p.xz, d).mul(k).add(this.phase.add(uTime.mul(this.speed)));
			const h = sin(arg).mul(this.amplitude.value);
			return p.add(TSL.vec3(0, h, 0));
		});
	}

	function sumOfSines(waves: Wave[]) {
		let sum = float(0.0);
		for (let i = 0; i < waves.length; i++) {
			sum = sum.add(waves[i].eval(positionLocal));
		}
		return positionLocal.add(normalLocal.mul(sum));
	}

	// Needed for wireframe shader
	function addCenterAttribute(geometry: THREE.BufferGeometry) {
		const g = geometry.index ? geometry.toNonIndexed() : geometry;

		const count = g.attributes.position.count;
		const centers = new Float32Array(count * 3);

		for (let i = 0; i < count; i += 3) {
			centers.set([1, 0, 0], (i + 0) * 3);
			centers.set([0, 1, 0], (i + 1) * 3);
			centers.set([0, 0, 1], (i + 2) * 3);
		}
		g.setAttribute('center', new THREE.BufferAttribute(centers, 3));
	}

	const waves: Wave[] = [];
	for (let i = 0; i < 10; i++) {
		waves.push(new Wave());
	}

	const wireframe = Fn(() => {
		const center = attribute('center', 'vec3');
		const afwidth = fwidth(center);
		const edge3 = smoothstep(0.0, afwidth.mul(1.0), center.xyz);
		const edge = float(1.0).sub(min(edge3.x, min(edge3.y, edge3.z)));

		const cFront = vec3(0.9, 0.9, 1.0);
		const cBack = vec3(0.4, 0.4, 0.5);

		const baseColor = select(frontFacing, cFront, cBack);

		return vec4(baseColor, edge);
	});

	addCenterAttribute(waterGeometry);
	addCenterAttribute(underwaterGeometry);

	const mat = new THREE.NodeMaterial();

	const h = texture(heightTex).sample(uv()).r;

	const albedo = mix(vec4(0.1, 0.3, 0.6, 0.3), vec4(0.8, 0.9, 1.0, 0.6), h);

	mat.positionNode = positionLocal.add(normalLocal.mul(h.mul(uAmp)));
	mat.colorNode = albedo;
	mat.side = THREE.DoubleSide;

	const textureMat = new THREE.NodeMaterial();
	textureMat.colorNode = texture(heightTex).sample(uv());
	textureMat.side = THREE.DoubleSide;

	const geo = new THREE.PlaneGeometry(20, 20, 100, 100).toNonIndexed();
	geo.rotateX(-Math.PI / 2);

	addCenterAttribute(geo);
	console.log(geo.getAttribute('center')?.itemSize);

	const waterMesh = new THREE.Mesh(geo, mat);
	const textureMesh = new THREE.Mesh(geo, textureMat);
	textureMesh.translateX(20);


	const thickness = float(1.0);
	const center = attribute('center', 'vec3');
	const afwidth = fwidth(center);
	const edge3 = smoothstep(afwidth.mul(thickness.sub(1.0).max(float(0.0))), afwidth.mul(thickness), center);
	const edge = float(1.0).sub(min(edge3.x, min(edge3.y, edge3.z)));

	const cFront = vec3(0.9, 0.9, 1.0);
	const cBack = vec3(0.4, 0.4, 0.5);

	const baseColor = select(frontFacing, cFront, cBack);

	const waterSinesMat = new THREE.NodeMaterial();
	waterSinesMat.positionNode = sumOfSines(waves);
	waterSinesMat.fragmentNode = wireframe();
	//waterSinesMat.colorNode = albedo;
	waterSinesMat.side = THREE.DoubleSide;
	waterSinesMat.transparent = true;
	const waterSinesMesh = new THREE.Mesh(geo, waterSinesMat);

	waterSinesMesh.translateZ(-20);

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


	const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	let cameraPosition = new THREE.Vector3(-25, 20, 25);
	camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

	//const waterMaterial = new THREE.MeshBasicNodeMaterial( {color: 'blue'});
	const waterMaterial = new THREE.NodeMaterial();

	// expose the storage texture as a sampleable texture for nodes:
	//const heightTex = heightST.texture; // read view of the same GPU resource

	//const amp = float(0.3);
	//const h = texture(heightTex, uv()).r.mul(2.0).sub(1.0);   // [-1, 1]
	//waterMaterial.positionNode = TSL.positionLocal.add(TSL.normalLocal.mul(height));
	waterMaterial.fragmentNode = main();

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

<!--<Environment-->
<!--	isBackground={true}-->
<!--	url={environmentUrl}-->
<!--/>-->

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
<T is={waterMesh} />
<T is={textureMesh} />
<T is={waterSinesMesh} />

<!-- <T.Mesh
	ref={mesh}
>
</T.Mesh> -->

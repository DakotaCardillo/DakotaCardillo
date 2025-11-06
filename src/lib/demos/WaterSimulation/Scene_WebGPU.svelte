<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { T, useRenderer, useTask, useThrelte } from '@threlte/core';
	import Stats from 'three/addons/libs/stats.module.js';
	import * as THREE from 'three/webgpu';
	import { DoubleSide, MathUtils } from 'three';
	import { Environment, Gizmo, useGltf } from '@threlte/extras';
	import * as TSL from 'three/tsl';
	import { WebGPURenderer } from 'three/webgpu';

	const {
		Fn, If, uniform, float, uint, uvec2, vec2, vec3, vec4, pow,
		floor, fract, sin, cos, atan, dot, mix, abs, length, exp, sqrt,
		texture, textureStore, storage, storageTexture, textureLoad, instanceIndex, compute, mod, time,
		uv, positionLocal, normalLocal, positionWorld, reciprocal, negate,
		attribute, fwidth, smoothstep, frontFacing, select, atan2, struct, saturate, max, min
	} = TSL;

	//const SpectrumParams = struct(
	// 	{
	// 		scale: 'float',
	// 		gamma: 'float',
	// 		peakOmega: 'float',
	// 		swell: 'float',
	// 		spreadBlend: 'float',
	// 		angle: 'float',
	// 		shortWavesFade: 'float'
	// 	},
	// 	'SpectrumParams'
	// );

	const SpectrumParameters = {
		scale: float(1.0),
		gamma: float(1.0),
		peakOmega: float(1.0),
		swell: float(1.0),
		spreadBlend: float(1.0),
		angle: float(1.0),
		shortWavesFade: float(1.0)
	};

	type FloatNode = ReturnType<typeof float>;
	type UIntNode = ReturnType<typeof uint>;
	type UVec2Node = ReturnType<typeof uvec2>;
	type Vec2Node = ReturnType<typeof vec2>;
	type Vec3Node = ReturnType<typeof vec3>;
	type Vec4Node = ReturnType<typeof vec4>;
	//type SpectrumParamsNode = ReturnType<typeof SpectrumParams>;

	const tanh = Fn(([x]: [FloatNode]) => {
		const e2x = x.mul(2.0).exp();
		return e2x.sub(1.0).div(e2x.add(1.0));
	});

	const cosh = Fn(([x]: [FloatNode]) => {
		const ex = x.exp();
		const emx = x.negate().exp();
		return ex.add(emx).mul(0.5);
	});

	const NormalizationFactor = Fn(([s]: [FloatNode]) => {
		const s2 = s.mul(s);
		const s3 = s2.mul(s);
		const s4 = s3.mul(s);

		const result = float(0.0).toVar();
		If(s.lessThan(5.0), () => {
			result.assign(
				float(-0.000564).mul(s4)
					.add(float(0.00776).mul(s3))
					.sub(float(0.044).mul(s2))
					.add(float(0.192).mul(s))
					.add(0.163)
			);
		}).Else(() => {
			result.assign(
				float(-4.80e-08).mul(s4)
					.add(float(1.07e-05).mul(s3))
					.sub(float(9.53e-04).mul(s2))
					.add(float(5.90e-02).mul(s))
					.add(3.93e-01)
			);
		});

		return result;
	});

	const cos2s = Fn(([theta, s]: [FloatNode, FloatNode]) => {
		return NormalizationFactor(s).mul(
			pow(
				abs(cos(float(0.5).mul(theta))),
				float(2.0).mul(s)
			)
		);
	});

	const complexMult = Fn(([a, b]: [Vec2Node, Vec2Node]) => {
		return vec2(
			a.x.mul(b.x).sub(a.y.mul(b.y)),
			a.x.mul(b.y).add(a.y.mul(b.x))
		);
	});

	const complexMult4 = Fn(([b, w]: [Vec4Node, Vec2Node]) => {
		// b = (reX, imX, reZ, imZ)
		const reX = b.x, imX = b.y;
		const reZ = b.z, imZ = b.w;
		const c = w.x, s = w.y; // twiddle = c + i s

		const reX2 = reX.mul(c).sub(imX.mul(s));
		const imX2 = reX.mul(s).add(imX.mul(c));

		const reZ2 = reZ.mul(c).sub(imZ.mul(s));
		const imZ2 = reZ.mul(s).add(imZ.mul(c));

		return vec4(reX2, imX2, reZ2, imZ2);
	});

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
	import { log2 } from 'three/src/Three.TSL';

	let environmentUrl = '../assets/autumn_field_puresky_4k.exr';

	let waterGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterGeometry.rotateX(MathUtils.degToRad(-90));
	let waterOutputGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	waterOutputGeometry.rotateX(MathUtils.degToRad(-90));
	let underwaterGeometry = new THREE.BoxGeometry(20, 20, 20, 100, 100, 100);

	let sandGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
	sandGeometry.rotateX(MathUtils.degToRad(-90));

	const W = 512, H = 512;
	const N = W * H;
	const size = W;
	const logSize = Math.log2(size);
	const log2W = Math.log2(W);
	const log2H = Math.log2(H);
	const heightTex = new THREE.StorageTexture(W, H);

	heightTex.format = THREE.RGBAFormat;
	heightTex.colorSpace = THREE.NoColorSpace;
	heightTex.type = THREE.HalfFloatType;
	heightTex.minFilter = THREE.LinearFilter;
	heightTex.magFilter = THREE.LinearFilter;
	heightTex.generateMipmaps = false;

	const frequencyData = new Float32Array(N * 2);
	const frequencyAttr = new THREE.StorageBufferAttribute(frequencyData, 2);
	const frequencyBuffer = storage(frequencyAttr, 'vec2', N);

	const spectrumDataA = new Float32Array(N * 2);
	// spectrumDataA.fill(0);
	// spectrumDataA[0] = 1.0;
	const spectrumDataB = new Float32Array(N * 2);
	const spectrumAttrA = new THREE.StorageBufferAttribute(spectrumDataA, 2);
	const spectrumAttrB = new THREE.StorageBufferAttribute(spectrumDataB, 2);
	const spectrumBufferA = storage(spectrumAttrA, 'vec2', N);
	const spectrumBufferB = storage(spectrumAttrB, 'vec2', N);

	const displacementData = new Float32Array(N * 4);
	const displacementAttr = new THREE.StorageBufferAttribute(displacementData, 4);
	const displacementBuffer = storage(displacementAttr, 'vec4', N);

	const slopeData = new Float32Array(N * 4);
	const slopeAttr = new THREE.StorageBufferAttribute(slopeData, 4);
	const slopeBuffer = storage(slopeAttr, 'vec4', N);

	// displacement spectrum (DX, DZ) complex
	const displacementDataA = new Float32Array(N * 4);
	// displacementDataA.fill(0);
	// displacementDataA[0] = 1.0;
	const displacementDataB = new Float32Array(N * 4);
	const displacementAttrA = new THREE.StorageBufferAttribute(displacementDataA, 4);
	//displacementAttrA.needsUpdate = true;
	const displacementAttrB = new THREE.StorageBufferAttribute(displacementDataB, 4);
	const displacementSpectrumA = storage(displacementAttrA, 'vec4', N);
	const displacementSpectrumB = storage(displacementAttrB, 'vec4', N);

	// slope spectrum (SX, SZ) complex
	const slopeDataA = new Float32Array(N * 4);
	const slopeDataB = new Float32Array(N * 4);
	const slopeAttrA = new THREE.StorageBufferAttribute(slopeDataA, 4);
	const slopeAttrB = new THREE.StorageBufferAttribute(slopeDataB, 4);
	const slopeSpectrumA = storage(slopeAttrA, 'vec4', N);
	const slopeSpectrumB = storage(slopeAttrB, 'vec4', N);

	const kDisplacementTexture = new THREE.StorageTexture(W, H);
	kDisplacementTexture.format = THREE.RGBAFormat;
	kDisplacementTexture.colorSpace = THREE.NoColorSpace;
	kDisplacementTexture.type = THREE.HalfFloatType;
	kDisplacementTexture.minFilter = THREE.LinearFilter;
	kDisplacementTexture.magFilter = THREE.LinearFilter;
	kDisplacementTexture.generateMipmaps = false;

	const kSlopeTexture = new THREE.StorageTexture(W, H);
	kSlopeTexture.format = THREE.RGBAFormat;
	kSlopeTexture.colorSpace = THREE.NoColorSpace;
	kSlopeTexture.type = THREE.HalfFloatType;
	kSlopeTexture.minFilter = THREE.LinearFilter;
	kSlopeTexture.magFilter = THREE.LinearFilter;
	kSlopeTexture.generateMipmaps = false;

	const heightTexture = new THREE.StorageTexture(W, H);
	heightTexture.format = THREE.RGBAFormat;
	heightTexture.colorSpace = THREE.NoColorSpace;
	heightTexture.type = THREE.HalfFloatType;
	heightTexture.minFilter = THREE.LinearFilter;
	heightTexture.magFilter = THREE.LinearFilter;
	heightTexture.generateMipmaps = false;

	const UniformToGaussian = Fn(([u]: [Vec2Node]) => {
		const u1 = u.x;
		const u2 = u.y;

		const r = u1.log().mul(-2.0).sqrt();
		const theta = u2.mul(float(Math.PI * 2.0));

		const s = theta.sin();
		const c = theta.cos();

		return vec2(r.mul(c), r.mul(s));
	});

	const hash01 = Fn(([p]: [Vec3Node]) => {
		// dot(p, constVec) → scalar
		const d = p.dot(vec3(127.1, 311.7, 74.7));
		// fract(sin(d) * 43758.5453)
		return d.sin().mul(43758.5453123).fract();
	});

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
	const uRepeatTime = uniform(200.0);
	const uSpeed = uniform(1.0);
	const uScale2 = uniform(6.0);
	const uSeed = uniform(456.0);
	const uWindSpeed = uniform(10.0);
	const uGravity = uniform(9.8);
	const uAmplitude = uniform(0.2);
	const uLowCutOff = uniform(0.0001);
	const uHighCutOff = uniform(9000.0);
	const uDepth = uniform(100.0);
	const uAlpha = uniform(0.0081);
	const uGamma = uniform(1.0);
	const uPeakOmega = uniform(1.0);
	const uScale = uniform(1000.0);
	const uSwell = uniform(0.0);
	const uAngle = uniform(0.0);
	const uSpreadBlend = uniform(0.0);
	const uPatchLength = uniform(256);
	const uHalfSize = uniform(1);
	const uStepSize = uniform(2);
	const uLambda = uniform(vec2(1.0, 1.0));
	const uFoamDecayRate = uniform(0.05);
	const uFoamBias = uniform(0.5);
	const uFoamThreshold = uniform(0.0);
	const uFoamDepthFalloff = uniform(0.0);
	const uFoamAdd = uniform(0.5);
	const uStage = uniform(0);
	const uLog2Size = uniform(log2W);

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
		const q = p.mul(uScale2).add(vec2(uTime, uTime.mul(0.7)));
		const n = fbm(q);
		textureStore(outTex, vec2(x, y), vec4(n, n, n, 1.0));
	});

	const Spectrum = Fn(([k]: [Vec2Node]) => {
		const k2 = k.dot(k);
		if (k < float(1e-6)) return 0.0;

		const kLength = k.length();
		const kSafe = kLength.max(1e-6);
		const L = uWindSpeed.mul(uWindSpeed).div(uGravity);
		const kL = kSafe.mul(L);
		const upperPart = exp(float(-1.0).div(kL.mul(kL)));
		return uAmplitude.mul(upperPart.div(k2.mul(k2)));
	});

	const JONSWAP = Fn(([omega]: [FloatNode]) => {
		const sigma = select(omega.lessThanEqual(uPeakOmega), float(0.07), float(0.09));

		// r is the exponent gamma (peak enhancement factor) is raised by
		const rUpperPart = (omega.sub(uPeakOmega)).negate().mul(omega.sub(uPeakOmega));
		const rLowerPart = float(2.0).mul(sigma).mul(sigma).mul(uPeakOmega).mul(uPeakOmega);
		const r = exp(rUpperPart.div(rLowerPart));

		const oneOverOmega = float(1.0).div(omega);
		const peakOmegaOverOmega = uPeakOmega.div(omega);

		return uScale.mul(TMACorrection(omega)).mul(uAlpha).mul(uGravity).mul(uGravity)
			.mul(oneOverOmega).mul(oneOverOmega).mul(oneOverOmega).mul(oneOverOmega).mul(oneOverOmega)
			.mul(exp(float(-1.25).mul(peakOmegaOverOmega).mul(peakOmegaOverOmega).mul(peakOmegaOverOmega).mul(peakOmegaOverOmega)))
			.mul(pow(abs(uGamma), r));
	});

	const Dispersion = Fn(([k]: [FloatNode]) => {
		// omega = sqrt(g * k * tanh(k h)), with clamp on kh
		const kh = k.mul(uDepth).min(20.0);
		const th = tanh(kh);
		return uGravity.mul(k).mul(th).sqrt();
	});

	const DispersionDerivative = Fn(([k]: [FloatNode]) => {
		const kh = k.mul(uDepth).min(20.0);
		const th = tanh(kh);
		const ch = cosh(kh);
		const term = uDepth.mul(k).div(ch.mul(ch)).add(th);
		return uGravity.mul(term).div(Dispersion(k).mul(2));
	});

	const TMACorrection = Fn(([omega]: [FloatNode]) => {
		const omegaH = omega.mul(sqrt(uDepth.div(uGravity)));
		const result = float(0.0).toVar();

		If(omegaH.lessThanEqual(1.0), () => {
			result.assign(float(0.5).mul(omegaH).mul(omegaH));
		}).Else(() => {
			If(omegaH.lessThan(2.0), () => {
				const term = float(2.0).sub(omegaH);
				result.assign(float(1.0).sub(float(0.5).mul(term.mul(term))));
			}).Else(() => {
				result.assign(float(1.0));
			});
		});

		return result;
	});

	const SpreadPower = Fn(([omega, peakOmega]: [FloatNode, FloatNode]) => {
		const ratio = omega.div(peakOmega).abs();
		const result = float(0.0).toVar();

		If(omega.greaterThan(peakOmega), () => {
			result.assign(float(9.77).mul(pow(ratio, float(-2.5))));
		}).Else(() => {
			result.assign(float(6.97).mul(pow(ratio, float(5.0))));
		});

		return result;
	});

	const DirectionSpectrum = Fn(([theta, omega]: [FloatNode, FloatNode]) => {
		const s = SpreadPower(omega, uPeakOmega).add(float(16).mul(tanh(min(omega.div(uPeakOmega), float(20.0))).mul(uSwell).mul(uSwell)));
		return mix(float(2.0).div(Math.PI).mul(cos(theta)).mul(cos(theta)), cos2s(theta.sub(uAngle), s), uSpreadBlend);
	});

	const InitializeSpectrum = Fn(() => {
		const uiW = uint(W);
		const idx = instanceIndex;
		const y = idx.div(uiW);
		const x = idx.sub(y.mul(uiW));

		// const base = vec3(float(x), float(y), uSeed);
		// const v1 = hash01(base);
		// const v2 = hash01(base.add(vec3(13.0, 37.0, 101.0)));
		//
		// // just some complex noise
		// const h = UniformToGaussian(vec2(v1.max(1e-7), v2));
		// frequencyBuffer.element(idx).assign(h);
		// return;

		// If(x.equal(0).and(y.equal(0)), () => {
		// 	frequencyBuffer.element(idx).assign(vec2(1.0, 0.0));
		// }).Else(() => {
		// 	frequencyBuffer.element(idx).assign(vec2(0.0, 0.0));
		// });
		//
		// return;

		// Create a wave vector (k) for each texel.
		const halfN = float(W).div(2.0);
		const deltaK = float(Math.PI * 2.0).div(uPatchLength);
		const kz = (float(x).sub(halfN)).mul(deltaK);
		const ky = (float(y).sub(halfN)).mul(deltaK);
		const k = vec2(kz, ky);

		const kLength = k.length();

		// if (kLength.lessThan(float(1e-6))) {
		// 	// DC mode: no waves, just mean level
		// 	textureStore(outTex, vec2(x, y), vec4(0, 0, 0, 0));
		// 	return;
		// }

		const kSafe = kLength.max(1e-6);

		const pBase = vec3(float(x), float(y), uSeed);
		// four independent uniforms in (0,1)
		const u1 = hash01(pBase).max(1e-7);
		const u2 = hash01(pBase.add(vec3(13.0, 37.0, 101.0)));
		const u3 = hash01(pBase.add(vec3(59.0, 83.0, 197.0)));
		const u4 = hash01(pBase.add(vec3(103.0, 211.0, 307.0)));
		const gauss1 = UniformToGaussian(vec2(u1, u2));
		const gauss2 = UniformToGaussian(vec2(u3, u4));

		const gaussReal = gauss2.x;
		const gaussImag = gauss1.y;

		If(uLowCutOff.lessThanEqual(kSafe) && kSafe.lessThan(uHighCutOff), () => {
			//const spectrum = Spectrum(k);
			const kAngle = atan(k.y, k.x);
			const omega = Dispersion(kSafe);
			const dOmegadk = DispersionDerivative(kSafe);

			const spectrum = JONSWAP(omega).mul(DirectionSpectrum(kAngle, omega));

			const variance = float(2.0)
				.mul(spectrum)
				.mul(abs(dOmegadk))
				.div(kSafe)
				.mul(deltaK.mul(deltaK));

			const scale = sqrt(variance);


			frequencyBuffer.element(idx).assign(vec2(gaussReal, gaussImag).mul(scale));

			// textureStore(
			// 	outTex,
			// 	vec2(x, y),
			// 	vec4(vec2(gaussReal, gaussImag).mul(scale), 0.0, 0.0)
			// );
		}).Else(() => {
			frequencyBuffer.element(idx).assign(vec2(0.0, 0.0));
			//textureStore(outTex, vec2(x, y), vec4(0.0, 0.0, 0.0, 0.0));
		});
	});

	const InitializeSpectrumConjugate = Fn(() => {
		const uiW = uint(W);
		const idx = instanceIndex;
		const y = idx.div(uiW);
		const x = idx.sub(y.mul(uiW));

		const N = uiW;
		const jx = N.sub(x).mod(N);
		const jy = N.sub(y).mod(N);
		const idxConj = jy.mul(N).add(jx);

		const h0 = frequencyBuffer.element(idx);
		const h0conj = frequencyBuffer.element(idxConj);

		frequencyBuffer.element(idx).assign(h0);
		frequencyBuffer.element(idxConj).assign(h0conj);
	});

	const CopyFreqToSpectrumA = Fn(() => {
		const uiW = uint(W);
		const idx = instanceIndex;
		const y = idx.div(uiW);
		const x = idx.sub(y.mul(uiW));

		const h0 = frequencyBuffer.element(idx);
		spectrumBufferA.element(idx).assign(h0);
	});

	const UpdateSpectrumForFFT = Fn(() => {
		const uiW = uint(W);
		const idx = instanceIndex;
		const y = idx.div(uiW);
		const x = idx.sub(y.mul(uiW));

		const N = uiW;
		const ix = x;
		const iy = y;
		const jx = N.sub(ix).mod(N);       // (N - x) % N
		const jy = N.sub(iy).mod(N);       // (N - y) % N

		const idxConj = jy.mul(N).add(jx);  // index of -k

		//const initialSignal = texture(initTex).sample(vec2(x, y)).rgba;
		const h0 = frequencyBuffer.element(idx);
		const h0Neg = frequencyBuffer.element(idxConj);

		const h0conj = vec2(h0Neg.x, h0Neg.y.negate());

		const halfN = N.mul(0.5);
		const K = (vec2(x, y).sub(halfN)).mul(2.0).mul(Math.PI).div(uPatchLength);
		const kLength = K.length();
		const kLengthRcp = reciprocal(kLength).toVar();

		If(kLength.lessThan(0.0001), () => {
			kLengthRcp.assign(1.0);
		});

		const w_0 = float(2.0).mul(Math.PI).div(uRepeatTime);
		const dispersion = floor(sqrt(uGravity.mul(kLength)).div(w_0)).mul(w_0).mul(time).mul(uSpeed);
		const exponent = vec2(cos(dispersion), sin(dispersion));

		const htilde = complexMult(h0, exponent).add(complexMult(h0conj, vec2(exponent.x, exponent.y.negate())));
		const ih = vec2(htilde.y.negate(), htilde.x);

		const displacementX = ih.mul(K.x).mul(kLengthRcp);
		const displacementY = htilde;
		const displacementZ = ih.mul(K.y).mul(kLengthRcp);

		const displacementX_dx = htilde.negate().mul(K.x).mul(K.x).mul(kLengthRcp);
		const displacementY_dx = ih.mul(K.x);
		const displacementZ_dx = htilde.negate().mul(K.x).mul(K.y).mul(kLengthRcp);

		const displacementY_dz = ih.mul(K.y);
		const displacementZ_dz = htilde.negate().mul(K.y).mul(K.y).mul(kLengthRcp);

		const htildeDisplacementX = vec2(displacementX.x.sub(displacementZ.y), displacementX.y.add(displacementZ.x));
		const htildeDisplacementZ = vec2(displacementY.x.sub(displacementZ_dx.y), displacementY.y.add(displacementZ_dx.x));

		const htildeSlopeX = vec2(displacementY_dx.x.sub(displacementY_dz.y), displacementY_dx.y.add(displacementY_dz.x));
		const htildeSlopeZ = vec2(displacementX_dx.x.sub(displacementZ_dz.y), displacementX_dx.y.add(displacementZ_dz.x));

		spectrumBufferA.element(idx).assign(htilde);

		displacementSpectrumA.element(idx).assign(vec4(htildeDisplacementX, htildeDisplacementZ));
		slopeSpectrumA.element(idx).assign(vec4(htildeSlopeX, htildeSlopeZ));

		//textureStore(kDisplacementTexture, vec2(x, y), vec4(htildeDisplacementX, htildeDisplacementZ));
		//textureStore(kSlopeTexture, vec2(x, y), vec4(htildeSlopeX, htildeSlopeZ));
	});

	// const ButterflyValues = Fn(([step, index, indices, twiddle]: [UIntNode, UIntNode, UVec2Node, Vec2Node]) => {
	// 	const twoPi = float(2.0 * Math.PI);
	// 	const b = uSize.shiftRight((step.add(1)));
	// 	const w = b.mul(index.div(b));
	// 	const i = (w.add(index)).mod(uSize);
	// 	twiddle.x = sin(twoPi.negate().div(uSize.mul(w)));
	// 	twiddle.y = cos(twoPi.negate().div(uSize.mul(w))).negate();
	//
	// 	indices = uvec2(i, i.add(b));
	// });

	// const FFT = Fn(([input]: [Vec4Node]) => {
	//
	// });


	const FFT_Horizontal = Fn(({ inBuffer, outBuffer }: {
		inBuffer: THREE.StorageBufferNode,
		outBuffer: THREE.StorageBufferNode
	}) => {
		const uiW = uint(W);
		const uiH = uint(H);

		const pairsPerRow = uiW.div(uint(2));
		const pairIndex = instanceIndex;

		const row = pairIndex.div(pairsPerRow);
		const pairInRow = pairIndex.sub(row.mul(pairsPerRow));

		const sMax = uint(uLog2Size).sub(1);
		const s = min(uint(uStage), sMax);
		const halfSize = uint(1).shiftLeft(s);
		const stepSize = halfSize.shiftLeft(1);

		If(halfSize.greaterThan(pairsPerRow), () => {
			const idx = row.mul(uiW).add(pairInRow);
			outBuffer.element(idx).assign(inBuffer.element(idx));
			return;
		});


		// group index within row, and offset within half
		const group = pairInRow.div(halfSize);
		const offset = pairInRow.sub(group.mul(halfSize)); // k within the butterfly

		// local indices within row
		const i0Local = group.mul(stepSize).add(offset);
		const i1Local = i0Local.add(halfSize);

		// global indices in buffer
		const rowOffset = row.mul(uiW);
		const idx0 = rowOffset.add(i0Local);
		const idx1 = rowOffset.add(i1Local);

		// load inputs
		const a = inBuffer.element(idx0); // vec4
		const b = inBuffer.element(idx1);

		const k = offset;
		const twoPiOverStep = float(6.283185307179586).div(float(stepSize));
		const angle = twoPiOverStep.mul(float(k));
		const twiddle = vec2(angle.cos(), angle.sin());

// 		const ratio = float(k).div(float(stepSize).max(1.0)); // avoid /0
// 		const angle = float(2.0 * Math.PI).mul(ratio).toVar();
//
// 		angle.assign(angle.clamp(-float(1e6), float(1e6)));
//
// 		const cos = angle.cos();
// 		const sin = angle.sin();
//
// 		const bad = cos.notEqual(cos).or(sin.notEqual(sin));
//
// 		const twiddle = vec2(
// 			select(bad, float(1.0), cos),
// 			select(bad, float(0.0), sin)
// 		);

		const wb = complexMult4(b, twiddle);

		const out0 = a.add(wb);
		const out1 = a.sub(wb);

		outBuffer.element(idx0).assign(out0);
		outBuffer.element(idx1).assign(out1);
	});

	const FFT_Vertical = Fn(({ inBuffer, outBuffer }: {
		inBuffer: THREE.StorageBufferNode,
		outBuffer: THREE.StorageBufferNode
	}) => {
		const uiW = uint(W);
		const uiH = uint(H);

		const pairsPerCol = uiH.div(uint(2));

		const pairIndex = instanceIndex;

		const col = pairIndex.div(pairsPerCol);
		const pairInCol = pairIndex.sub(col.mul(pairsPerCol));

		const sMax = uint(uLog2Size).sub(1);
		const s = min(uint(uStage), sMax);
		const halfSize = uint(1).shiftLeft(s);
		const stepSize = halfSize.shiftLeft(1);

		If(halfSize.greaterThan(pairsPerCol), () => {
			const idx = col.mul(uiH).add(pairInCol);
			outBuffer.element(idx).assign(inBuffer.element(idx));
			return;
		});

		const group = pairInCol.div(halfSize);
		const offset = pairInCol.sub(group.mul(halfSize));

		const j0Local = group.mul(stepSize).add(offset);
		const j1Local = j0Local.add(halfSize);

		const idx0 = col.add(j0Local.mul(uiW));
		const idx1 = col.add(j1Local.mul(uiW));

		const a = inBuffer.element(idx0);
		const b = inBuffer.element(idx1);

		const k = offset;
		const twoPiOverStep = float(6.283185307179586).div(float(stepSize));
		const angle = twoPiOverStep.mul(float(k));
		const twiddle = vec2(angle.cos(), angle.sin());

// 		const ratio = float(k).div(float(stepSize).max(1.0)); // avoid /0
// 		const angle = float(2.0 * Math.PI).mul(ratio).toVar();
//
// 		angle.assign(angle.clamp(-float(1e6), float(1e6)));
//
// 		const cos = angle.cos();
// 		const sin = angle.sin();
//
// 		const bad = cos.notEqual(cos).or(sin.notEqual(sin));
//
// 		const twiddle = vec2(
// 			select(bad, float(1.0), cos),
// 			select(bad, float(0.0), sin)
// 		);

		const wb = complexMult4(b, twiddle);

		const out0 = a.add(wb);
		const out1 = a.sub(wb);

		outBuffer.element(idx0).assign(out0);
		outBuffer.element(idx1).assign(out1);
	});

	const NormalizeToHeight = Fn(() => {
		const uiW = uint(W);
		const idx = instanceIndex;
		const y = idx.div(uiW);
		const x = idx.sub(y.mul(uiW));

		const h = spectrumBufferA.element(idx); // vec2(re, im)
		const height = h.x.div(float(W * H));   // normalize inverse FFT

		// simple visual mapping for now
		const v = height.mul(5.0).add(0.5).clamp(0.0, 1.0);
		textureStore(heightTexture, vec2(x, y), vec4(v, v, v, 1.0));
	});

	const Permute = Fn(([data, id]: [Vec4Node, Vec2Node]) => {
		const s = id.x.add(id.y).mod(2);
		const factor = float(1.0).sub(float(2.0).mul(s));
		return data.mul(factor); // vec4 * (+1 or -1)
	});

	const UpdateDisplacementAndSlopeMaps = Fn(() => {
		const uiW = uint(W);
		const idx = instanceIndex;
		const y = idx.div(uiW);
		const x = idx.sub(y.mul(uiW));

		const htildeDisplacement = Permute(displacementSpectrumA.element(instanceIndex), vec2(x, y));
		const htildeSlope = Permute(slopeSpectrumA.element(instanceIndex), vec2(x, y));

		const dxdz = htildeDisplacement.rg;
		const dydxz = htildeDisplacement.ba;
		const dyxdyz = htildeSlope.rg;
		const dxxdzz = htildeSlope.ba;

		// const jacobian = (float(1.0).add(uLambda.x.mul(dxxdzz.x)))
		// 	.mul(float(1.0).add(uLambda.y.mul(dxxdzz.y)))
		// 	.sub(uLambda.x.mul(uLambda.y).mul(dydxz.y).mul(dydxz.x));

		const displacement = vec3(uLambda.x.mul(dxdz.x), dydxz.x, uLambda.y.mul(dxdz.y));

		const slopes = (dyxdyz.xy).div(float(1.0).add(abs(dxxdzz.mul(uLambda))));

		// let foam = displacementBuffer.element(idx).a;
		// foam = foam.mul(float(uFoamDecayRate));
		// foam = saturate(foam);
		//
		// const biasedJacobian = max(float(0.0), negate(jacobian.sub(uFoamBias)));
		//
		// if (biasedJacobian.lessThan(uFoamThreshold)) {
		// 	foam = uFoamAdd.mul(biasedJacobian);
		// }

		displacementBuffer.element(idx).assign(vec4(displacement, 1.0));
		slopeBuffer.element(idx).assign(vec4(slopes.x, slopes.y, 0.0, 1.0));
	});

	const debugSpectrumColor = Fn(([buffer, scale]: [THREE.StorageBufferNode, FloatNode]) => {
		const uiW = uint(W);
		const uiH = uint(H);

		// uv in [0,1]
		const uvNode = uv().toVar();

		// float coords in [0, W/H)
		const fx = uvNode.x.mul(float(W));
		const fy = uvNode.y.mul(float(H));

		// clamp & floor to stay inside the grid
		const ix = fx.floor().clamp(0.0, float(W - 1));
		const iy = fy.floor().clamp(0.0, float(H - 1));

		// convert to uint for indexing
		const ux = uint(ix);
		const uy = uint(iy);

		// 1D index = y * W + x
		const idx = uy.mul(uiW).add(ux);

		// complex value H0(k) = (re, im)
		const h = buffer.element(idx); // vec2

		const mag = h.x.mul(h.x).add(h.y.mul(h.y)).sqrt();
		const v = mag.mul(scale).clamp(0.0, 1.0); // crank gain

		return vec4(v, v, v, 1.0);
	});

	const DebugBuffer = Fn(([buffer, scale]: [THREE.StorageBufferNode, FloatNode]) => {
		const uiW = uint(W);
		const uiH = uint(H);

		// uv in [0,1]
		const uvNode = uv().toVar();

		// float coords in [0, W/H)
		const fx = uvNode.x.mul(float(W));
		const fy = uvNode.y.mul(float(H));

		// clamp & floor to stay inside the grid
		const ix = fx.floor().clamp(0.0, float(W - 1));
		const iy = fy.floor().clamp(0.0, float(H - 1));

		// convert to uint for indexing
		const ux = uint(ix);
		const uy = uint(iy);

		// 1D index = y * W + x
		const idx = uy.mul(uiW).add(ux);

		// complex value H0(k) = (re, im)
		const h = buffer.element(idx); // vec2

		const mag = h.x.mul(h.x).add(h.y.mul(h.y)).sqrt();
		const v = mag.mul(scale).clamp(0.0, 1.0); // crank gain

		return vec4(h.xyz, 1.0);
	});

	const DebugSpectrumColor4 = Fn(([buffer]: [THREE.StorageBufferNode]) => {
		const uiW = uint(W);
		const uiH = uint(H);

		const uvNode = uv().toVar();
		const fx = uvNode.x.mul(float(W));
		const fy = uvNode.y.mul(float(H));

		const ix = fx.floor().clamp(0.0, float(W - 1));
		const iy = fy.floor().clamp(0.0, float(H - 1));
		const ux = uint(ix);
		const uy = uint(iy);

		const idx = uy.mul(uiW).add(ux);

		const h = buffer.element(idx); // vec4(reX, imX, reZ, imZ)
		const re = h.x, im = h.y;
		const mag = re.mul(re).add(im.mul(im)).sqrt();
		const v = mag.mul(0.001).clamp(0.0, 1.0);
		return vec4(v, v, v, 1.0);
	});

	const DebugDisplacementReal = Fn(([buffer]: [THREE.StorageBufferNode]) => {
		const uiW = uint(W);

		const uvNode = uv().toVar();
		const fx = uvNode.x.mul(float(W));
		const fy = uvNode.y.mul(float(H));

		const ix = fx.floor().clamp(0.0, float(W - 1));
		const iy = fy.floor().clamp(0.0, float(H - 1));
		const ux = uint(ix);
		const uy = uint(iy);

		const idx = uy.mul(uiW).add(ux);

		const d = buffer.element(idx); // vec4(dx, dy, dz, 1)

		// Just scale + bias dy as height visualization
		const h = d.y.mul(1).add(0.5).clamp(0.0, 1.0);

		return vec4(h, h, h, 1.0);
	});

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


	//const height = texture(heightTex).sample(uv());   // RG = Re,Im
	//const mag = height.r.mul(height.r).add(height.g.mul(height.g)).sqrt();

	//let h = texture(frequencyTexture).sample(uv()).r;
	let h = 1.0;
	// scale & clamp for visualization
	//const h = mag.mul(1.0).clamp(0.0, 1.0);
	const albedo = mix(
		vec4(0.1, 0.3, 0.6, 0.3),
		vec4(0.8, 0.9, 1.0, 0.6),
		h
	);

	//const albedo = mix(vec4(0.1, 0.3, 0.6, 0.3), vec4(0.8, 0.9, 1.0, 0.6), h);

	const initialFrequencyMat = new THREE.NodeMaterial();
	//mat.positionNode = positionLocal.add(normalLocal.mul(h));
	//mat.colorNode = float(10.0).mul(texture(frequencyTexture).sample(uv()).r);
	initialFrequencyMat.colorNode = DebugBuffer(frequencyBuffer);
	initialFrequencyMat.side = THREE.DoubleSide;

	const spectrumBufferAMat = new THREE.NodeMaterial();
	spectrumBufferAMat.colorNode = DebugBuffer(spectrumBufferA, 1);
	spectrumBufferAMat.side = THREE.DoubleSide;

	const spectrumBufferBMat = new THREE.NodeMaterial();
	spectrumBufferBMat.colorNode = DebugBuffer(spectrumBufferB, 1);
	spectrumBufferBMat.side = THREE.DoubleSide;

	const displacementSpectrumAMat = new THREE.NodeMaterial();
	displacementSpectrumAMat.colorNode = DebugSpectrumColor4(displacementSpectrumA);
	displacementSpectrumAMat.side = THREE.DoubleSide;

	const displacementSpectrumBMat = new THREE.NodeMaterial();
	displacementSpectrumBMat.colorNode = DebugSpectrumColor4(displacementSpectrumB);
	displacementSpectrumBMat.side = THREE.DoubleSide;

	const displacementBufferMat = new THREE.NodeMaterial();
	displacementBufferMat.colorNode = DebugDisplacementReal(displacementBuffer);
	displacementBufferMat.side = THREE.DoubleSide;

	const slopeSpectrumAMat = new THREE.NodeMaterial();
	slopeSpectrumAMat.colorNode = DebugSpectrumColor4(slopeSpectrumA);
	slopeSpectrumAMat.side = THREE.DoubleSide;

	const slopeSpectrumBMat = new THREE.NodeMaterial();
	slopeSpectrumBMat.colorNode = DebugSpectrumColor4(slopeSpectrumB);
	slopeSpectrumBMat.side = THREE.DoubleSide;

	const slopeBufferMat = new THREE.NodeMaterial();
	slopeBufferMat.colorNode = DebugBuffer(slopeBuffer, 1);
	slopeBufferMat.side = THREE.DoubleSide;

	const geo = new THREE.PlaneGeometry(20, 20, 100, 100).toNonIndexed();
	geo.rotateX(-Math.PI / 2);

	addCenterAttribute(geo);
	console.log(geo.getAttribute('center')?.itemSize);

	const initialFrequencyMesh = new THREE.Mesh(geo, initialFrequencyMat);
	const spectrumBufferAMesh = new THREE.Mesh(geo, spectrumBufferAMat);
	const spectrumBufferBMesh = new THREE.Mesh(geo, spectrumBufferBMat);
	const displacementSpectrumAMesh = new THREE.Mesh(geo, displacementSpectrumAMat);
	const displacementSpectrumBMesh = new THREE.Mesh(geo, displacementSpectrumBMat);
	const displacementBufferMesh = new THREE.Mesh(geo, displacementBufferMat);
	const slopeSpectrumAMesh = new THREE.Mesh(geo, slopeSpectrumAMat);
	const slopeSpectrumBMesh = new THREE.Mesh(geo, slopeSpectrumBMat);
	const slopeBufferMesh = new THREE.Mesh(geo, slopeBufferMat);
	initialFrequencyMesh.translateX(-20);
	spectrumBufferBMesh.translateX(20);
	displacementSpectrumAMesh.translateZ(20);
	displacementSpectrumAMesh.translateX(-20);
	displacementSpectrumBMesh.translateZ(20);
	displacementBufferMesh.translateX(20);
	displacementBufferMesh.translateZ(20);
	slopeSpectrumAMesh.translateZ(40);
	slopeSpectrumAMesh.translateX(-20);
	slopeSpectrumBMesh.translateZ(40);
	slopeBufferMesh.translateX(20);
	slopeBufferMesh.translateZ(40);

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
	let cameraPosition = new THREE.Vector3(0, 45, 50);
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

	const InitializeSpectrumPass = compute(
		InitializeSpectrum(),
		W * H,
		[16, 16, 1]
	);

	const InitializeSpectrumConjugatePass = compute(
		InitializeSpectrumConjugate(),
		W * H,
		[16, 16, 1]
	);

	const CopyToBufferPass = compute(
		CopyFreqToSpectrumA(),
		W * H,
		[16, 16, 1]
	);

	const UpdateSpectrumForFFTPass = compute(
		UpdateSpectrumForFFT(),
		W * H,
		[16, 16, 1]
	);

	// horizontal stage, ping: A -> B
	const HorizontalPass_DisplacementAB = compute(
		FFT_Horizontal({ inBuffer: displacementSpectrumA, outBuffer: displacementSpectrumB }),
		(W / 2) * H
	);

	// horizontal stage, pong: B -> A
	const HorizontalPass_DisplacementBA = compute(
		FFT_Horizontal({ inBuffer: displacementSpectrumB, outBuffer: displacementSpectrumA }),
		(W / 2) * H
	);

	// horizontal stage, ping: A -> B
	const HorizontalPass_SlopeAB = compute(
		FFT_Horizontal({ inBuffer: slopeSpectrumA, outBuffer: slopeSpectrumB }),
		(W / 2) * H
	);

	// horizontal stage, pong: B -> A
	const HorizontalPass_SlopeBA = compute(
		FFT_Horizontal({ inBuffer: slopeSpectrumB, outBuffer: slopeSpectrumA }),
		(W / 2) * H
	);

	// vertical stage, ping: A -> B
	const VerticalPass_DisplacementAB = compute(
		FFT_Vertical({ inBuffer: displacementSpectrumA, outBuffer: displacementSpectrumB }),
		(H / 2) * W
	);

	// vertical stage, pong: B -> A
	const VerticalPass_DisplacementBA = compute(
		FFT_Vertical({ inBuffer: displacementSpectrumB, outBuffer: displacementSpectrumA }),
		(H / 2) * W
	);

	// vertical stage, ping: A -> B
	const VerticalPass_SlopeAB = compute(
		FFT_Vertical({ inBuffer: slopeSpectrumA, outBuffer: slopeSpectrumB }),
		(H / 2) * W
	);

	// vertical stage, pong: B -> A
	const VerticalPass_SlopeBA = compute(
		FFT_Vertical({ inBuffer: slopeSpectrumB, outBuffer: slopeSpectrumA }),
		(H / 2) * W
	);

	const UpdateDisplacementAndSlopeMapsPass = compute(
		UpdateDisplacementAndSlopeMaps(),
		W * H,
		[16, 16, 1]
	);

	const NormalizeToHeightPass = compute(
		NormalizeToHeight(),
		W * H,
		[16, 16, 1]
	);

	const stats = new Stats();
	dom.appendChild(stats.dom);
	stats.begin();

	let initialized = false;


	useTask(() => {
		stats.end();

		if (!initialized) {
			webgpuRenderer.compute(InitializeSpectrumPass);
			webgpuRenderer.compute(InitializeSpectrumConjugatePass);
			initialized = true;
		}

		uTime.value += 0.01;
		//webgpuRenderer.compute(CopyToBufferPass);
		webgpuRenderer.compute(UpdateSpectrumForFFTPass);

		for (let s = 0; s < log2W; s++) {
			uStage.value = s;
			uLog2Size.value = log2W;
			// const halfSize = 1 << s;
			// const stepSize = halfSize << 1;
			//
			// uHalfSize.value = halfSize;
			// uStepSize.value = stepSize;

			if (s % 2 === 0) {
				//console.log('Horizontal: AB', s, halfSize, stepSize);
				webgpuRenderer.compute(HorizontalPass_DisplacementAB);
				webgpuRenderer.compute(HorizontalPass_SlopeAB);
			} else {
				//console.log('Horizontal: BA', s, halfSize, stepSize);
				webgpuRenderer.compute(HorizontalPass_DisplacementBA);
				webgpuRenderer.compute(HorizontalPass_SlopeBA);
			}
		}

		for (let s = 0; s < log2H; s++) {
			uStage.value = s;
			uLog2Size.value = log2W;
			// const halfSize = 1 << s;
			// const stepSize = halfSize << 1;
			//
			// uHalfSize.value = halfSize;
			// uStepSize.value = stepSize;

			if (s % 2 === 0) {
				//console.log('Vertical: AB', s, halfSize, stepSize);
				webgpuRenderer.compute(VerticalPass_DisplacementAB);
				webgpuRenderer.compute(VerticalPass_SlopeAB);
			} else {
				//console.log('Vertical: BA', s, halfSize, stepSize);
				webgpuRenderer.compute(VerticalPass_DisplacementBA);
				webgpuRenderer.compute(VerticalPass_SlopeBA);
			}
		}


		webgpuRenderer.compute(UpdateDisplacementAndSlopeMapsPass);

		//webgpuRenderer.compute(NormalizeToHeightPass);

		stats.begin();
	});

	onDestroy(() => {
		if (stats?.dom?.parentNode === dom) {
			dom.removeChild(stats.dom);
		}

		waterGeometry.dispose();
		waterOutputGeometry.dispose();
		underwaterGeometry.dispose();
		sandGeometry.dispose();
		heightTex.dispose();
		kDisplacementTexture.dispose();
		spectrumBufferAMat.dispose();
		waterSinesMat.dispose();
		InitializeSpectrumPass.dispose();
		InitializeSpectrumConjugatePass.dispose();
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
<T is={waterSinesMesh} />
<T is={initialFrequencyMesh} />
<T is={spectrumBufferAMesh} />
<T is={spectrumBufferBMesh} />
<T is={displacementSpectrumAMesh} />
<T is={displacementSpectrumBMesh} />
<T is={displacementBufferMesh} />
<T is={slopeSpectrumAMesh} />
<T is={slopeSpectrumBMesh} />
<T is={slopeBufferMesh} />

<!-- <T.Mesh
	ref={mesh}
>
</T.Mesh> -->

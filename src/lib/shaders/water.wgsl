// water.wgsl

// ─── Uniforms ────────────────────────────────────────────────────────────────
@group(0) @binding(0) var<uniform> uTime:           f32;
@group(0) @binding(1) var<uniform> uWaveAlgorithm:  i32;
@group(0) @binding(2) var<uniform> uNumWaves:       i32;
@group(0) @binding(3) var<uniform> uNumVertexWaves: i32; // unused here
@group(0) @binding(4) var<uniform> uNumFragmentWaves: i32; // for fragment if needed
@group(0) @binding(5) var<uniform> uWaveType:       i32;
@group(0) @binding(6) var<uniform> modelMatrix:     mat4x4<f32>;
@group(0) @binding(7) var<uniform> viewMatrix:      mat4x4<f32>;
@group(0) @binding(8) var<uniform> projectionMatrix: mat4x4<f32>;

// ─── Inputs ──────────────────────────────────────────────────────────────────
struct VSIn {
  @location(0) position: vec3<f32>;
  @location(1) normal:   vec3<f32>;
  @location(2) uv:       vec2<f32>;
  @location(3) center:   vec3<f32>;
};

// ─── Outputs ─────────────────────────────────────────────────────────────────
struct VSOut {
  @builtin(position) Position: vec4<f32>;
  @location(0) vWorldPosition: vec3<f32>;
  @location(1) vUV:            vec2<f32>;
  @location(2) vNormal:        vec3<f32>;
  @location(3) vHeight:        f32;
  @location(4) vCenter:        vec3<f32>;
};

// ─── Wave struct & data ──────────────────────────────────────────────────────
struct Wave {
  direction: vec2<f32>;
  origin:    vec2<f32>;
  amplitude: f32;
  frequency: f32;
  speed:     f32;
  exponent:  f32;
};

let waves: array<Wave, 4> = array<Wave,4>(
  Wave(vec2<f32>( 1.0,  0.0), vec2<f32>( 0.0,  0.0), 0.30, 0.1, 1.0, 20.0),
  Wave(vec2<f32>( 0.7,  0.7), vec2<f32>( 2.0,  1.5), 0.18, 0.6, 1.2, 10.0),
  Wave(vec2<f32>(-1.0,  0.5), vec2<f32>(-3.0,  5.0), 0.07, 1.9, 3.0,  5.0),
  Wave(vec2<f32>( 0.3, -1.0), vec2<f32>(-1.5, -4.2), 0.02, 2.6, 0.8,  2.0)
);

// ─── Wave helpers ────────────────────────────────────────────────────────────
fn getWaveHeight(pos: vec3<f32>, w: Wave) -> f32 {
  let dir = select(
    normalize(pos.xz - w.origin),
    w.direction,
    uWaveType == 0
  );
  let phase = dot(pos.xz, dir) * w.frequency + uTime * w.speed;
  if (uWaveAlgorithm == 0) {
    return w.amplitude * sin(phase);
  } else {
    // exponential
    let t = (sin(phase) + 1.0) * 0.5;
    return 2.0 * w.amplitude * pow(t, w.exponent);
  }
}

fn getWaveNormal(pos: vec3<f32>, w: Wave) -> vec3<f32> {
  let dir = select(
    normalize(pos.xz - w.origin),
    w.direction,
    uWaveType == 0
  );
  let phase = dot(pos.xz, dir) * w.frequency + uTime * w.speed;
  var d: vec2<f32>;
  if (uWaveAlgorithm == 0) {
    d = w.amplitude * w.frequency * dir * cos(phase);
  } else {
    let t = (sin(phase) + 1.0) * 0.5;
    let expo = max(1.0, w.exponent - 1.0);
    let h   = pow(t, expo);
    d = w.amplitude * w.frequency * dir * w.exponent * h * cos(phase);
  }
  return vec3<f32>(d, 0.0);
}

// ─── Vertex shader ───────────────────────────────────────────────────────────
@vertex
fn vs_main(in: VSIn) -> VSOut {
  var out: VSOut;

  // pass through UV & center
  out.vUV     = in.uv;
  out.vCenter = in.center;

  // accumulate waves
  var height: f32 = 0.0;
  var nrmSum: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

  // only iterate up to uNumWaves (clamped to 4)
  let count = clamp(uNumWaves, 0, 4);
  for (var i: i32 = 0; i < count; i = i + 1) {
    height = height + getWaveHeight(in.position, waves[i]);
    nrmSum  = nrmSum  + getWaveNormal(in.position, waves[i]);
  }

  // compute final normal
  let flatNormal = normalize(vec3<f32>(-nrmSum.x, 1.0, -nrmSum.y));
  let worldNormal = normalize((modelMatrix * vec4<f32>(flatNormal, 0.0)).xyz);
  out.vNormal = worldNormal;

  // displaced position
  let worldPos = (modelMatrix * vec4<f32>(in.position + vec3<f32>(0.0, height, 0.0), 1.0)).xyz;
  out.vWorldPosition = worldPos;
  out.vHeight = height;

  // final clip position
  let mvPos = viewMatrix * vec4<f32>(worldPos, 1.0);
  out.Position = projectionMatrix * mvPos;
  return out;
}

// ─── Fragment shader ─────────────────────────────────────────────────────────
@fragment
fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
  // visualize normal as RGB
  let n = normalize(in.vNormal) * 0.5 + vec3<f32>(0.5);
  // height as grayscale in alpha
  return vec4<f32>(n, 1.0);
}

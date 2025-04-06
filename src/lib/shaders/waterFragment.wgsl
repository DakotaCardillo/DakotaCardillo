// Define a uniform block containing our transformation matrices and a time value.
struct Uniforms {
    modelMatrix : mat4x4<f32>;
    modelViewMatrix : mat4x4<f32>;
    projectionMatrix : mat4x4<f32>;
    uTime : f32;
};

[[group(0), binding(0)]]
var<uniform> uniforms : Uniforms;

// Define our input attributes.
struct VertexInput {
    [[location(0)]] position : vec3<f32>;
    [[location(1)]] normal : vec3<f32>;
};

// Define the output of the vertex shader.
struct VertexOutput {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] vNormal : vec3<f32>;
    [[location(1)]] vWorldPosition : vec3<f32>;
};

[[stage(vertex)]]
fn main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    // Compute the vertex position in world space.
    let pos = vec4<f32>(input.position, 1.0);
    let worldPos = uniforms.modelMatrix * pos;
    output.vWorldPosition = worldPos.xyz;

    // Transform the normal (note: for true accuracy you’d use the normal matrix,
    // but for this basic example we simply multiply by the model matrix).
    output.vNormal = normalize((uniforms.modelMatrix * vec4<f32>(input.normal, 0.0)).xyz);

    // Compute the final position using the modelView and projection matrices.
    output.Position = uniforms.projectionMatrix * uniforms.modelViewMatrix * pos;

    return output;
}
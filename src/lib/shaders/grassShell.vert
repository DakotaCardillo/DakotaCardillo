uniform float uHeight;
uniform float uDistanceDelta;
uniform float uIndex;
uniform float uThickness;
uniform float uTime;
varying vec2 vUV;

void main() {
    vUV = uv;

    // Density of the grid
    float density = 100.0;

    // Quantize the UV coordinates to a grid with the given density
    vec2 gridUV = floor(vUV * density);

    // Get the fractional portion of the UV to determine how far from the center this fragment is
    vec2 fractionalUV = (fract(vUV * density) * 2.0) - 1.0;

    // Create a seed value with the quantized UV and density
    vec2 seed = gridUV * density;
    float rnd = random(seed);

    float xOffset = sin(dot(position.xz, vec2(1.0, 1.0)) * 1.1 + uTime * 1.0) * uIndex * uDistanceDelta * 0.2;
    float zOffset = sin(dot(position.xz, vec2(0.0, 1.0)) * 1.3 + uTime * 1.6) * uIndex * uDistanceDelta * 0.3;
    zOffset += sin(dot(position.xz, vec2(1.0, 1.0)) * 0.2 + uTime * 0.7) * uIndex * uDistanceDelta * 0.1;
    xOffset += sin(dot(position.xz, vec2(1.0, 0.0)) * 0.11 + uTime * 0.2) * uIndex * uDistanceDelta * 0.1;
    xOffset /= 2.0;
    zOffset /= 2.0;
    //float xOffset = sin(uTime) * uIndex * uDistanceDelta * 0.03;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + xOffset, position.y + zOffset, position.z, 1.0);
}
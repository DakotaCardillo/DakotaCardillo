uniform float uHeight;
uniform float uThickness;
varying vec2 vUV;

void main() {

    // Density of the grid
    float density = 100.0;

    // Quantize the UV coordinates to a grid with the given density
    vec2 gridUV = floor(vUV * density);
    vec2 fractionalUV = (fract(vUV * density) * 2.0) - 1.0;

    // Create a seed value with the quantized UV and density
    vec2 seed = gridUV * density;
    float rnd = random(seed);

    // H-0: 1 * 0.2
    // H-25: 0.75 * 0.2
    // H-50: 0.5 * 0.2
    if (rnd > uHeight && length(fractionalUV) < (1.0 - uHeight) * uThickness)
    {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0) * uHeight;
    }
    else
    {
       discard;
    }
}
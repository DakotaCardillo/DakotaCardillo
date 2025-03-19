uniform float uHeight;
uniform float uDistanceDelta;
uniform float uIndex;
uniform float uThickness;
uniform float uOpacity;
varying vec2 vUV;

void main() {

    // Get the height of the current shell and the percentage of the total height
    float shellHeight = (uIndex * uDistanceDelta);
    float percentOfHeight = (shellHeight / uHeight);

    // Density of the grid
    float density = 100.0;

    // Quantize the UV coordinates to a grid with the given density
    vec2 gridUV = floor(vUV * density);

    // Get the fractional portion of the UV to determine how far from the center this fragment is
    vec2 fractionalUV = (fract(vUV * density) * 2.0) - 1.0;

    // Create a seed value with the quantized UV and density
    vec2 seed = gridUV * density;
    float rnd = random(seed);

    if (rnd > shellHeight && length(fractionalUV) < 1.0 - percentOfHeight)
    {
        gl_FragColor = vec4(0.1, 0.98, 0.42, uOpacity) * percentOfHeight;
    }
    else
    {
       discard;
    }
}
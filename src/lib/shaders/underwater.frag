uniform vec3 uLightPosition;
uniform sampler2D uWaterTextureMap;

varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;

vec2 rotateUV(vec2 uv, float angle, vec2 pivot) {
    uv -= pivot;
    float c = cos(angle);
    float s = sin(angle);
    uv = mat2(c, -s, s, c) * uv;
    uv += pivot;
    return uv;
}

void main() {
    vec3 lightDirection = normalize(uLightPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    vec2 waterUV = ((vWorldPosition.xz + 10.0) / 20.0).xy;
    waterUV.y = 1.0 - waterUV.y;

    vec2 heightData = texture2D(uWaterTextureMap, waterUV).xy;

    if (vWorldPosition.y > heightData.y)
    {
        discard;
        return;
    }

    float depth = heightData.y - vWorldPosition.y;
    depth = clamp(depth, 0.0, 10.0);

    float fogFactor = 1.0 - exp(-depth * 0.3);

    vec3 color = mix(vec3(0.0, 0.7, 0.8), vec3(0.0, 0.2, 0.6), fogFactor);

    gl_FragColor = vec4(color, 0.6);
}
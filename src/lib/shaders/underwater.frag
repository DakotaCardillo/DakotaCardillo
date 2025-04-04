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

    gl_FragColor = vec4(waterUV, 0.0, 1.0);
}
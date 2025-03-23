uniform vec3 uLightPosition;
varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
void main() {
    vec3 lightDirection = normalize(uLightPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);
    gl_FragColor = vec4(vec3(0.1, 0.3, 0.98) * max(dot(lightDirection, normal), 0.0), 1.0);
}
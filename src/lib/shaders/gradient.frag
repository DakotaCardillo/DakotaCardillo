uniform vec2 resolution;
uniform vec3 colorInner;
uniform vec3 colorOuter;
uniform vec3 center;

varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
void main() {
    float distanceFromCenter = length(vWorldPosition.xz - center.xz);
    float gradient = smoothstep(0.0, 5.0, distanceFromCenter);

    vec3 color = mix(colorInner, colorOuter, gradient);

    gl_FragColor = vec4(color, 1.0);
}
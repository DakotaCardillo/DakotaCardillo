uniform float uHeight;
uniform float uDistanceDelta;
uniform float uIndex;
uniform float uThickness;
uniform float uTime;
varying vec2 vUV;

void main() {
    vUV = uv;
    float xOffset = sin(uTime) * uIndex * uDistanceDelta * 0.03;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + xOffset, position.yz, 1.0);
}
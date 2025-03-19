uniform float uHeight;
uniform float uTime;
varying vec2 vUV;

void main() {
    vUV = uv;
    float xOffset = sin(uTime) * uHeight * 0.01;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + xOffset, position.yz, 1.0);
}
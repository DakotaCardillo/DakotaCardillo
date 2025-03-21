varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
void main() {
    vWorldPosition = position;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vUV = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
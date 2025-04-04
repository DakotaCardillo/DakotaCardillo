uniform sampler2D uWaterTextureMap;

varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
void main() {

    vec2 heights = texture2D(uWaterTextureMap, uv).xy;
    vNormal = normalize(mat3(modelMatrix) * normal);

    vec3 pos = position;
//    if (vNormal.y == 1.0)
//    {
//        pos = vec3(position.x, position.y + heights.y, position.z);
//    }
//    else
//    {
//        pos = position;
//    }
    vUV = uv;

    ///vWorldPosition = pos;
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vWorldPosition, 1.0);
}
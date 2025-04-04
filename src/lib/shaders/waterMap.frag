uniform sampler2D uWaterTextureMap;

varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
void main() {
    vec3 normal = normalize(vNormal);
    vec4 outputColor = texture2D(uWaterTextureMap, vUV).rgba;
    //normal = vec3(outputColor.x, outputColor.y, outputColor.z);

    gl_FragColor = vec4(0.0,outputColor.g + 10.0 / 20.0, 0.0, 1.0);
}


// Orto camera looks are regular water without lighting
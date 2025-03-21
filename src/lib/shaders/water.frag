uniform vec3 uSunPosition;
uniform vec3 uCameraPosition;
varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
void main() {
    vec3 sunDirection = normalize(uSunPosition - vWorldPosition);
    //vec3 cameraDirection = normalize(uCameraPosition - vUV.xyz);
    //vec3 halfwayDirection = normalize(sunDirection + cameraDirection);


    vec3 normal = normalize(vNormal) * 3.0;
    //gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
    gl_FragColor = vec4(0.1, 0.3, 0.98, 1.0) * max(dot(sunDirection, normal), 0.0);
}
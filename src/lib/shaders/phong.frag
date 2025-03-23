// Blinn-phong uniforms
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uCameraPosition;
uniform vec3 uDiffuseColor;
uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

// Standard uniforms
varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;

const float screenGamma = 2.2;

void main() {
    vec3 lightDirection = (uLightPosition - vWorldPosition);
    float distance = dot(lightDirection, lightDirection);
    lightDirection = normalize(lightDirection);

    float lambertian = max(dot(lightDirection, vNormal), 0.0);
    float specular = 0.0;

    if (lambertian > 0.0) {
        vec3 cameraDirection = normalize(uCameraPosition - vWorldPosition);
        vec3 halfwayDirection = normalize(lightDirection + cameraDirection);
        float specularAngle = max(dot(halfwayDirection, vNormal), 0.0);
        specular = pow(specularAngle, uShininess);
    }

    vec3 colorLinear = uAmbientColor +
        uDiffuseColor * lambertian * uLightColor * uLightIntensity / distance +
        uSpecularColor * specular * uLightColor * uLightIntensity / distance;

    vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0 / screenGamma));

    // Threejs might apply gamma already, stick to linear for now
    gl_FragColor = vec4(colorLinear, 1.0);
}
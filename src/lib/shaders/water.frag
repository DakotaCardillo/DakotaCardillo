// Blinn-Phong uniforms
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uCameraPosition;
uniform vec3 uDiffuseColor;
uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

// Wave uniforms
uniform int uWaveAlgorithm;
uniform int uNumWaves;
uniform int uNumVertexWaves;
uniform int uNumFragmentWaves;
uniform int uWaveType;

// Standard uniforms
uniform float uTime;

varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;
varying mat4 vModelMatrix;

const float screenGamma = 2.2;

struct Wave
{
    vec2 direction;
    vec2 origin;
    float amplitude;
    float frequency;
    float speed;
    float exponent;
};

vec3 GetFBM()
{
    float height = 0.0;
    vec2 normal = vec2(0.0);
    float amplitudeSum = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float speed = 2.0;
    float waveSeed = 0.0;
    vec3 point = vWorldPosition;

    for (int i = 0; i < uNumFragmentWaves; i++)
    {
        vec2 randomDirection = normalize(vec2(cos(waveSeed), sin(waveSeed)));
        float x = dot(point.xz, randomDirection) * frequency + uTime * speed;
        float wave = amplitude * exp(sin(x) - 1.0);
        height += wave;

        vec2 waveDerivative = wave * frequency * randomDirection * cos(x);
        point.xz += -waveDerivative * amplitude * 0.3;
        normal += waveDerivative;

        amplitudeSum += amplitude;
        amplitude *= 0.82;
        frequency *= 1.18;
        waveSeed += 1253.2131f;
    }

    return vec3(height, normal.x, normal.y) / amplitudeSum;
}

void main() {
    vec3 lightDirection = (uLightPosition - vWorldPosition);
    float distance = dot(lightDirection, lightDirection);
    lightDirection = normalize(lightDirection);

    vec3 normal = vNormal;

    // Fractional Brownian Motion
    if (uWaveAlgorithm == 2)
    {
        vec3 result = GetFBM();
        normal = normalize(vec3(-result.y, 1.0, -result.z));
        normal = normalize(mat3(vModelMatrix) * normal);
    }

    float lambertian = max(dot(lightDirection, normal), 0.0);
    float specular = 0.0;

    if (lambertian > 0.0) {
        vec3 cameraDirection = normalize(uCameraPosition - vWorldPosition);
        vec3 halfwayDirection = normalize(lightDirection + cameraDirection);
        float specularAngle = max(dot(halfwayDirection, normal), 0.0);
        specular = pow(specularAngle, uShininess);
    }

    vec3 colorLinear = uAmbientColor +
    uDiffuseColor * lambertian * uLightColor +
    uSpecularColor * specular * uLightColor;

    vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0 / screenGamma));

    gl_FragColor = vec4(colorLinear, 1.0);
}
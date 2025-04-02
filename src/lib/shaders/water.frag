// Blinn-Phong uniforms
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uCameraPosition;
uniform vec3 uDiffuseColor;
uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

// Reflections
uniform samplerCube uSkybox;

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

Wave waves[4] = Wave[4](
Wave(vec2(1.0, 0.0), vec2(0.0, 0.0), 0.3, 0.1, 1.0, 20.0),
Wave(vec2(0.7, 0.7), vec2(2.0, 1.5), 0.18, 0.6, 1.2, 10.0),
Wave(vec2(-1.0, 0.5), vec2(-3.0, 5.0), 0.07, 1.9, 3.0, 5.0),
Wave(vec2(0.3, -1.0), vec2(-1.5, -4.2), 0.02, 2.6, 0.8, 2.0)
);

float randomFloatFromFloat(float seed) {
    return fract(sin(seed) * 43758.5453123);
}

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
        float angle = randomFloatFromFloat(waveSeed) * 6.2831853; // 2π
        vec2 randomDirection = normalize(vec2(cos(angle), sin(angle)));
        float x = dot(point.xz, randomDirection) * frequency + uTime * speed;
        float wave = amplitude * exp(sin(x) - 1.0);
        height += wave;

        vec2 waveDerivative = wave * frequency * randomDirection * cos(x);
        point.xz += -waveDerivative * amplitude * 0.3;
        normal += waveDerivative;

        amplitudeSum += amplitude;
        amplitude *= 0.82;
        frequency *= 1.18;
        waveSeed += 32137.27180;
    }

    return vec3(height, normal.x, normal.y) / amplitudeSum;
}

vec3 GetWaveNormal(vec3 pos, Wave wave)
{
    vec2 direction = uWaveType == 0 ? wave.direction : normalize(pos.xz - wave.origin);
    vec2 normalDir = vec2(0.0);
    switch(uWaveAlgorithm)
    {
    // Sum of sines
        case 0:
            normalDir = wave.amplitude * wave.frequency * direction * cos(dot(pos.xz, direction) * wave.frequency + uTime * wave.speed);
            break;
    // Exponential sum of sines
        case 1:
            float waveHeight = pow((sin(dot(pos.xz, direction) * wave.frequency + uTime * wave.speed) + 1.0) / 2.0, max(1.0, wave.exponent - 1.0));
            normalDir = wave.amplitude * wave.frequency * direction * wave.exponent * waveHeight * cos(dot(pos.xz, direction) * wave.frequency + uTime * wave.speed);
            break;
    }

    //vec2 normalDir = wave.amplitude * wave.frequency * direction * cos(dot(pos.xz, direction) * wave.frequency + uTime * wave.speed);
    return vec3(normalDir, 0.0);
}

void main() {
    vec3 normal = normalize(vNormal);

    vec3 lightDirection = (uLightPosition - vWorldPosition);
    float distance = dot(lightDirection, lightDirection);
    lightDirection = normalize(lightDirection);

    float waveHeight = 0.0;
    // Fractional Brownian Motion
    if (uWaveAlgorithm == 2)
    {
        vec3 result = GetFBM();
        normal = normalize(vec3(-result.y, 1.0, -result.z));
        waveHeight = result.x;
        normal = normalize(mat3(vModelMatrix) * normal);
    }
    else
    {
        normal = vec3(0.0);
        for (int i = 0; i < uNumWaves; i++)
        {
            normal += GetWaveNormal(vWorldPosition, waves[i]);
        }
        normal = normalize(vec3(-normal.x, 1.0, -normal.y));
    }

    float lambertian = max(dot(lightDirection, normal), 0.0);
    float specular = 0.0;

    vec3 cameraDirection = normalize(uCameraPosition - vWorldPosition);
    if (lambertian > 0.0) {
        vec3 halfwayDirection = normalize(lightDirection + cameraDirection);
        float specularAngle = max(dot(halfwayDirection, normal), 0.0);
        specular = pow(specularAngle, uShininess);
    }

    vec3 colorLinear = uAmbientColor +
    uDiffuseColor * lambertian * uLightColor +
    uSpecularColor * specular * uLightColor;

    vec3 tipColor = vec3(0.0, 0.7, 0.4);
    colorLinear += tipColor * pow(waveHeight, 5.0);

    // Fresnel
    vec3 fresnelNormal = normal;
    //fresnelNormal.xz *= _FresnelNormalStrength;
    //fresnelNormal = normalize(fresnelNormal);
    float base = 1.0 - dot(cameraDirection, fresnelNormal);
    float exponential = pow(base, 5.0);
    float R = exponential + 1.0 * (1.0f - exponential);
    R *= 1.0;

    vec3 fresnel = vec3(1.0) * R;

    vec3 reflection = reflect(-cameraDirection, normal);
    vec3 skyColor = textureCube(uSkybox, reflection).rgb;

    fresnel = skyColor.rgb * R;

    colorLinear += fresnel;

    //float reflectivity = 0.5; // adjust as needed
    //vec3 finalColor = mix(colorLinear, skyColor, reflectivity);

    gl_FragColor = vec4(colorLinear, 1.0);
}
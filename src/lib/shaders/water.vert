uniform float uTime;
uniform vec3 uSunPosition;
uniform vec3 uCameraPosition;
varying vec3 vWorldPosition;
varying vec2 vUV;
varying vec3 vNormal;

struct Wave
{
    vec2 direction;
    float amplitude;
    float frequency;
    float speed;
};

float Sin(vec3 pos, Wave wave)
{
    return wave.amplitude * sin(dot(pos.xz, wave.direction) * wave.frequency + uTime * wave.speed);
}

vec3 GetWaveNormal(vec3 pos, Wave wave)
{
    vec2 normalDir = wave.amplitude * wave.frequency * wave.direction * cos(dot(pos.xz, wave.direction) * wave.frequency + uTime * wave.speed);
    return vec3(normalDir, 0.0);
}

Wave waves[4] = Wave[4](
Wave(vec2(1.0, 0.0), 0.1, 2.0, 1.0),
Wave(vec2(0.7, 0.7), 0.20, 3.0, 1.2),
Wave(vec2(-1.0, 0.5), 0.05, 4.8, 3.0),
Wave(vec2(0.3, -1.0), 0.08, 1.5, 0.8)
);

void main() {
    vUV = uv;

    float waveHeight = 0.0;
    vec3 normal = vec3(0.0);

    for (int i = 0; i < 4; i++)
    {
        waveHeight += Sin(position, waves[i]);
        normal += GetWaveNormal(position, waves[i]);
    }

    vNormal = vec3(-normal.x, 1.0, -normal.y);

    vWorldPosition = vec3(position.x, position.y + waveHeight, position.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vWorldPosition, 1.0);
}
precision highp float;

uniform float uTime;
uniform sampler2D uScene;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uRadius;

varying vec2 vUV;

#define CA_AMT 1.010
#define BLUR 0.02
#define CURVATURE 4.2

void main() {
    //    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    //    vec2 center = vec2(0.5, 0.5);
    //    color = texture2D(uScene, vUV);

    //vec2 uv = vUV;



    //    vec2 st = (gl_FragCoord.xy / uResolution.xy);
    //
    //    //curving
    //    vec2 crtUV=st*2.-1.;
    //    vec2 offset=crtUV.yx/4.2;
    //    crtUV+=crtUV*offset*offset;
    //    crtUV=crtUV*.5+.5;
    //
    //    vec2 edge=smoothstep(0., 0.21, crtUV)*(1.-smoothstep(1.-0.21, 1., crtUV));

    // Curvature/light
    //float d = length(st);
    //uv = uv * d;
    //uv = st;

    //float ySkew = clamp((gl_FragCoord.y / uResolution.y), -1.0, 1.0);
    //uv.y += ySkew;

    //uv = st*d + st*.935;

    vec2 uv = vUV;


    vec2 crtUV=uv*2.-1.;
    vec2 offset=crtUV.yx/CURVATURE;
    crtUV+=crtUV*offset*offset;
    crtUV=crtUV*.5+.5;

    // Convert vUv from [0,1] to [-1,1]
    uv = vUV * 2.0 - 1.0;

    // Compute the radial distance from the center
    float r = length(uv);


    // Apply a distortion function
    // Increase 'curvature' to intensify the effect.
    float curvature = 0.15;
    float factor = 1.0 + curvature * (r * r) / (3.0 + curvature * (r * r));
    //float factor = 1.0 + curvature * pow(r, 1.2);
    //uv *= factor;
    // This is a simple quadratic distortion
    //uv *= 1.0 + curvature * r * r;

    // Convert uv back to [0,1] coordinates
    uv = (uv + 1.0) / 2.0;

    vec2 edge=smoothstep(0., BLUR, crtUV)*(1.-smoothstep(1.-BLUR, 1., crtUV));

    // Add a simple scanline effect
    float scanline = sin((crtUV.y + uTime * 0.01) * 800.0) * 0.02;

//    vec3 color =vec3(
//    texture2D(uScene, (uv-.5)*CA_AMT+.5).r,
//    texture2D(uScene, uv).g,
//    texture2D(uScene, (uv-.5)/CA_AMT+.5).b
//    );

    vec3 color = texture2D(uScene, uv).rgb;


    gl_FragColor = vec4(color, 1.0);
}

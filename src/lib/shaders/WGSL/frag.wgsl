fn frag_color(uv: vec2<f32>) -> vec4<f32> {
    // simple gradient: x,y -> r,g
    return vec4<f32>(uv.x, uv.y, 0.0, 1.0);
}
precision mediump float;

uniform float u_time;
uniform vec2 u_size;
uniform vec2 u_mouse;

vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1., 2./3., 1./3., 3.);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_size) * 2.0 - 1.0;
    uv *= 1.2;

    float col = 0.0;
    float tAnim = 0.5 + 0.5 * sin(u_time * 0.0001);
    float step = mix(0.0001, 0.5, tAnim);

    float k = step * 5.0 + u_mouse.x / 10.0;
    float scale = 0.6;

    for (int j = 0; j < 3000; j++) {
        if (j >= int(3000.0 * tAnim)) break;
        float angle = u_time * 0.2 + float(j) * step;
        float r = scale * cos(k * angle);
        vec2 pt = vec2(r * cos(angle), r * sin(angle));
        float dis = length(uv - pt);
        col += clamp(1.0 - dis * 50.0, 0.0, 1.0);
    }

    if (col > 0.01) {
        float radius = length(uv);
        float hue = mod(radius + u_time * 0.05, 1.0);
        vec3 color = hsv2rgb(vec3(hue, 1.0, col));
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(col, col * 0.5, sqrt(col), 1.0);
    }
}

precision mediump float;

uniform float u_time;
uniform vec2 u_size;
uniform vec2 u_mouse;

float dist(vec2 uv, float time, float offset) {
    vec2 off = vec2(0.0, 0.2);
    uv += off;
    time += offset;
    return abs(uv.y - sin(uv.x * cos(uv.x + time) * cos(uv.x + time) + time));
}

void main(void) {

    vec2 uv = vec2(gl_FragCoord.x / 400.0, gl_FragCoord.y / u_size.y * 2.0 - 1.0);

    float col = 0.0;
    float n = u_mouse.x * 100.0;
    for(int i = 0; i <= 100; i++) {
        if(float(i) > n){
            break;
        }
        float dis = dist(uv, u_time / 2.0, float(i) / u_mouse.y);
        col += float(i) / n * clamp(1.0 - dis * 70.0, 0.0, 1.0);
    }

    gl_FragColor = vec4(col, log(col), sqrt(col), 1.0);
}
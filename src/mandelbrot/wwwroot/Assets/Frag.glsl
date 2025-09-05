#version 300 es
precision highp float;
in vec2 vTexCoord;
out vec4 FragColor;

uniform vec2 u_center;
uniform float u_scale;
uniform int u_max_iterations;
uniform vec2 u_resolution;
uniform float u_time; // Animated time in seconds

vec3 palette(float t, float time) {
    // Animate hue over time
    float r = 0.5 + 0.5 * cos(6.28318*(t + time*0.1) + 0.0);
    float g = 0.5 + 0.5 * cos(6.28318*(t + time*0.1) + 2.0);
    float b = 0.5 + 0.5 * cos(6.28318*(t + time*0.1) + 4.0);
    return vec3(r,g,b);
}

void main() {
    vec2 aspect = vec2(u_resolution.x/u_resolution.y,1.0);
    vec2 uv = (vTexCoord-0.5)*aspect*u_scale + u_center;

    vec2 z = vec2(0.0);
    int i;
    for(i=0;i<u_max_iterations;i++){
        float x = (z.x*z.x - z.y*z.y) + uv.x;
        float y = (2.0*z.x*z.y) + uv.y;
        if(x*x + y*y > 4.0) break;
        z = vec2(x,y);
    }

    if(i == u_max_iterations) FragColor = vec4(0,0,0,1);
    else {
        float t = float(i)/float(u_max_iterations);
        FragColor = vec4(palette(t, u_time), 1.0);
    }
}
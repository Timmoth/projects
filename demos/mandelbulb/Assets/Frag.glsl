#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_cameraPos;  // camera position
uniform float u_zoom;      // scale factor

out vec4 fragColor;

mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}
float mengerDE(vec3 p) {
    float scale = 1.0;
    float d = 0.0;
    const int Iterations = 4;

    for (int i = 0; i < Iterations; i++) {
        p = abs(p);                // use symmetry
        if (p.x < p.y) p.xy = p.yx;
        if (p.x < p.z) p.xz = p.zx;
        if (p.y < p.z) p.yz = p.zy;

        p = p * 3.0 - 2.0;         // scale and center
    }

    return (length(max(p - 1.0, 0.0)) / scale);
}

// === Mandelbulb Distance Estimator ===
float mandelbulb(vec3 p) {
    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;
    p.xz = rot(u_time * 0.0002) * p.xz;

    const int Iterations = 8;
    const float Power = 8.0;

    for (int i = 0; i < Iterations; i++) {
        r = length(z);
        if (r > 2.0) break;

        float theta = acos(z.z / r) + u_time * 0.0002;
        float phi = atan(z.y, z.x);
        dr = pow(r, Power - 1.0) * Power * dr + 1.0;

        float zr = pow(r, Power);
        theta *= Power;
        phi   *= Power;

        z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
        z += p;
    }
    return 0.5 * log(r) * r / dr;
}

float ambientOcclusion(vec3 p, vec3 n) {
    float ao = 0.0;
    float sca = 1.0;
    for(int i = 1; i <= 5; i++) {
        float hr = 0.01 * float(i);          // distance along normal
        float d = mandelbulb(p + n * hr);   // distance to fractal surface
        ao += (hr - d) * sca;               // closer geometry = more occlusion
        sca *= 0.5;                         // decay factor
    }
    return clamp(1.0 - ao, 0.0, 1.0);
}


vec3 estimateNormal(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(
        mandelbulb(p + vec3(eps,0,0)) - mandelbulb(p - vec3(eps,0,0)),
        mandelbulb(p + vec3(0,eps,0)) - mandelbulb(p - vec3(0,eps,0)),
        mandelbulb(p + vec3(0,0,eps)) - mandelbulb(p - vec3(0,0,eps))
    ));
}

void main() {
    // Camera setup
    vec3 ro = u_cameraPos; // camera origin
    vec3 target = vec3(0.0);       // look at origin
    vec3 forward = normalize(target - ro);
    vec3 right   = normalize(cross(vec3(0,1,0), forward));
    vec3 up      = cross(forward, right);
    
    ro = (u_cameraPos + forward) * u_zoom / 100.0;
    // NDC coordinates [-1,1]
    vec2 uv = (gl_FragCoord.xy / u_resolution - 0.5) * 2.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Ray direction
    vec3 rd = normalize(forward + uv.x*right + uv.y*up);

    // Ray march loop
    float t = 0.0;
    bool hit = false;
    for (int i = 0; i < 200; i++) {
        vec3 p = ro + rd*t;
        float d = mandelbulb(p);
        if (d < 0.001) { hit = true; break; }
        t += d;
        if (t > 100.0) break;
    }

    vec3 col = vec3(0.0);
    if (hit) {
        vec3 p = ro + rd*t;
        vec3 n = estimateNormal(p) * t;
        vec3 nColor = 0.5 + 0.5 * n;  // n.x -> R, n.y -> G, n.z -> B

        col = nColor;
    }


    fragColor = vec4(col, 1.0);
}
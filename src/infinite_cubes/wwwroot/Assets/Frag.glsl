#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec3 u_cameraPos;  // camera position
uniform vec2 u_pan;        // offset in x/y
uniform float u_zoom;      // scale factor

out vec4 fragColor;

vec3 cameraPos = vec3(0.0, 0.0, 5.0);
vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float map(vec3 p) {
    p += -1.0 * u_cameraPos * u_time / 5000.0;
    vec3 q = p;
    q = fract(p) - 0.5;

    float box = sdBox(q, vec3(.2));

    return box;
}

vec3 estimateNormal(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(
        map(p + vec3(eps,0,0)) - map(p - vec3(eps,0,0)),
        map(p + vec3(0,eps,0)) - map(p - vec3(0,eps,0)),
        map(p + vec3(0,0,eps)) - map(p - vec3(0,0,eps))
    ));
}

void main() {
    vec3 target = vec3(0.0); // object is at the origin

    // camera basis
    vec3 forward = normalize(target - u_cameraPos);
    vec3 right = normalize(cross(vec3(0.0,1.0,0.0), forward));
    vec3 up = cross(forward, right);

    // screen coordinates [-1,1]
    vec2 uv = (gl_FragCoord.xy / u_resolution - 0.5) * 2.0;
    uv.x *= u_resolution.x / u_resolution.y; // correct aspect

    float fov = 1.0; // scale for image plane, adjust to zoom in/out

    // compute ray direction through image plane
    vec3 rd = normalize(forward + uv.x*right*fov + uv.y*up*fov);

    vec3 ro = u_cameraPos;

    float t = 0.0;
    for(int i=0;i<200;i++){
        vec3 p = ro + rd*t;
        float d = map(p);
        if(d < 0.001) break;
        t += d;
        if(t>200.0) break;
    }

    vec3 color = vec3(0.4);
    if(t > 0.0){
        vec3 pp = ro + rd*t;
        vec3 n = estimateNormal(pp);
        float diffuse = max(dot(n, normalize(vec3(1.0,1.0,1.0))), 0.2);

        // depth fog
        float fog = exp(-t * 0.02);
        color = vec3(0.2,0.6,1.0)*diffuse*fog;
    }

    fragColor = vec4(color,1.0) * t;
}
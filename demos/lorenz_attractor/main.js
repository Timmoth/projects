console.log("Lorenz attractor with tangent-based coloring");

// --- WebGL setup ---
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// --- Shaders ---
const vsSource = `
attribute vec3 aPosition;
attribute vec3 aTangent;
varying vec3 vColor;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform float uFrame;

// Simple 1D pseudo-random noise
float noise(float x){
    return fract(sin(x*12.9898)*43758.5453);
}

// Smooth interpolation for continuous noise
float smoothNoise(float x){
    float i = floor(x);
    float f = fract(x);
    float a = noise(i);
    float b = noise(i+1.0);
    float t = f*f*(3.0-2.0*f);
    return mix(a, b, t);
}

// Convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    // Base hue from tangent direction
vec3 t = normalize(aTangent);
float baseHue = atan(t.y, t.x) / 3.14159 * 0.5 + 0.5;

// Flow along the trajectory
float flowSpeed = 0.001; // controls how fast colors move along the line
float pathParam = length(aPosition)*0.2; // or any measure of "distance along curve"

float hueOffset = smoothNoise(pathParam + uFrame*0.02);
float hue = mod(baseHue + 0.2*hueOffset + uFrame*flowSpeed, 1.0);


float brightnessNoise = 0.8 + 0.2*smoothNoise(uFrame*0.005 + length(aPosition)*0.05);

// shimmer based on world Y axis
float shimmer = abs(dot(t, vec3(0.0,1.0,0.0)));
float brightness = 0.8 + 0.2*smoothNoise(pathParam + uFrame*0.01);
brightness *= 0.6 + 0.4*shimmer;


float saturation = 0.9 + 0.1*smoothNoise(length(aPosition)*0.1 + uFrame*0.01);

vColor = hsv2rgb(vec3(hue, saturation, brightness));


    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}


`;

const fsSource = `
precision mediump float;
varying vec3 vColor;

void main() {
  float glow = 0.7 + 0.3*pow(gl_FragCoord.z,0.3); // slight depth-based glow
  gl_FragColor = vec4(vColor*glow,1.0);
}

`;

// --- Compile shaders ---
function compile(src, type) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s));
  }
  return s;
}

const program = gl.createProgram();
gl.attachShader(program, compile(vsSource, gl.VERTEX_SHADER));
gl.attachShader(program, compile(fsSource, gl.FRAGMENT_SHADER));
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// --- Attribute & uniform locations ---
const aPosition = gl.getAttribLocation(program, "aPosition");
const aTangent = gl.getAttribLocation(program, "aTangent");
const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uFrame = gl.getUniformLocation(program, "uFrame");

// --- Buffers ---
const maxPoints = 20000;
const points = new Float32Array(maxPoints * 3);
const tangents = new Float32Array(maxPoints * 3);
let pointCount = 0;

const positionBuffer = gl.createBuffer();
const tangentBuffer = gl.createBuffer();

// --- Lorenz system ---
let x = 0.01, y = 0, z = 0;
const sigma = 10, rho = 28, beta = 8/3, dt = 0.01;

function lorenzStep() {
  const dx = sigma * (y - x);
  const dy = x * (rho - z) - y;
  const dz = x * y - beta * z;
  x += dx * dt; y += dy * dt; z += dz * dt;
  return [x, y, z];
}

// --- Minimal 4x4 matrix utilities ---
function identity() { return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]; }
function multiply(a,b) {
  const r = new Array(16);
  for(let i=0;i<4;i++) {
    for(let j=0;j<4;j++) {
      r[i*4+j]=0;
      for(let k=0;k<4;k++) r[i*4+j]+=a[i*4+k]*b[k*4+j];
    }
  }
  return r;
}
function perspective(fov, aspect, near, far) {
  const f = 1/Math.tan(fov/2);
  const nf = 1/(near-far);
  return [
    f/aspect,0,0,0,
    0,f,0,0,
    0,0,(far+near)*nf,-1,
    0,0,(2*far*near)*nf,0
  ];
}
function lookAt(eye,target,up) {
  const [ex,ey,ez]=eye,[tx,ty,tz]=target,[ux,uy,uz]=up;
  let fx=ex-tx, fy=ey-ty, fz=ez-tz;
  const fl=Math.hypot(fx,fy,fz); fx/=fl; fy/=fl; fz/=fl;
  let rx=uy*fz-uz*fy, ry=uz*fx-ux*fz, rz=ux*fy-uy*fx;
  const rl=Math.hypot(rx,ry,rz); rx/=rl; ry/=rl; rz/=rl;
  const ux2=fy*rz-fz*ry, uy2=fz*rx-fx*rz, uz2=fx*ry-fy*rx;
  return [
    rx, ux2, fx, 0,
    ry, uy2, fy, 0,
    rz, uz2, fz, 0,
    -(rx*ex+ry*ey+rz*ez),
    -(ux2*ex+uy2*ey+uz2*ez),
    -(fx*ex+fy*ey+fz*ez),
    1
  ];
}

// --- Orbit camera ---
let theta = 0, phi = 0, radius = 80;
let dragging=false,lastX,lastY;

canvas.addEventListener("mousedown", e=>{dragging=true; lastX=e.clientX; lastY=e.clientY;});
canvas.addEventListener("mouseup", ()=>dragging=false);
canvas.addEventListener("mousemove", e=>{
  if(dragging){
    theta -= (e.clientX-lastX)*0.01;
    phi += (e.clientY-lastY)*0.01;
    phi = Math.max(-Math.PI/2+0.1, Math.min(Math.PI/2-0.1, phi));
    lastX=e.clientX; lastY=e.clientY;
  }
});
canvas.addEventListener("wheel", e=>{
  radius += e.deltaY*0.05;
  radius = Math.max(10, Math.min(200, radius));
});

// --- Tangent update (efficient) ---
function updateLastTangent() {
  if(pointCount<2) return;
  const i = pointCount-1;
  const dx = points[i*3] - points[(i-1)*3];
  const dy = points[i*3+1] - points[(i-1)*3+1];
  const dz = points[i*3+2] - points[(i-1)*3+2];
  const len = Math.hypot(dx,dy,dz)||1;

  tangents[i*3]   = dx/len;
  tangents[i*3+1] = dy/len;
  tangents[i*3+2] = dz/len;

  // Optional: update previous point to point forward
  tangents[(i-1)*3]   = dx/len;
  tangents[(i-1)*3+1] = dy/len;
  tangents[(i-1)*3+2] = dz/len;
}

let frameCount = 0;

// --- Draw loop ---
function draw() {
  frameCount++;
  const [nx,ny,nz] = lorenzStep();

  // Add new point
  if(pointCount<maxPoints){
    points.set([nx,ny,nz], pointCount*3);
    pointCount++;
  } else {
    points.copyWithin(0,3,maxPoints*3);
    points.set([nx,ny,nz], (maxPoints-1)*3);
  }

  // Update tangent only for the last points
  updateLastTangent();

  // Upload positions
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

  // Upload tangents
  gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, tangents, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aTangent);
  gl.vertexAttribPointer(aTangent, 3, gl.FLOAT, false, 0, 0);

  // Clear
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

  // Camera matrices
  const projection = perspective(Math.PI/4, canvas.width/canvas.height, 0.1, 1000);
  const ex = radius*Math.cos(phi)*Math.sin(theta);
  const ey = radius*Math.sin(phi);
  const ez = radius*Math.cos(phi)*Math.cos(theta);
  const view = lookAt([ex,ey,ez],[0,0,0],[0,1,0]);

  gl.uniformMatrix4fv(uProjectionMatrix,false,new Float32Array(projection));
  gl.uniformMatrix4fv(uViewMatrix,false,new Float32Array(view));
  gl.uniform1f(uFrame, frameCount);
  // Draw the line strip
  gl.drawArrays(gl.LINE_STRIP, 0, pointCount);

  requestAnimationFrame(draw);
}

draw();
async function loadShaderFile(url) {
    const response = await fetch(url);
    return await response.text();
}

async function main() {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");

    const vsSource = await loadShaderFile("vertex.glsl");
    const fsSource = await loadShaderFile("fragment.glsl");

    function compile(src, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, compile(vsSource, gl.VERTEX_SHADER));
    gl.attachShader(program, compile(fsSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uSize = gl.getUniformLocation(program, "u_size");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const quadVerts = new Float32Array([
        -1, -1,  1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
    ]);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

let mouseX = 0.0, mouseY = 0.0;

function updateMouse(clientX, clientY) {
    // Normalize to full window width / height
    mouseX = Math.min(Math.max(clientX / window.innerWidth, 0), 1);
    mouseY = Math.min(Math.max(clientY / window.innerHeight, 0), 1);
}

// Mouse move
window.addEventListener("mousemove", e => updateMouse(e.clientX, e.clientY));

// Touch move
window.addEventListener("touchmove", e => {
    e.preventDefault(); // prevent scrolling
    if (e.touches.length > 0) {
        const t = e.touches[0];
        updateMouse(t.clientX, t.clientY);
    }
}, { passive: false });


    let time = 0;
    function draw() {
        time += 0.01;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uTime, time);
        gl.uniform2f(uSize, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouseX, mouseY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(draw);
    }

    draw();
}

main();

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
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
    ]);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    let mouseX = 0;
    let mouseY = 0;

    function updateMouse(x, y) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        mouseX = Math.min(Math.max(x / width, 0), 1);
        mouseY = Math.min(Math.max(y / height, 0), 1);
    }

    // Desktop
    document.addEventListener("mousemove", e => updateMouse(e.clientX, e.clientY));

    // Mobile
    document.addEventListener("touchstart", e => {
        if (e.touches.length > 0) {
            updateMouse(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    document.addEventListener("touchmove", e => {
        e.preventDefault(); // stop scrolling
        if (e.touches.length > 0) {
            updateMouse(e.touches[0].clientX, e.touches[0].clientY);
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

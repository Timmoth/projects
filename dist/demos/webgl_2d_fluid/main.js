console.log("-----Fluid Sim-----");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

gl.getExtension("EXT_color_buffer_float");

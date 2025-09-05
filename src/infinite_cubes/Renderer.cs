using System;
using System.Diagnostics;
using System.Numerics;
using Silk.NET.OpenGLES;

namespace infinite_cubes;

public class Renderer
{
    // --- State ---
    private readonly GL Gl;
    private uint ShaderProgram, VAO;
    private int ResolutionLocation, TimeLocation;
    private int CameraPosLocation, PanLocation, ZoomLocation;

    private int _canvasWidth = 1, _canvasHeight = 1;
    private readonly double _scale = 4.0;
    readonly double radius = 4.0;        // distance from the origin
    double theta = Math.PI/4;    // horizontal angle
    double phi = Math.PI/4;      // vertical angle

    private readonly Stopwatch _stopwatch = Stopwatch.StartNew();

    public Renderer(GL gl, string vertexShaderSource, string fragmentShaderSource)
    {
        unsafe
        {
            Gl = gl;
            
            ShaderProgram = Gl.CreateProgram();
            var vs = CompileShader(ShaderType.VertexShader, vertexShaderSource);
            var fs = CompileShader(ShaderType.FragmentShader, fragmentShaderSource);
            Gl.AttachShader(ShaderProgram, vs);
            Gl.AttachShader(ShaderProgram, fs);
            Gl.LinkProgram(ShaderProgram);
            Gl.DeleteShader(vs);
            Gl.DeleteShader(fs);

            ResolutionLocation = Gl.GetUniformLocation(ShaderProgram, "u_resolution");
            TimeLocation = Gl.GetUniformLocation(ShaderProgram, "u_time");
            CameraPosLocation = Gl.GetUniformLocation(ShaderProgram, "u_cameraPos");
            PanLocation = Gl.GetUniformLocation(ShaderProgram, "u_pan");
            ZoomLocation = Gl.GetUniformLocation(ShaderProgram, "u_zoom");

            // Full-screen quad
            float[] quadVertices = { -1f,1f, -1f,-1f, 1f,-1f, 1f,1f };
            ushort[] quadIndices = {0,1,2,0,2,3};

            VAO = Gl.GenVertexArray();
            Gl.BindVertexArray(VAO);

            var vbo = Gl.GenBuffer();
            Gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
            Gl.BufferData<float>(BufferTargetARB.ArrayBuffer, quadVertices, BufferUsageARB.StaticDraw);

            var ebo = Gl.GenBuffer();
            Gl.BindBuffer(BufferTargetARB.ElementArrayBuffer, ebo);
            Gl.BufferData<ushort>(BufferTargetARB.ElementArrayBuffer, quadIndices, BufferUsageARB.StaticDraw);

            Gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 2 * sizeof(float), (void*)0);
            Gl.EnableVertexAttribArray(0);
            Gl.BindVertexArray(0);
        }
    }

    private uint CompileShader(ShaderType type, string src)
    {
        var shader = Gl.CreateShader(type);
        Gl.ShaderSource(shader, src);
        Gl.CompileShader(shader);
        Gl.GetShader(shader, ShaderParameterName.CompileStatus, out int status);
        if(status == 0) throw new Exception(Gl.GetShaderInfoLog(shader));
        return shader;
    }

    public void Render()
    {
        unsafe
        {
            Gl.Clear(ClearBufferMask.ColorBufferBit);
            Gl.UseProgram(ShaderProgram);
            Gl.BindVertexArray(VAO);

            float time = (float)_stopwatch.Elapsed.TotalMilliseconds;
            
            Vector3 cameraPos = new(
                (float)(radius * Math.Sin(phi) * Math.Cos(theta)),
                (float)(radius * Math.Cos(phi)),
                (float)(radius * Math.Sin(phi) * Math.Sin(theta))
            );


            float zoom = (float)_scale;

            Gl.Uniform3(CameraPosLocation, cameraPos.X, cameraPos.Y, cameraPos.Z);
            //Gl.Uniform2(PanLocation, pan.X, pan.Y);
            Gl.Uniform1(ZoomLocation, zoom);

            
            Gl.Uniform2(ResolutionLocation, (float)_canvasWidth, (float)_canvasHeight);
            Gl.Uniform1(TimeLocation, time); // Pass time for animation

            Gl.DrawElements(PrimitiveType.Triangles,6,DrawElementsType.UnsignedShort,null);
            Gl.BindVertexArray(0);
        }
    }

    public void CanvasResized(int width,int height)
    {
        _canvasWidth = width;
        _canvasHeight = height;
        Gl.Viewport(0,0,(uint)width,(uint)height);
    }

    public void ZoomAtPoint(double px, double py, double factor)
    {
        //radius = Math.Max(0.1, radius); // avoid flipping through the origin
    }

    public void Pan(double dx, double dy)
    {
        double sensitivity = 0.0005; // adjust rotation speed
        theta += dx * sensitivity;
        phi   -= dy * sensitivity;

        // clamp phi to avoid flipping over the top
        phi = Math.Clamp(phi, 0.01, Math.PI - 0.01);
    }


}

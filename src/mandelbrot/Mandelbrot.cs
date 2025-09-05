using System;
using System.Diagnostics;
using Silk.NET.OpenGLES;

namespace mandelbrot_viewer;

public class Mandelbrot
{
    private readonly Stopwatch _stopwatch = Stopwatch.StartNew();

    // --- State ---
    private readonly GL Gl;

    private int _canvasWidth = 1, _canvasHeight = 1;
    private Vector2d _center = new(-0.743643887037151, 0.13182590420533);
    private double _scale = 2.0;
    private readonly int CenterLocation;
    private readonly int ScaleLocation;
    private readonly int IterationsLocation;
    private readonly int ResolutionLocation;
    private readonly int TimeLocation;
    private readonly uint ShaderProgram;
    private readonly uint VAO;

    public Mandelbrot(GL gl, string vertexShaderSource, string fragmentShaderSource)
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

            CenterLocation = Gl.GetUniformLocation(ShaderProgram, "u_center");
            ScaleLocation = Gl.GetUniformLocation(ShaderProgram, "u_scale");
            IterationsLocation = Gl.GetUniformLocation(ShaderProgram, "u_max_iterations");
            ResolutionLocation = Gl.GetUniformLocation(ShaderProgram, "u_resolution");
            TimeLocation = Gl.GetUniformLocation(ShaderProgram, "u_time");

            // Full-screen quad
            float[] quadVertices = { -1f, 1f, -1f, -1f, 1f, -1f, 1f, 1f };
            ushort[] quadIndices = { 0, 1, 2, 0, 2, 3 };

            VAO = Gl.GenVertexArray();
            Gl.BindVertexArray(VAO);

            var vbo = Gl.GenBuffer();
            Gl.BindBuffer(BufferTargetARB.ArrayBuffer, vbo);
            Gl.BufferData<float>(BufferTargetARB.ArrayBuffer, quadVertices, BufferUsageARB.StaticDraw);

            var ebo = Gl.GenBuffer();
            Gl.BindBuffer(BufferTargetARB.ElementArrayBuffer, ebo);
            Gl.BufferData<ushort>(BufferTargetARB.ElementArrayBuffer, quadIndices, BufferUsageARB.StaticDraw);

            Gl.VertexAttribPointer(0, 2, VertexAttribPointerType.Float, false, 2 * sizeof(float), null);
            Gl.EnableVertexAttribArray(0);
            Gl.BindVertexArray(0);
        }
    }

    private uint CompileShader(ShaderType type, string src)
    {
        var shader = Gl.CreateShader(type);
        Gl.ShaderSource(shader, src);
        Gl.CompileShader(shader);
        Gl.GetShader(shader, ShaderParameterName.CompileStatus, out var status);
        if (status == 0) throw new Exception(Gl.GetShaderInfoLog(shader));
        return shader;
    }

    public void Render()
    {
        unsafe
        {
            Gl.Clear(ClearBufferMask.ColorBufferBit);
            Gl.UseProgram(ShaderProgram);
            Gl.BindVertexArray(VAO);

            var time = (float)_stopwatch.Elapsed.TotalSeconds;

            Gl.Uniform2(CenterLocation, (float)_center.X, (float)_center.Y);
            Gl.Uniform1(ScaleLocation, (float)_scale);
            Gl.Uniform1(IterationsLocation, 500);
            Gl.Uniform2(ResolutionLocation, _canvasWidth, (float)_canvasHeight);
            Gl.Uniform1(TimeLocation, time); // Pass time for animation

            Gl.DrawElements(PrimitiveType.Triangles, 6, DrawElementsType.UnsignedShort, null);
            Gl.BindVertexArray(0);
        }
    }

    public void CanvasResized(int width, int height)
    {
        _canvasWidth = width;
        _canvasHeight = height;
        Gl.Viewport(0, 0, (uint)width, (uint)height);
    }

    public void ZoomAtPoint(double px, double py, double factor)
    {
        if (_canvasWidth <= 0 || _canvasHeight <= 0) return;
        _scale *= factor;
    }

    public void Pan(double dx, double dy)
    {
        if (_canvasWidth <= 0 || _canvasHeight <= 0) return;
        var aspect = (double)_canvasWidth / _canvasHeight;
        var ndx = -dx / _canvasWidth;
        var ndy = -dy / _canvasHeight;
        Vector2d delta = new(ndx * aspect * _scale, ndy * _scale);
        _center += delta;
    }
}
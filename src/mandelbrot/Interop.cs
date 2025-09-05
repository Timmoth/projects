using System;
using System.Runtime.InteropServices.JavaScript;

namespace mandelbrot_viewer;

internal static partial class Interop
{
    [JSImport("initialize", "main.js")]
    public static partial void Initialize();

    [JSExport]
    public static void OnCanvasResize(float width, float height, float devicePixelRatio)
    {
        Program.CanvasResized((int)width, (int)height);
    }

    [JSExport]
    public static void SetRootUri(string uri)
    {
        Program.BaseAddress = new Uri(uri);
    }
    
    [JSExport]
    public static void OnDrag(float dx, float dy)
    {
        Program.Pan(dx, dy);
    }
    
    [JSExport]
    public static void ZoomInAtPoint(float x, float y)
    {
        Program.ZoomAtPoint(x, y, 1.05f); // Zoom in by 10%
    }

    [JSExport]
    public static void ZoomOutAtPoint(float x, float y)
    {
        Program.ZoomAtPoint(x, y, 0.95f); // Zoom out by 10%
    }
    
    [JSExport]
    public static void ZoomAtPoint(float x, float y, float factor)
    {
        Program.ZoomAtPoint(x, y, factor); // Zoom out by 10%
    }

}
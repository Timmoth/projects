namespace mandelbrot_viewer;

public struct Vector2d
{
    public double X, Y;

    public Vector2d(double x, double y)
    {
        X = x;
        Y = y;
    }

    public static Vector2d operator +(Vector2d a, Vector2d b)
    {
        return new Vector2d(a.X + b.X, a.Y + b.Y);
    }

    public static Vector2d operator -(Vector2d a, Vector2d b)
    {
        return new Vector2d(a.X - b.X, a.Y - b.Y);
    }

    public static Vector2d operator *(Vector2d a, double s)
    {
        return new Vector2d(a.X * s, a.Y * s);
    }
}
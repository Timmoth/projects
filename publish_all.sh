#!/bin/bash
set -e

# Array of project directories (relative to repo root)
PROJECTS=(
    "./src/infinite_cubes"
    "./src/mandelbrot"
    "./src/mandelbulb"
    "./src/reflective_spheres"
    "./src/maurer_rose"
    "./src/3d_shapes"
    "./src/double_pendulum"
    "./src/particle_rose"

)

# Save current directory (root)
ROOT_DIR=$(pwd)

for proj in "${PROJECTS[@]}"; do
    echo "Publishing $proj..."
    (
        cd "$ROOT_DIR/$proj"
        if [ -x ./publish.sh ]; then
            ./publish.sh
        else
            echo "Warning: $proj/publish.sh is missing or not executable"
        fi
    )
done

echo "All projects published successfully!"

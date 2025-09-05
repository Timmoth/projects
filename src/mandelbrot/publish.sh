#!/bin/bash
set -e

# Publish project
dotnet publish -c Release

TARGET=../../demos/mandelbrot

mkdir -p "$TARGET"
rm -rf "$TARGET"/*
cp -R ./bin/Release/net9.0/publish/wwwroot/* "$TARGET/"

echo "Publish complete to $TARGET"

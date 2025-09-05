#!/bin/bash
set -e

# Publish project
dotnet publish -c Release

TARGET=../../demos/reflective_spheres

mkdir -p "$TARGET"
rm -rf "$TARGET"/*

cp -R ./bin/Release/net9.0/publish/wwwroot/* "$TARGET/"

echo "Publish complete to $TARGET"

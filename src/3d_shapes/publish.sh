#!/bin/bash
set -e

# Publish project
npm run build

TARGET=../../demos/3d_shapes

mkdir -p "$TARGET"
rm -rf "$TARGET"/*
cp -R ./dist/* "$TARGET/"

echo "Publish complete to $TARGET"

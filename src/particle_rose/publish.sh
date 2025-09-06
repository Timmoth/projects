#!/bin/bash
set -e

TARGET=../../demos/particle_rose

mkdir -p "$TARGET"
rm -rf "$TARGET"/*
cp -R ./src/* "$TARGET/"

echo "Publish complete to $TARGET"

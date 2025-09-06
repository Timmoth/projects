#!/bin/bash
set -e

TARGET=../../demos/curved_lines

mkdir -p "$TARGET"
rm -rf "$TARGET"/*
cp -R ./src/* "$TARGET/"

echo "Publish complete to $TARGET"

#!/bin/bash
set -e

# Publish project
dotnet publish -c Release

TARGET=../../demos/realtime_path_tracing

mkdir -p "$TARGET"
cp -R ./bin/Release/net9.0/publish/wwwroot/* "$TARGET/"

echo "Publish complete to $TARGET"

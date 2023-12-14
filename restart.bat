@echo off
setlocal

set "PLATFORM=%~1"
if not defined PLATFORM set "PLATFORM=linux/arm64"

git pull
docker compose build --build-arg PLATFORM=%PLATFORM%
docker compose up -d

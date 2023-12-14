#!/bin/bash

PLATFORM="${1:-linux/arm64}"

git pull
sudo docker compose build --build-arg PLATFORM="$PLATFORM"
sudo docker compose up -d

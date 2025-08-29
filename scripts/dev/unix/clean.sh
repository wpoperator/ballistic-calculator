#!/bin/bash
# Development Environment - Clean Reset
cd "$(dirname "$0")/../../.."
docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache

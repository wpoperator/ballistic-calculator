#!/bin/bash
# Development Environment - Restart
cd "$(dirname "$0")/../../.."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build

#!/bin/bash
# Development Environment - Start
cd "$(dirname "$0")/../../.."
docker-compose -f docker-compose.dev.yml up --build

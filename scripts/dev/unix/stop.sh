#!/bin/bash
# Development Environment - Stop
cd "$(dirname "$0")/../../.."
docker-compose -f docker-compose.dev.yml down

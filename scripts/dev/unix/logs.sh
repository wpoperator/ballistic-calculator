#!/bin/bash
# Development Environment - Logs
cd "$(dirname "$0")/../../.."
docker-compose -f docker-compose.dev.yml logs -f

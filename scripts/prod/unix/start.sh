#!/bin/bash
# Production Environment - Start
cd "$(dirname "$0")/../../.."
docker-compose -f docker-compose.yml up -d --build

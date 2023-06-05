#!/usr/bin/env bash

if [[ $(docker container ls -af 'name=mongodb-test' --format '{{.ID}}') ]]; then
  docker stop mongodb-test
fi;

npx concurrently --kill-others "docker-compose -f docker-compose.mongo.yaml up" "dotenv -e .env.test -- jest --config ./test/jest-e2e.json"

sleep 5
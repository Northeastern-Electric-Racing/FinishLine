#!/bin/bash

# Must be called via yarn test:e2e from inside the root of Finishline directory
docker run --network host -v $PWD/system-tests:/e2e/ -w /e2e/ cypress/included:latest 
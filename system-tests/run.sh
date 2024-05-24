#!/bin/bash

# Must be called via yarn test:e2e from inside the root of Finishline directory
docker run -it -v $PWD/system-tests:/e2e -w /e2e cypress/included:12.8.1
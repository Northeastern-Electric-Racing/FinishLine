#!/bin/bash

# Must be called via yarn test:e2e from inside the root of Finishline directory
# Tag is pinned deliberately -- do not use :latest, a major bump breaks the suite.
# Requires >=16: the specs use Cypress.expose(), which does not exist in 15.x.
docker run --network host -v $PWD/system-tests:/e2e/ -w /e2e/ cypress/included:16.0.0 
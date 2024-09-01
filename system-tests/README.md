### System Tests

To run the tests against a local system. Have your system running using `yarn start`, then cd into this directory and run `npx cypress run` to run all system tests, or run `npx cypress run --spec /path/to/test-suite(s)/to/run`.

For example, to run change requests overview tests, you can `cd system-tests && npx cypress run --spec /cypress/e2e/change-requests/change-request-overview.cy.js`

To run the system tests using the CI, run `yarn test:e2e`
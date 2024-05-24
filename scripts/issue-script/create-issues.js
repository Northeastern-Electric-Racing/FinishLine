import { Octokit } from '@octokit/rest';

const octoKit = new Octokit({
    // Replace with fine-grained personal access token with issue:write perms on FinishLine
    auth: ''
  });

  const endpointNames = [ ];

  const createIssue = async (endpoint) => {
    await octoKit.request('POST /repos/Northeastern-Electric-Racing/FinishLine/issues', {
      owner: 'Northeastern-Electric-Racing',
      repo: 'FinishLine',
      title: `[Testing] - Write Unmocked Tests for ${endpoint} Endpoint`,
      body: '### Description\nWe want to ensure our endpoints communicate with our database correctly and handle all appropriate business logic. You can setup the testing environment by running yarn test:setup. Then you can run yarn test as many times as you wish. Once done you may run yarn test:teardown to shutdown the testing environment and be able to use the normal dev environment again.\n\n### Acceptance Criteria\n- [ ] Tests that force all exceptions to occur\n- [ ] Test that successfully invokes the function for the expected output.\n\n### Proposed Solution\nLook at how unmocked tests are currently used. You may want to look at test.utils.ts to see how we create test projects and setup organizations.',
      labels: ['back-end', 'testing', 'medium']
    });
  };

  for (const endpoint of endpointNames) {
    for (let i = 0; i < 10000000; i++) {}
    console.log("Creating issue for endpoint: ", endpoint, "\n");
    await createIssue(endpoint);
  }

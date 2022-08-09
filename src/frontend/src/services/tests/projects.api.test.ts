/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { apiUrls } from '../../urls';
import { exampleAllProjects, exampleProject1 } from '../../test-support/test-data/projects.stub';
import { getAllProjects, getSingleProject } from '../projects.api';

// Mock the server endpoint(s) that the component will hit
const server = setupServer(
  rest.get(apiUrls.projects(), (req, res, ctx) => {
    return res(ctx.status(500, 'Mock server not set up yet'));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('project api hooks', () => {
  it('handles getting a list of projects', async () => {
    server.use(
      rest.get(apiUrls.projects(), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleAllProjects));
      })
    );

    const result = await getAllProjects();
    expect(result.data).toHaveProperty('length', 5);
    expect(result.data[0]).toHaveProperty('gDriveLink');
    expect(result.data[1]).toHaveProperty('status');
    expect(result.data[0]).toHaveProperty('budget');
    expect(result.data[1]).toHaveProperty('projectLead');
  });

  it('handles getting a single project', async () => {
    server.use(
      rest.get(apiUrls.projectsByWbsNum('1.1.0'), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleProject1));
      })
    );

    const result = await getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 });
    expect(result.data).not.toHaveProperty('length');
    expect(result.data).toHaveProperty('wbsNum');
    expect(result.data).toHaveProperty('bomLink');
  });
});

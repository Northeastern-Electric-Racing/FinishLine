/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { apiUrls } from '../../urls';
import {
  exampleAllWorkPackages,
  exampleWorkPackage1
} from '../../test-support/test-data/work-packages.stub';
import { getAllWorkPackages, getSingleWorkPackage } from '../work-packages.api';

// Mock the server endpoint(s) that the component will hit
const server = setupServer(
  rest.get(apiUrls.workPackages(), (req, res, ctx) => {
    return res(ctx.status(500, 'Mock server not set up yet'));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('work package api methods', () => {
  it('handles getting a list of work packages', async () => {
    server.use(
      rest.get(apiUrls.workPackages(), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleAllWorkPackages));
      })
    );

    const result = await getAllWorkPackages();
    expect(result.data).toHaveProperty('length', 3);
    expect(result.data[0]).toHaveProperty('progress');
    expect(result.data[1]).toHaveProperty('status');
    expect(result.data[1]).toHaveProperty('projectLead');
  });

  it('handles getting a single work packages', async () => {
    server.use(
      rest.get(apiUrls.workPackagesByWbsNum('1.1.1'), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleWorkPackage1));
      })
    );

    const result = await getSingleWorkPackage({
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1
    });
    expect(result.data).not.toHaveProperty('length');
    expect(result.data).toHaveProperty('wbsNum');
    expect(result.data).toHaveProperty('duration');
  });
});

/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { apiUrls } from '../../urls';
import {
  exampleAllChangeRequests,
  exampleStageGateChangeRequest
} from '../../test-support/test-data/change-requests.stub';
import { getAllChangeRequests, getSingleChangeRequest } from '../change-requests.api';

// Mock the server endpoint(s) that the component will hit
const server = setupServer(
  rest.get(apiUrls.changeRequests(), (req, res, ctx) => {
    return res(ctx.status(500, 'Mock server not set up yet'));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('change request api methods', () => {
  it('handles getting a list of change requests', async () => {
    server.use(
      rest.get(apiUrls.changeRequests(), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleAllChangeRequests));
      })
    );

    const result = await getAllChangeRequests();
    expect(result.data).toHaveProperty('length', 3);
    expect(result.data[0]).toHaveProperty('type');
    expect(result.data[1]).toHaveProperty('dateSubmitted');
    expect(result.data[1].dateSubmitted).toHaveProperty('toUTCString');
  });

  it('handles getting a single change request', async () => {
    server.use(
      rest.get(apiUrls.changeRequestsById('50'), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleStageGateChangeRequest));
      })
    );

    const result = await getSingleChangeRequest(50);
    expect(result.data).not.toHaveProperty('length');
    expect(result.data).toHaveProperty('confirmDone');
    expect(result.data).toHaveProperty('leftoverBudget');
    expect(result.data.dateSubmitted).toHaveProperty('toUTCString');
  });
});

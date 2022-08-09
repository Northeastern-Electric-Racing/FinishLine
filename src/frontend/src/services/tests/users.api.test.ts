/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { apiUrls } from '../../urls';
import { exampleAllUsers, exampleAdminUser } from '../../test-support/test-data/users.stub';
import { getAllUsers, getSingleUser, logUserIn } from '../users.api';

// Mock the server endpoint(s) that the component will hit
const server = setupServer(
  rest.get(apiUrls.users(), (req, res, ctx) => {
    return res(ctx.status(500, 'Mock server not set up yet'));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('user api methods', () => {
  it('handles getting a list of users', async () => {
    server.use(
      rest.get(apiUrls.users(), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleAllUsers));
      })
    );

    const result = await getAllUsers();
    expect(result.data).toHaveProperty('length', 7);
    expect(result.data[0]).toHaveProperty('emailId');
    expect(result.data[1]).toHaveProperty('email');
  });

  it('handles getting a single user', async () => {
    server.use(
      rest.get(apiUrls.usersById('24'), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleAdminUser));
      })
    );

    const result = await getSingleUser(24);
    expect(result.data).not.toHaveProperty('length');
    expect(result.data).toHaveProperty('firstName');
    expect(result.data).toHaveProperty('role');
  });

  it('handles logging in a user', async () => {
    server.use(
      rest.post(apiUrls.usersLogin(), (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(exampleAdminUser));
      })
    );

    const result = await logUserIn(exampleAdminUser.email);
    expect(result.data).not.toHaveProperty('length');
    expect(result.data).toHaveProperty('firstName');
    expect(result.data).toHaveProperty('role');
  });
});

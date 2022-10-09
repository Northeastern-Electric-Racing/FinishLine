import request from 'supertest';
import express from 'express';
import userRouter from '../src/routes/users.routes';
import prisma from '../src/prisma/prisma';
import { batman, superman } from './test-data/users.test-data';

const app = express();
app.use('/', userRouter);

describe('Users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('getAllUsers', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batman]);

    const res = await request(app).get('/');

    const { googleAuthId: g1, ...restOfBatman } = batman;
    const { googleAuthId: g2, ...restOfSuperman } = superman;

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    // note that batman was sorted to the front because his first name is before supermans alphabetically
    // and also that we don't return the google auth id for security reasons
    expect(res.body).toStrictEqual([restOfBatman, restOfSuperman]);
  });

  test('getSingleUser', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);

    const res = await request(app).get('/1');

    const { googleAuthId, ...restOfBatman } = batman;

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    // we don't return the google auth id for security reasons
    expect(res.body).toStrictEqual(restOfBatman);
  });
});

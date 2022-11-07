import request from 'supertest';
import express from 'express';
import teamsRouter from '../src/routes/teams.routes';
import prisma from '../src/prisma/prisma';
import { JusticeLeague } from './test-data/teams.test-data';

const app = express();
app.use(express.json());
app.use('/', teamsRouter);

describe('Teams', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('getSingleTeam', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(JusticeLeague);

    const res = await request(app).get('/fff');

    expect(res.statusCode).toBe(200);
    //  expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual(JusticeLeague);
  });
});

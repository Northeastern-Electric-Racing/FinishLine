import request from 'supertest';
import express from 'express';
import teamsRouter from '../src/routes/teams.routes';
import prisma from '../src/prisma/prisma';
import { justiceLeague } from './test-data/teams.test-data';
import { batman, wonderwoman } from './test-data/users.test-data';
import userRouter from '../src/routes/users.routes';
import {} from '@prisma/client';
import { teamTransformer } from '../src/utils/teams.utils';

const app = express();
app.use(express.json());
app.use('/', userRouter);
app.use('/', teamsRouter);

test('updateTeamDescSuccess', async () => {
  const newJustice = { ...justiceLeague, description: 'hello!', leader: { ...batman, googleAuthId: 'b' } };

  jest.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(justiceLeague);
  jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
  jest.spyOn(prisma.team, 'update').mockResolvedValue(newJustice);

  const body = { userId: 1, teamId: '1', newDescription: 'hello!' };
  const res = await request(app).post('/teams/:teamId/edit-description').send(body);

  expect(res.statusCode).toBe(200);
  expect(res.body).toStrictEqual(teamTransformer(newJustice));
});

test('returnsErrorIfNotAdmin', async () => {
  jest.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(justiceLeague);
  jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);

  const body = { userId: 1, teamId: '1', newDescription: 'hello!' };
  const res = await request(app).post('/teams/:teamId/edit-description').send(body);

  expect(res.statusCode).toBe(403);
});

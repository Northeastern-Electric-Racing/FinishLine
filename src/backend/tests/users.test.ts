import request from 'supertest';
import express from 'express';
import userRouter from '../src/routes/users.routes';
import { Role, Theme } from '@prisma/client';
import prisma from '../src/prisma/prisma';

const app = express();
app.use('/', userRouter);

const batman = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN
};

const superman = {
  userId: 2,
  firstName: 'Clark',
  lastName: 'Kent',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: Role.ADMIN
};

const batmanSettings = {
  id: '1',
  userId: batman.userId,
  user: batman,
  defaultTheme: Theme.DARK
};

describe('Users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllUsers', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([
      { ...superman, googleAuthId: 'a' },
      { ...batman, googleAuthId: 'b' }
    ]);

    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual([batman, superman]); // note that batman was sorted to the front because his first name is before supermans alphabetically
  });

  test('getSingleUser', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });

    const res = await request(app).get('/1');

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual(batman);
  });

  test('getUserSettings for undefined request user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const res = await request(app).get('/null/settings');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(`user #NaN not found!`);
  });

  test('getUserSettings runs', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });
    jest
      .spyOn(prisma.user_Settings, 'upsert')
      .mockResolvedValue({ ...batmanSettings, slackId: '5' });
    const res = await request(app).get('/1/settings');

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user_Settings.upsert).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual({ ...batmanSettings, slackId: '5' });
  });
});

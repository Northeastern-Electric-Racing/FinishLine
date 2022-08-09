import request from 'supertest';
import express from 'express';
import userRouter from '../src/routes/users.routes';
import { Role } from '@prisma/client';
import prisma from '../src/prisma/prisma';

const app = express();
app.use('/', userRouter);

const batman = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  googleAuthId: 'google',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN
};

const superman = {
  userId: 2,
  firstName: 'Clark',
  lastName: 'Kent',
  googleAuthId: 'idek what this is',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: Role.ADMIN
};

describe('Users', () => {
  beforeEach(() => {
    prisma.user.findMany = jest.fn();
    prisma.user.findUnique = jest.fn();
  });

  test('getAllUsers', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batman]);

    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual([batman, superman]); // note that batman was sorted to the front because his first name is before supermans alphabetically
  });

  test('getSingleUser', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);

    const res = await request(app).get('/1');

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual(batman);
  });
});

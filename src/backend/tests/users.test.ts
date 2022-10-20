import request from 'supertest';
import express from 'express';
import userRouter from '../src/routes/users.routes';
import prisma from '../src/prisma/prisma';
import { batman, batmanSettings, flash, superman, wonderwoman } from './test-data/users.test-data';
import { Role } from '@prisma/client';

const app = express();
app.use(express.json());
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
  test('cannotUpdateUserToHigherRole', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);
    const body = { userId: superman.userId, role: 'APP_ADMIN' };
    const res = await request(app).post('/3/change-role').send(body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Cannot promote user to a higher role than yourself'
    });
  });
  test('cannotDemoteUserOfSameRole', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(flash);
    const body = { userId: superman.userId, role: 'GUEST' };
    const res = await request(app).post('/4/change-role').send(body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Cannot change the role of a user with an equal or higher role than you'
    });
  });
  test('updateUserRoleSuccess', async () => {
    const newSuperman = { ...superman, role: Role.MEMBER };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
    jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(newSuperman);

    const body = { userId: 1, role: 'MEMBER' };

    const res = await request(app).post('/2/change-role').send(body);

    const { googleAuthId, ...restOfSuperman } = newSuperman;
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual(restOfSuperman);
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
  });

  test('getUserSettings for undefined request user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const res = await request(app).get('/null/settings');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(`user #NaN not found!`);
  });

  test('getUserSettings runs', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });
    jest.spyOn(prisma.user_Settings, 'upsert').mockResolvedValue({ ...batmanSettings, slackId: '5' });
    const res = await request(app).get('/1/settings');

    expect(res.statusCode).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user_Settings.upsert).toHaveBeenCalledTimes(1);
    expect(res.body).toStrictEqual({ ...batmanSettings, slackId: '5' });
  });

  test('updateUserSettings', async () => {
    jest.spyOn(prisma.user_Settings, 'upsert').mockResolvedValue(batmanSettings);
    const req = { defaultTheme: 'DARK', slackId: 'Slack' };
    const res = await request(app).post('/1/settings').send(req);

    expect(res.status).toBe(200);
  });

  test('updateUserSettings fails when user does not exist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const req = { defaultTheme: 'DARK', slackId: 'Slack' };

    // Note there is no user with an Id:88
    const res = await request(app).post('/88/settings').send(req);

    expect(res.status).toBe(404);
  });
});

import request from 'supertest';
import express from 'express';
import riskRouter from '../src/routes/risks.routes';
import {
  editRiskTrue,
  editRiskFalse,
  editRiskTruePayload,
  editRiskFalsePayload,
  someProject
} from './test-data/risks.test-data';
import { wonderwoman } from './test-data/users.test-data';
import prisma from '../src/prisma/prisma';

const app = express();
app.use(express.json());
app.use('/', riskRouter);

describe('Risks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(someProject);
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(editRiskFalse);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(editRiskFalse);

    const res = await request(app).post('/edit').send(editRiskTruePayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.isResolved).toBe(true);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  });

  test('the original risk was resolved and the payload is trying to unresolve it', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(someProject);
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(editRiskTrue);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(editRiskTrue);

    const res = await request(app).post('/edit').send(editRiskFalsePayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.isResolved).toBe(false);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  });

  test('the original risk and payload have the same resolved value', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(someProject);
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(editRiskFalse);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(editRiskFalse);

    const res = await request(app).post('/edit').send(editRiskFalsePayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.isResolved).toBe(false);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  });
});

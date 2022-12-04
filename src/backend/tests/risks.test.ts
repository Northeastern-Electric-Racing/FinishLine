import request from 'supertest';
import express from 'express';
import riskRouter from '../src/routes/risks.routes';
import {
  editRiskTrue,
  editRiskFalse,
  editRiskTruePayload,
  editRiskFalsePayload,
  transformedRisk
} from './test-data/risks.test-data';
import { wonderwoman } from './test-data/users.test-data';
import prisma from '../src/prisma/prisma';
import * as riskUtils from '../src/utils/risks.utils';

const app = express();
app.use(express.json());
app.use('/', riskRouter);

describe('Risks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(editRiskFalse);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(editRiskFalse);
    jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(true);
    jest.spyOn(riskUtils, 'riskTransformer').mockReturnValue(transformedRisk);

    const res = await request(app).post('/edit').send(editRiskTruePayload);

    // eslint-disable-next-line prefer-destructuring
    const { dateCreated, ...rest } = res.body;
    const { dateCreated: aaa, ...restOfTransformedRisk } = transformedRisk;

    expect(res.statusCode).toBe(200);
    expect(restOfTransformedRisk).toEqual(rest);

    expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  });

  test('the original risk was resolved and the payload is trying to unresolve it', async () => {
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(editRiskTrue);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(editRiskTrue);
    jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(false);
    jest.spyOn(riskUtils, 'riskTransformer').mockReturnValue(transformedRisk);

    const res = await request(app).post('/edit').send(editRiskFalsePayload);

    // eslint-disable-next-line prefer-destructuring
    const { dateCreated, ...rest } = res.body;
    const { dateCreated: aaa, ...restOfTransformedRisk } = transformedRisk;

    expect(res.statusCode).toBe(200);
    expect(restOfTransformedRisk).toEqual(rest);

    expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  });

  test('the original risk and payload have the same resolved value', async () => {
    jest.spyOn(prisma.risk, 'findUnique').mockResolvedValue(editRiskFalse);
    jest.spyOn(prisma.risk, 'update').mockResolvedValue(editRiskFalse);
    jest.spyOn(riskUtils, 'hasRiskPermissions').mockResolvedValue(False);
    jest.spyOn(riskUtils, 'riskTransformer').mockReturnValue(transformedRisk);

    const res = await request(app).post('/edit').send(editRiskFalsePayload);

    // eslint-disable-next-line prefer-destructuring
    const { dateCreated, ...rest } = res.body;
    const { dateCreated: aaa, ...restOfTransformedRisk } = transformedRisk;

    expect(res.statusCode).toBe(200);
    expect(restOfTransformedRisk).toEqual(rest);

    expect(prisma.risk.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.risk.update).toHaveBeenCalledTimes(1);
  });
});

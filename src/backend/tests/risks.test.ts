import request from 'supertest';
import express from 'express';
import riskRouter from '../src/routes/risks.routes';
import { editRiskTrue, editRiskFalse } from './test-data/risks.test-data';

const app = express();
app.use(express.json());
app.use('/', riskRouter);

describe('Risks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
    const res = await request(app).post('/edit').send(editRiskTrue);

    expect(res.body.isResolved).toBe(true);
  });

  test('the original risk was resolved and the payload is trying to unresolve it', async () => {
    const res = await request(app).post('/edit').send(editRiskFalse);

    expect(res.body.isResolved).toBe(false);
  });

  test('the original risk and payload have the same resolved value', async () => {
    const res = await request(app).post('/edit').send(editRiskFalse);

    expect(res.body.isResolved).toBe(false);
  });
});

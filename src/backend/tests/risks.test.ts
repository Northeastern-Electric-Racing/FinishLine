import request from 'supertest';
import express from 'express';
import riskRouter from '../src/routes/risks.routes';

const app = express();
app.use(express.json());
app.use('/', riskRouter);

const editRiskTrue = {
  userId: 1,
  id: 'asdf',
  detail: 'build a car',
  resolved: true
};

const editRiskFalse = {
  userId: 1,
  id: 'asdf',
  detail: 'build a car',
  resolved: false
};

describe('Risks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('the original risk was resolved and the payload is trying to unresolve it', async () => {
    const risk = { ...editRiskTrue, resolved: false };
    const res = await request(app).post('/edit').send(risk);

    expect(res.statusCode).toBe(400);
  });

  test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
    const risk = { ...editRiskFalse, resolved: true };
    const res = await request(app).post('/edit').send(risk);

    expect(res.statusCode).toBe(400);
  });

  test('the original risk and payload have the same resolved value', async () => {
    const risk = { ...editRiskTrue, resolved: false };
    const res = await request(app).post('/edit').send(risk);

    expect(res.statusCode).toBe(400);
  });
});

import request from 'supertest';
import express from 'express';
import riskRouter from '../src/routes/risks.routes';

const app = express();
app.use(express.json());
app.use('/', riskRouter);

// requested edits
const editRiskTrue = {
  userId: 1,
  id: '4800c304-2f8d-4376-a4c6-d7a157134c83',
  detail: 'This one might be a bit too expensive',
  resolved: true
};

const editRiskFalse = {
  userId: 1,
  id: '4800c304-2f8d-4376-a4c6-d7a157134c83',
  detail: 'This one might be a bit too expensive',
  resolved: false
};

describe('Risks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test(`the original risk wasn't resolved and the payload is trying to resolve it`, async () => {
    // const risk = { ...editRiskTrue};
    const res = await request(app).post('/edit').send(editRiskTrue);

    expect(res.body.isResolved).toBe(true);
  });

  test('the original risk was resolved and the payload is trying to unresolve it', async () => {
    // const risk = { ...editRiskTrue};
    const res = await request(app).post('/edit').send(editRiskFalse);

    expect(res.body.isResolved).toBe(false);
  });

  test('the original risk and payload have the same resolved value', async () => {
    const res = await request(app).post('/edit').send(editRiskFalse);

    expect(res.body.isResolved).toBe(false);
  });
});

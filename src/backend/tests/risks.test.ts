import request from 'supertest';
import express from 'express';
import risksRouter from '../src/routes/risks.routes';

const app = express();
app.use(express.json());
app.use('/', risksRouter);

describe('Risks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('test-works', async () => {
    const res = await request(app).get('/1');
    expect(res.body).toStrictEqual([
      {
        id: '458c5e95-b06c-47d9-8399-dcd409f9ff5a',
        project: {
          id: 1,
          name: 'Impact Attenuator',
          wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }
        },
        detail: 'This one might be a bit too expensive',
        isResolved: false,
        dateCreated: '2022-09-20T00:25:53.207Z',
        createdBy: {
          userId: 1,
          firstName: 'Thomas',
          lastName: 'Emrax',
          email: 'emrax.t@husky.neu.edu',
          emailId: 'emrax.t',
          role: 'APP_ADMIN'
        }
      },
      {
        id: '68209f03-5a6a-461b-85db-ebc02e419f61',
        project: {
          id: 1,
          name: 'Impact Attenuator',
          wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }
        },
        detail: 'Risky Risk 123',
        isResolved: false,
        dateCreated: '2022-09-20T00:25:53.212Z',
        createdBy: {
          userId: 1,
          firstName: 'Thomas',
          lastName: 'Emrax',
          email: 'emrax.t@husky.neu.edu',
          emailId: 'emrax.t',
          role: 'APP_ADMIN'
        }
      }
    ]);
    expect(res.statusCode).toBe(200);
  });

  test('not-projectid', async () => {
    const res = await request(app).get('/123123123');
    expect(res.body.message).toBe('Project with id 123123123 not found!');
    expect(res.statusCode).toBe(404);
  });
});

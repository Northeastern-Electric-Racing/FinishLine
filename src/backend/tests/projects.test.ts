import request from 'supertest';
import express from 'express';
import projectRouter from '../src/routes/projects.routes';
import prisma from '../src/prisma/prisma';
import { Role } from '@prisma/client';
import { getChangeRequestReviewState, getHighestProjectNumber } from '../src/utils/projects.utils';

const app = express();
app.use(express.json());
app.use('/', projectRouter);

jest.mock('../src/utils/projects.utils');
const mockGetChangeRequestReviewState = getChangeRequestReviewState as jest.Mock<
  Promise<boolean | null>
>;
const mockGetHighestProjectNumber = getHighestProjectNumber as jest.Mock<Promise<number>>;

const newProjectPayload = {
  userId: 1,
  crId: 2,
  name: 'build a car',
  carNumber: 3,
  summary: 'we are building a car'
};

const editProjectPayload = {
  ...newProjectPayload,
  budget: 100,
  projectId: 4,
  rules: ['a', 'b', 'c'],
  goals: [{ id: 1, detail: 'd' }],
  features: [{ id: 1, detail: 'e' }],
  otherConstraints: [{ id: 1, detail: 'f' }],
  wbsElementStatus: 'ACTIVE',
  googleDriveFolderLink: 'a',
  slideDeckLink: 'g',
  bomLink: 'h',
  taskListLink: 'i',
  projectLead: 5,
  projectManager: 6
};

const batman = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  googleAuthId: 'google',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN
};

describe('Projects', () => {
  beforeEach(() => {
    prisma.project.findMany = jest.fn();
    prisma.project.findUnique = jest.fn();
    prisma.user.findUnique = jest.fn();
    prisma.wBS_Element.create = jest.fn();
  });

  test('newProject fails with invalid userId', async () => {
    const proj = { ...newProjectPayload, userId: -1 };
    const res = await request(app).post('/new').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBe(1);
  });

  test('newProject fails with invalid crId', async () => {
    const proj = { ...newProjectPayload, crId: 'asdf' };
    const res = await request(app).post('/new').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBe(1);
  });

  test('newProject fails with invalid name', async () => {
    const proj = { ...newProjectPayload, name: '' };
    const res = await request(app).post('/new').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBe(1);
  });

  test('newProject works', async () => {
    mockGetChangeRequestReviewState.mockResolvedValue(true);
    mockGetHighestProjectNumber.mockResolvedValue(0);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.wBS_Element, 'create').mockResolvedValue({
      wbsElementId: 1,
      status: 'ACTIVE',
      carNumber: 1,
      projectNumber: 2,
      workPackageNumber: 3,
      dateCreated: new Date(),
      name: 'car',
      projectLeadId: 4,
      projectManagerId: 5
    });

    const res = await request(app).post('/new').send(newProjectPayload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      wbsNumber: { carNumber: 1, projectNumber: 2, workPackageNumber: 3 }
    });
  });

  test('editProject fails with bad status', async () => {
    const proj = { ...editProjectPayload, wbsElementStatus: 'alksdjflaksdfj' };
    const res = await request(app).post('/edit').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toStrictEqual([
      { location: 'body', msg: 'Invalid value', param: 'wbsElementStatus', value: 'alksdjflaksdfj' }
    ]);
  });

  test('editProject fails with feature with no detail', async () => {
    const proj = { ...editProjectPayload, features: [{ id: 4 }] };
    const res = await request(app).post('/edit').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBe(1);
  });

  test('editProject fails with feature with invalid id', async () => {
    const proj = { ...editProjectPayload, features: [{ id: -1, detail: 'alsdjf' }] };
    const res = await request(app).post('/edit').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBe(1);
  });

  test('editProject fails with feature with invalid detail', async () => {
    const proj = { ...editProjectPayload, features: [{ id: 4, detail: '' }] };
    const res = await request(app).post('/edit').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBe(1);
  });
});

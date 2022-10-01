import request from 'supertest';
import express from 'express';
import projectRouter from '../src/routes/projects.routes';
import prisma from '../src/prisma/prisma';
import {
  createRulesChangesJson,
  getChangeRequestReviewState,
  getHighestProjectNumber
} from '../src/utils/projects.utils';
import { batman } from './test-data/users.test-data';

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

describe('Projects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('newProject fails with invalid userId', async () => {
    const proj = { ...newProjectPayload, userId: -1 };
    const res = await request(app).post('/new').send(proj);

    expect(res.statusCode).toBe(400);
  });

  test('newProject fails with invalid crId', async () => {
    const proj = { ...newProjectPayload, crId: 'asdf' };
    const res = await request(app).post('/new').send(proj);

    expect(res.statusCode).toBe(400);
  });

  test('newProject fails with invalid name', async () => {
    const proj = { ...newProjectPayload, name: '' };
    const res = await request(app).post('/new').send(proj);

    expect(res.statusCode).toBe(400);
  });

  test('newProject works', async () => {
    mockGetChangeRequestReviewState.mockResolvedValue(true);
    mockGetHighestProjectNumber.mockResolvedValue(0);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });
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
  });

  test('editProject fails with feature with invalid id', async () => {
    const proj = { ...editProjectPayload, features: [{ id: -1, detail: 'alsdjf' }] };
    const res = await request(app).post('/edit').send(proj);

    expect(res.statusCode).toBe(400);
  });

  test('editProject fails with feature with invalid detail', async () => {
    const proj = { ...editProjectPayload, features: [{ id: 4, detail: '' }] };
    const res = await request(app).post('/edit').send(proj);

    expect(res.statusCode).toBe(400);
  });

  test('createRulesChangesJson with empty old + new lists', async () => {
    const rulesChanges = createRulesChangesJson('test', [], [], 1, 1, 1);
    expect(rulesChanges.length).toEqual(0);
  });

  test('createRulesChangesJson with empty new list and non-empty old list', async () => {
    const rules = ['rule1', 'rule2', 'rule3'];
    const rulesChanges = createRulesChangesJson('test', rules, [], 1, 1, 1);
    expect(rulesChanges.length).toEqual(3);
    rulesChanges.forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(1);
      expect(r.wbsElementId).toEqual(1);
      expect(r.detail).toEqual(`Removed test "${rules[i]}"`);
    });
  });

  test('createRulesChangesJson with empty old list and non-empty new list', async () => {
    const rules = ['rule1', 'rule2', 'rule3'];
    const rulesChanges = createRulesChangesJson('test', [], rules, 1, 1, 1);
    expect(rulesChanges.length).toEqual(3);
    rulesChanges.forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(1);
      expect(r.wbsElementId).toEqual(1);
      expect(r.detail).toEqual(`Added new test "${rules[i]}"`);
    });
  });

  test('createRulesChangesJson with non-empty old list and non-empty new list', async () => {
    const oldRules = ['rule1', 'rule2', 'rule3'];
    const newRules = ['rule4', 'rule5', 'rule6'];
    const rulesChanges = createRulesChangesJson('test', oldRules, newRules, 1, 1, 1);
    expect(rulesChanges.length).toEqual(6);
    rulesChanges.slice(0, 3).forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(1);
      expect(r.wbsElementId).toEqual(1);
      expect(r.detail).toEqual(`Removed test "${oldRules[i]}"`);
    });
    rulesChanges.slice(3).forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(1);
      expect(r.wbsElementId).toEqual(1);
      expect(r.detail).toEqual(`Added new test "${newRules[i]}"`);
    });
  });
});

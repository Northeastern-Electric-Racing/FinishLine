import request from 'supertest';
import express from 'express';
import projectRouter from '../src/routes/projects.routes';
import prisma from '../src/prisma/prisma';
import { Role, WBS_Element_Status } from '@prisma/client';
import { getChangeRequestReviewState, getHighestProjectNumber } from '../src/utils/projects.utils';
import { exampleProject1 } from '../../frontend/src/tests/TestSupport/TestData/Projects.stub';

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
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN
};

describe('Projects', () => {
  beforeEach(() => {
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
});

const project1 = {
  projectId: 1,
  wbsElementId: 1,
  wbsElement: {
    wbsElementId: 1,
    status: WBS_Element_Status.ACTIVE,
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 1,
    dateCreated: new Date('11/22/2022'),
    name: 'car',
    projectLeadId: 1,
    projectManagerId: 1,
    projectLead: batman,
    projectManager: batman,
    changes: {
      implementer: batman
    }
  },
  budget: 100,
  summary: 'we are building a car',
  googleDriveFolderLink: 'a',
  slideDeckLink: 'g',
  bomLink: 'h',
  taskListLink: 'i',
  rules: ['a', 'b', 'c'],
  goals: [{ id: 1, detail: 'd' }],
  features: [{ id: 1, detail: 'e' }],
  otherConstraints: [{ id: 1, detail: 'f' }],
  workPackages: [
    {
      workPackageId: 1,
      wbsElement: {
        projectLead: batman,
        projectManager: batman,
        changes: {
          implementer: batman
        }
      },
      expectedActivities: [{ id: 1, detail: 'e' }],
      deliverables: [{ id: 1, detail: 'e' }],
      dependencies: [
        {
          wbsElementId: 1,
          status: WBS_Element_Status.ACTIVE,
          carNumber: 1,
          projectNumber: 1,
          workPackageNumber: 1,
          dateCreated: new Date('11/22/2022'),
          name: 'car',
          projectLeadId: 1,
          projectManagerId: 1,
          projectLead: batman,
          projectManager: batman,
          changes: {
            implementer: batman
          }
        }
      ]
    }
  ],
  teamId: '1',
  team: {
    teamId: '1',
    teamName: 'batman',
    slackId: '1',
    description: 'hi',
    leaderId: '1',
    leader: batman,
    projects: [],
    members: [batman]
  },
  risks: {
    project: {
      wbsElementId: 1,
      wbsElement: {
        wbsElementId: 1,
        status: WBS_Element_Status.ACTIVE,
        carNumber: 1,
        projectNumber: 1,
        workPackageNumber: 1,
        dateCreated: new Date('11/22/2022'),
        name: 'car',
        projectLeadId: 1,
        projectManagerId: 1,
        projectLead: batman,
        projectManager: batman,
        changes: {
          implementer: batman
        }
      },
      status: WBS_Element_Status.ACTIVE,
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1,
      dateCreated: new Date('11/22/2022'),
      name: 'car',
      projectLeadId: 1,
      projectManagerId: 1,
      projectLead: batman,
      projectManager: batman,
      changes: {
        implementer: batman
      }
    },
    createdBy: batman,
    resolvedBy: batman,
    deletedBy: batman
  }
};

test('getAllProjects', async () => {
  jest.spyOn(prisma.project, 'findMany').mockResolvedValue([project1]);
  const res = await request(app).get('');

  expect(res.statusCode).toBe(200);
  expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
  console.log(project1);
  expect(res.body).toStrictEqual([project1]);
});

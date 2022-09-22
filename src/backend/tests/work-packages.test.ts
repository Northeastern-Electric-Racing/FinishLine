import request from 'supertest';
import express from 'express';
import workPackageRouter from '../src/routes/work-packages.routes';
import { CR_Type, Prisma, Role, WBS_Element_Status } from '@prisma/client';
import prisma from '../src/prisma/prisma';
import { WbsElement, WbsElementStatus } from 'shared';
import userRouter from '../src/routes/users.routes';

const app = express();
app.use(express.json());
app.use('/', workPackageRouter);

jest.mock('../src/utils/work-packages.utils');

const batman = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN
};

const nullReturn = () => {
  return null;
};

const mockDependency = nullReturn as unknown as jest.Mock<WbsElement>;

const someWBElement = {
  wbsElementId: 1,
  status: WBS_Element_Status.ACTIVE,
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 0,
  dateCreated: new Date(),
  name: 'car',
  projectLeadId: 4,
  projectManagerId: 5,
  project: {
    projectId: 2,
    wbsElementId: 3,
    budget: 3,
    summary: 'ajsjdfk',
    rules: ['a'],
    workPackages: [
      {
        workPackageId: 2,
        wbsElementId: 7,
        projectId: 6,
        orderInProject: 0,
        startDate: new Date('2020-07-14'),
        progress: 5,
        duration: 4,
        wbsElement: {
          workPackageNumber: 9
        },
        dependencies: []
      }
    ]
  }
};

const createWorkPackagePayload = {
  projectWbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  name: 'Pack your bags',
  crId: 1,
  userId: batman.userId,
  startDate: '2022-09-18',
  duration: 5,
  dependencies: [
    {
      wbsElementId: 65,
      dateCreated: new Date('11/24/2021'),
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1,
      name: 'prereq',
      status: WBS_Element_Status.COMPLETE
    }
  ],
  expectedActivities: ['ayo'],
  deliverables: ['ajdhjakfjafja']
};

const changeBatmobile = {
  crId: 1,
  submitterId: 1,
  wbsElementId: 65,
  type: CR_Type.DEFINITION_CHANGE,
  changes: [
    {
      changeRequestId: 1,
      implementerId: 1,
      wbsElementId: 65,
      detail: 'changed batmobile from white (yuck) to black'
    }
  ],
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: new Date('11/25/2020'),
  accepted: true,
  reviewerId: 1,
  reviewNotes: 'white sucks'
};

const nulledWBS = null as unknown as jest.Mock<WbsElement>;

describe('Work Packages', () => {
  beforeEach(() => {
    prisma.user.findUnique = jest.fn();
    prisma.change_Request.findUnique = jest.fn();
    prisma.work_Package.findMany = jest.fn();
    prisma.work_Package.findUnique = jest.fn();
  });

  test('createWorkPackage fails if WBS number does not represent a project', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);
    const proj = {
      ...createWorkPackagePayload,
      projectWbsNum: {
        carNumber: 1,
        projectNumber: 2,
        workPackageNumber: 2
      }
    };
    const res = await request(app).post('/create').send(proj);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Given WBS Number 1.2.2 is not for a project.');
  });

  test('createWorkPackage fails if any elements in the dependencies are null', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(someWBElement);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(null);

    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('One of the dependencies was not found.');
  });

  test('findUniqueUser', async () => {
    app.use('/', workPackageRouter);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...batman, googleAuthId: 'b' });
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);

    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
  });
});

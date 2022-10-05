import request from 'supertest';
import express from 'express';
import workPackageRouter from '../src/routes/work-packages.routes';
import { CR_Type, WBS_Element_Status } from '@prisma/client';
import prisma from '../src/prisma/prisma';
import { batman } from './test-data/users.test-data';
import { someProject } from './test-data/projects.test-data';

const app = express();
app.use(express.json());
app.use('/', workPackageRouter);

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

describe('Work Packages', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createWorkPackage fails if WBS number does not represent a project', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
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

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Given WBS Number 1.2.2 is not for a project.');
  });

  test('createWorkPackage fails if any elements in the dependencies are null', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(someProject);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(null);

    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('One of the dependencies was not found.');
  });
});

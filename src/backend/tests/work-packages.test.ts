import request from 'supertest';
import express from 'express';
import workPackageRouter from '../src/routes/work-packages.routes';
import { WBS_Element_Status } from '@prisma/client';
import prisma from '../src/prisma/prisma';

const app = express();
app.use(express.json());
app.use('/', workPackageRouter);

// jest.mock('../src/utils/work-packages.utils');

const createWorkPackagePayload = {
  projectWbsNum: '1.2.0',
  name: 'Pack your bags',
  crId: 2,
  userId: 1,
  startDate: new Date('01/01/21'),
  duration: 5,
  dependencies: [
    {
      wbsElementId: 65,
      dateCreated: new Date('12/25/20'),
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1,
      name: 'prereq',
      status: WBS_Element_Status.COMPLETE
    }
  ],
  expectedActivities: [{ descriptionId: 5, dateAdded: '01/05/21', detail: 'be active' }],
  deliverables: [{ descriptionId: 3, dateAdded: '01/01/22', detail: 'did it work' }]
};

describe('Work Packages', () => {
  beforeEach(() => {
    prisma.work_Package.findMany = jest.fn();
    prisma.work_Package.findUnique = jest.fn();
  });

  test('createWorkPackage fails if WBS number does not represent a project', async () => {
    const proj = { ...createWorkPackagePayload, projectWbsNum: '1.2.1' };
    const res = await request(app).post('/create').send(proj);

    expect(res.statusCode).toBe(400);
  });

  test('createWorkPackage fails if any elements in the dependencies are null', async () => {
    const proj = { ...createWorkPackagePayload, dependencies: [null] };
    const res = await request(app).post('/create').send(proj);

    expect(res.statusCode).toBe(400);
  });
});

import request from 'supertest';
import express from 'express';
import changeRequestsRouter from '../src/routes/change-requests.routes';
import prisma from '../src/prisma/prisma';
import { CR_Type, Role } from '@prisma/client';

const app = express();
app.use(express.json());
app.use('/', changeRequestsRouter);

const batman = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN
};

const wbs = {
  wbsElementId: 31,
  status: 'ACTIVE',
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 3,
  dateCreated: new Date(),
  name: 'car',
  projectLeadId: 4,
  projectManagerId: 5
};

const changeCloak = {
  crId: 2,
  submitterId: 1,
  wbsNum: {
    carNumber: 1,
    dateCreated: new Date(),
    name: 'car',
    projectLeadId: 4,
    projectManagerId: 5,
    projectNumber: 2,
    status: 'ACTIVE',
    wbsElementId: 31,
    workPackageNumber: 3
  },
  submitter: batman,
  dateSubmitted: new Date('11/25/2020'),
  wbsElementId: 65,
  wbsElement: wbs,
  reviewer: batman,
  dateReviewed: new Date('11/24/2020'),
  type: CR_Type.DEFINITION_CHANGE,
  changes: [
    {
      crId: 2,
      implementedChanges: [
        {
          changeRequestId: 2,
          detail: 'changed cloak color from black to red',
          implementer: {
            email: 'notbatman@gmail.com',
            firstName: 'Bruce',
            lastName: 'Wayne',
            role: 'APP_ADMIN',
            userId: 1
          }
        }
      ],
      changeRequestId: 2,
      implementerId: 1,
      wbsNum: {
        carNumber: 1,
        dateCreated: new Date(),
        name: 'car',
        projectLeadId: 4,
        projectManagerId: 5,
        projectNumber: 2,
        status: 'ACTIVE',
        wbsElementId: 31,
        workPackageNumber: 3
      },
      implementer: batman,
      wbsElement: wbs,
      wbsElementId: 65,
      detail: 'changed cloak color from black to red'
    }
  ],
  scapeChangeRequest: [
    {
      why: '',
      proposedSolutions: [
        {
          createdBy: batman
        }
      ]
    }
  ],
  stageGateChangeRequest: true,
  activationChangeRequest: [
    {
      projectLead: batman,
      projectManager: batman
    }
  ],
  accepted: true,
  reviewerId: 1,
  reviewNotes: 'red is better'
};

const transformedCR = {
  crId: 2,
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 3 },
  submitter: {
    userId: 1,
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'notbatman@gmail.com',
    emailId: 'notbatman',
    role: 'APP_ADMIN'
  },
  dateSubmitted: '2020-11-25T05:00:00.000Z',
  type: 'DEFINITION_CHANGE',
  reviewer: {
    userId: 1,
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'notbatman@gmail.com',
    emailId: 'notbatman',
    role: 'APP_ADMIN'
  },
  dateReviewed: '2020-11-24T05:00:00.000Z',
  accepted: true,
  reviewNotes: 'red is better',
  implementedChanges: [
    {
      wbsNum: {
        carNumber: 1,
        projectNumber: 2,
        workPackageNumber: 3
      },
      changeRequestId: 2,
      implementer: {
        email: 'notbatman@gmail.com',
        emailId: 'notbatman',
        firstName: 'Bruce',
        lastName: 'Wayne',
        role: 'APP_ADMIN',
        userId: 1
      },
      detail: 'changed cloak color from black to red'
    }
  ]
};

describe('ChangeRequests', () => {
  beforeEach(() => {
    prisma.change_Request.findUnique = jest.fn();
  });

  test('getChangeRequestByID returns 404 when crId does not exist', async () => {
    const res = await request(app).get('/123');

    expect(res.statusCode).toBe(404);
  });

  test('getChangeRequestByID works', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeCloak);

    const res = await request(app).get('/2');

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual(transformedCR);
  });
});

import request from 'supertest';
import express from 'express';
import workPackageRouter from '../src/routes/work-packages.routes';
import prisma from '../src/prisma/prisma';
import { batman } from './test-data/users.test-data';
import { someProject } from './test-data/projects.test-data';
import { wonderwoman } from './test-data/users.test-data';
import { createWorkPackagePayload } from './test-data/work-packages.test-data';
import { changeBatmobile, unreviewedCr } from './test-data/change-requests.test-data';
import { getChangeRequestReviewState } from '../src/utils/projects.utils';

const app = express();
app.use(express.json());
app.use('/', workPackageRouter);

jest.mock('../src/utils/projects.utils');
const mockGetChangeRequestReviewState = getChangeRequestReviewState as jest.Mock<Promise<boolean | null>>;

describe('Work Packages', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createWorkPackage fails if WBS number does not represent a project', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);
    mockGetChangeRequestReviewState.mockResolvedValue(true);
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
    mockGetChangeRequestReviewState.mockResolvedValue(true);

    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('One of the dependencies was not found.');
  });
  test('createWorkPackage fails if user does not have access', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);

    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Access Denied');
  });

  test('createWorkPackage fails if user does not exist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeBatmobile);
    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(`User with id #${createWorkPackagePayload.userId} not found!`);
  });

  test('createWorkPackage fails when changeRequest is not found', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);
    mockGetChangeRequestReviewState.mockResolvedValue(null);
    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(`change request with id #1 not found!`);
  });

  test('createWorkPackage fails when changeRequest has not been reviewed', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(unreviewedCr);
    mockGetChangeRequestReviewState.mockResolvedValue(false);
    const res = await request(app).post('/create').send(createWorkPackagePayload);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(`Cannot implement an unreviewed change request`);
  });
});

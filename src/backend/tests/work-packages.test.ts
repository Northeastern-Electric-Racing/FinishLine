import prisma from '../src/prisma/prisma';
import { batman } from './test-data/users.test-data';
import { wbsElement1 } from './test-data/projects.test-data';
import { wonderwoman } from './test-data/users.test-data';
import { createWorkPackagePayload } from './test-data/work-packages.test-data';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import { getChangeRequestReviewState } from '../src/utils/projects.utils';
import { calculateWorkPackageProgress } from '../src/utils/work-packages.utils';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import WorkPackageService from '../src/services/work-packages.services';
import { WbsNumber } from 'shared';
import { WBS_Element, WBS_Element_Status } from '@prisma/client';

jest.mock('../src/utils/projects.utils');
const mockGetChangeRequestReviewState = getChangeRequestReviewState as jest.Mock<Promise<boolean | null>>;

describe('Work Packages', () => {
  /* WORK PACKAGE SERVICE FUNCTION INPUT ARGUMENTS */
  const projectWbsNum = {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  };
  const name = 'Pack your bags';
  const crId = 1;
  const { userId } = batman;
  const startDate = '2022-09-18';
  const duration = 5;
  const dependencies = [
    {
      wbsElementId: 65,
      dateCreated: new Date('11/24/2021'),
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1,
      name: 'prereq',
      status: WBS_Element_Status.COMPLETE,
      projectLeadId: null,
      projectManagerId: null
    }
  ];
  const expectedActivities = ['ayo'];
  const deliverables = ['ajdhjakfjafja'];
  const createWorkPackageArgs: [WbsNumber, string, number, number, string, number, WBS_Element[], string[], string[]] = [
    projectWbsNum,
    name,
    crId,
    userId,
    startDate,
    duration,
    dependencies,
    expectedActivities,
    deliverables
  ];
  /*************************************************/

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createWorkPackage fails if WBS number does not represent a project', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    mockGetChangeRequestReviewState.mockResolvedValue(true);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage(
        {
          carNumber: 1,
          projectNumber: 2,
          workPackageNumber: 2
        },
        name,
        crId,
        userId,
        startDate,
        duration,
        dependencies,
        expectedActivities,
        deliverables
      );
    };

    await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'Given WBS Number 1.2.2 is not for a project.'));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails if any elements in the dependencies are null', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(wbsElement1);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);
    mockGetChangeRequestReviewState.mockResolvedValue(true);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'One of the dependencies was not found.'));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails if user does not have access', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrow(AccessDeniedException);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails if user does not exist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new NotFoundException('User', userId));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails when changeRequest is not found', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);
    mockGetChangeRequestReviewState.mockResolvedValue(null);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new NotFoundException('Change Request', 1));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails when changeRequest has not been reviewed', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    mockGetChangeRequestReviewState.mockResolvedValue(false);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'Cannot implement an unreviewed change request'));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails if the associated wbsElem returns null', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    mockGetChangeRequestReviewState.mockResolvedValue(true);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new NotFoundException('WBS Element', '1.2.0'));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('createWorkPackage fails if the associated wbsElem does not have a project object', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    mockGetChangeRequestReviewState.mockResolvedValue(true);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new NotFoundException('WBS Element', '1.2.0'));
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  test('calculateWorkPackageProgress', async () => {
    expect(calculateWorkPackageProgress([], [])).toBe(0);
  });
});

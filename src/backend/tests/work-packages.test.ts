import prisma from '../src/prisma/prisma';
import { batman, wonderwoman } from './test-data/users.test-data';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import { calculateWorkPackageProgress } from '../src/utils/work-packages.utils';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import WorkPackageService from '../src/services/work-packages.services';
import { WbsNumber } from 'shared';
import { User, WBS_Element, WBS_Element_Status } from '@prisma/client';
import * as changeRequestUtils from '../src/utils/change-requests.utils';
import { prismaProject1 } from './test-data/projects.test-data';
import { prismaWorkPackage1 } from './test-data/work-packages.test-data';

describe('Work Packages', () => {
  /* WORK PACKAGE SERVICE FUNCTION DEFAULT INPUT ARGUMENTS */
  const projectWbsNum = {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  };
  const name = 'Pack your bags';
  const crId = 1;
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
      projectManagerId: null,
      dateDeleted: null,
      deletedByUserId: null
    }
  ];
  const expectedActivities = ['ayo'];
  const deliverables = ['ajdhjakfjafja'];
  const createWorkPackageArgs: [User, WbsNumber, string, number, string, number, WBS_Element[], string[], string[]] = [
    batman,
    projectWbsNum,
    name,
    crId,
    startDate,
    duration,
    dependencies,
    expectedActivities,
    deliverables
  ];
  /*********************************************************/

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
      return prismaChangeRequest1;
    });
  });

  test('createWorkPackage fails if WBS number does not represent a project', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage(
        batman,
        {
          carNumber: 1,
          projectNumber: 2,
          workPackageNumber: 2
        },
        name,
        crId,
        startDate,
        duration,
        dependencies,
        expectedActivities,
        deliverables
      );
    };

    await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'Given WBS Number 1.2.2 is not for a project.'));
  });

  test('createWorkPackage fails if any elements in the dependencies are null', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    jest
      .spyOn(prisma.wBS_Element, 'findUnique')
      .mockResolvedValueOnce({ ...prismaWbsElement1, project: prismaProject1 } as any);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'One of the dependencies was not found.'));
  });

  test('createWorkPackage fails if user does not have access', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage(
        wonderwoman,
        projectWbsNum,
        name,
        crId,
        startDate,
        duration,
        dependencies,
        expectedActivities,
        deliverables
      );
    };

    await expect(callCreateWP).rejects.toThrow(AccessDeniedException);
  });

  test('createWorkPackage fails when changeRequest validation fails', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);
    jest.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
      throw new HttpException(400, 'error');
    });

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'error'));
  });

  test('createWorkPackage fails if the associated wbsElem returns null', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new NotFoundException('WBS Element', '1.2.0'));
  });

  test('createWorkPackage fails if the associated wbsElem does not have a project object', async () => {
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

    const callCreateWP = async () => {
      return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
    };

    await expect(callCreateWP).rejects.toThrowError(new NotFoundException('WBS Element', '1.2.0'));
  });

  test('calculateWorkPackageProgress', async () => {
    expect(calculateWorkPackageProgress([], [])).toBe(0);
  });

  test('getSingleWorkPackage fails if the work package does not exist', async () => {
    jest.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue(null);

    await expect(
      async () => await WorkPackageService.getSingleWorkPackage({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 })
    ).rejects.toThrow(new NotFoundException('Work Package', '1.1.1'));
  });

  test('getSingleWorkPackage fails if project wbs number given', async () => {
    await expect(
      async () => await WorkPackageService.getSingleWorkPackage({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
    ).rejects.toThrow(new HttpException(404, 'WBS Number 1.1.0 is a project WBS#, not a Work Package WBS#'));
  });

  test('getSingleWorkPackage runs properly', async () => {
    jest.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue(prismaWorkPackage1);

    const result = await WorkPackageService.getSingleWorkPackage({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 });

    expect(result).toEqual(prismaWorkPackage1);
  });
});

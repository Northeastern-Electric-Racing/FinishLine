import prisma from '../src/prisma/prisma';
import { aquaman, batman, wonderwoman } from './test-data/users.test-data';
import { prismaWbsElement1, prismaWbsElement2 } from './test-data/wbs-element.test-data';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import { calculateWorkPackageProgress } from '../src/utils/work-packages.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../src/utils/errors.utils';
import WorkPackageService from '../src/services/work-packages.services';
import { WbsNumber } from 'shared';
import { User } from '@prisma/client';
import { WorkPackageStage } from 'shared';
import * as changeRequestUtils from '../src/utils/change-requests.utils';
import * as slackUtils from '../src/utils/slack.utils';
import { mockLinkType1, prismaProject1, transformedMockLinkType1 } from './test-data/projects.test-data';
import * as workPackageTransformer from '../src/transformers/work-packages.transformer';
import { mockWorkPackageTemplate1, prismaWorkPackage1, sharedWorkPackage } from './test-data/work-packages.test-data';
import linkTypeQueryArgs from '../src/prisma-query-args/link-types.query-args';
import ProjectsService from '../src/services/projects.services';

describe('Work Packages', () => {
  /* WORK PACKAGE SERVICE FUNCTION DEFAULT INPUT ARGUMENTS */
  const projectWbsNum = {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  };
  const name = 'Pack your bags';
  const crId = 1;
  const startDate = '2023-04-24';
  const duration = 5;
  const blockedBy: WbsNumber[] = [
    {
      carNumber: 1,
      projectNumber: 2,
      workPackageNumber: 1
    }
  ];
  const expectedActivities = ['ayo'];
  const deliverables = ['ajdhjakfjafja'];
  const stage = WorkPackageStage.Design;
  const createWorkPackageArgs: [User, string, number, WorkPackageStage, string, number, WbsNumber[], string[], string[]] = [
    batman,
    name,
    crId,
    stage,
    startDate,
    duration,
    blockedBy,
    expectedActivities,
    deliverables
  ];
  /*********************************************************/

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
      return { ...prismaChangeRequest1, changes: [] };
    });

    vi.spyOn(workPackageTransformer, 'default').mockReturnValue(sharedWorkPackage);
  });

  test('calculateWorkPackageProgress', async () => {
    expect(calculateWorkPackageProgress([], [])).toBe(0);
  });

  describe('createWorkPackage', () => {
    test('createWorkPackage fails if WBS number does not represent a project', async () => {
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement2);
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage(
          batman,
          name,
          crId,
          stage,
          startDate,
          duration,
          blockedBy,
          expectedActivities,
          deliverables
        );
      };

      await expect(callCreateWP).rejects.toThrowError(
        new HttpException(400, 'Given WBS Number 1.2.2 is not for a project.')
      );
    });

    test('createWorkPackage fails if any elements in the blocked by are null', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(null);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce({
        ...prismaWbsElement1,
        project: prismaProject1
      } as any);

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
      };

      await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'One of the blockers was not found.'));
    });

    test('createWorkPackage fails if user does not have access', async () => {
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement2);
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage(
          wonderwoman,
          name,
          crId,
          stage,
          startDate,
          duration,
          blockedBy,
          expectedActivities,
          deliverables
        );
      };

      await expect(callCreateWP).rejects.toThrow(AccessDeniedException);
    });

    test('createWorkPackage fails when changeRequest validation fails', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);
      vi.spyOn(changeRequestUtils, 'validateChangeRequestAccepted').mockImplementation(async (_crId) => {
        throw new HttpException(400, 'error');
      });

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
      };

      await expect(callCreateWP).rejects.toThrowError(new HttpException(400, 'error'));
    });

    test('createWorkPackage fails if the associated wbsElem returns null', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
      };

      await expect(callCreateWP).rejects.toThrowError(
        new NotFoundException('WBS Element', prismaChangeRequest1.wbsElementId.toString())
      );
    });

    test('createWorkPackage fails if the associated wbsElem does not have a project object', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
      };

      await expect(callCreateWP).rejects.toThrowError(
        new NotFoundException('WBS Element', prismaChangeRequest1.wbsElementId.toString())
      );
    });

    test('fails if the blocked by is a project', async () => {
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(prismaWbsElement1);
      const argsToTest: [User, string, number, WorkPackageStage, string, number, WbsNumber[], string[], string[]] = [
        batman,
        name,
        crId,
        stage,
        startDate,
        duration,
        [projectWbsNum],
        expectedActivities,
        deliverables
      ];

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage.apply(null, argsToTest);
      };

      await expect(callCreateWP()).rejects.toThrow(new HttpException(400, 'A Project cannot be a Blocker'));
    });

    test('the endpoint completes successfully', async () => {
      const foundWbsElem = {
        ...prismaWbsElement1,
        project: { carNumber: 1, projectNumber: 2, workPackageNumber: 0, projectId: 55, workPackages: [] }
      };
      const newPrismaWp = {
        ...prismaWorkPackage1,
        startDate: new Date('04/24/2023'),
        wbsElement: { carNumber: 1, projectNumber: 2, workPackageNumber: 3 }
      };
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(foundWbsElem);
      vi.spyOn(prisma.work_Package, 'create').mockResolvedValue(newPrismaWp);

      const callCreateWP = async () => {
        return await WorkPackageService.createWorkPackage.apply(null, createWorkPackageArgs);
      };

      await expect(callCreateWP()).resolves.toEqual('1.2.3');

      // check that prisma functions (or functions that call prisma functions)
      // are called exactly as many times as needed
      expect(prisma.work_Package.create).toHaveBeenCalledTimes(1);
      expect(changeRequestUtils.validateChangeRequestAccepted).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1 + blockedBy.length);
    });
  });

  describe('deleteWorkPackage', () => {
    const wbsNum: WbsNumber = { carNumber: 1, projectNumber: 2, workPackageNumber: 3 };

    test('User does not have submit permission', async () => {
      await expect(() => WorkPackageService.deleteWorkPackage(wonderwoman, wbsNum)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete work packages')
      );
    });

    test('Work package does not exist', async () => {
      vi.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue(null);
      await expect(() => WorkPackageService.deleteWorkPackage(batman, wbsNum)).rejects.toThrow(
        new NotFoundException('Work Package', '1.2.3')
      );
      expect(prisma.work_Package.findFirst).toHaveBeenCalledTimes(1);
    });

    test('Work package wbs has invalid work package number', async () => {
      await expect(() => WorkPackageService.deleteWorkPackage(batman, { ...wbsNum, workPackageNumber: 0 })).rejects.toThrow(
        new HttpException(400, '1.2.0 is not a valid work package WBS!')
      );
    });

    test('Work package already deleted', async () => {
      vi.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue({
        ...prismaWorkPackage1,
        wbsElement: { dateDeleted: new Date() }
      } as any);

      await expect(() => WorkPackageService.deleteWorkPackage(batman, wbsNum)).rejects.toThrow(
        new DeletedException('Work Package', '1.2.3')
      );

      expect(prisma.work_Package.findFirst).toHaveBeenCalledTimes(1);
    });

    test('Work package successfully deleted', async () => {
      vi.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue({ ...prismaWorkPackage1, wbsElement: {} } as any);
      vi.spyOn(prisma.work_Package, 'update').mockResolvedValue(prismaWorkPackage1);

      await WorkPackageService.deleteWorkPackage(batman, wbsNum);

      expect(prisma.work_Package.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.work_Package.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSingleWorkPackage', () => {
    test('getSingleWorkPackage fails if the work package does not exist', async () => {
      vi.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue(null);

      await expect(
        async () => await WorkPackageService.getSingleWorkPackage({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 })
      ).rejects.toThrow(new NotFoundException('Work Package', '1.1.1'));
    });

    test('getSingleWorkPackage fails if a project wbs number given (work_package number of 0)', async () => {
      await expect(
        async () => await WorkPackageService.getSingleWorkPackage({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
      ).rejects.toThrow(new HttpException(404, 'WBS Number 1.1.0 is a project WBS#, not a Work Package WBS#'));
    });

    test('getSingleWorkPackage runs properly', async () => {
      vi.spyOn(prisma.work_Package, 'findFirst').mockResolvedValue(prismaWorkPackage1);

      const result = await WorkPackageService.getSingleWorkPackage({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 });

      expect(result).toStrictEqual(sharedWorkPackage);
    });
  });

  describe('getManyWorkPackages', () => {
    test('should retrieve an empty array for an empty WBS numbers array', async () => {
      const wbsNums: WbsNumber[] = [];

      vi.spyOn(prisma.work_Package, 'findMany').mockResolvedValue([]);

      const result = await WorkPackageService.getManyWorkPackages(wbsNums);

      expect(result).toStrictEqual([]);
    });
  });

  describe('slackMessageUpcomingDeadlines', () => {
    beforeEach(() => {
      vi.spyOn(slackUtils, 'sendSlackUpcomingDeadlineNotification').mockImplementation(async () => {});
    });

    it('fails when the user is not an admin', async () => {
      await expect(() => WorkPackageService.slackMessageUpcomingDeadlines(wonderwoman, new Date())).rejects.toThrow(
        new AccessDeniedAdminOnlyException('send the upcoming deadlines slack messages')
      );
    });
  });

  describe('editWorkPackageTemplate', () => {
    test('Edit WorkPackageTemplate fails if the submitter is not an admin', async () => {
      vi.spyOn(prisma.work_Package_Template, 'findUnique').mockResolvedValue({ ...mockWorkPackageTemplate1 });
      await expect(
        WorkPackageService.editWorkPackageTemplate(
          batman,
          mockWorkPackageTemplate1.workPackageTemplateId,
          mockWorkPackageTemplate1.templateName,
          mockWorkPackageTemplate1.templateNotes,
          mockWorkPackageTemplate1.expectedActivities,
          mockWorkPackageTemplate1.deliverables,
          mockWorkPackageTemplate1.blockedBy,
          mockWorkPackageTemplate1.stage,
          mockWorkPackageTemplate1.duration,
          mockWorkPackageTemplate1.workPackageName
        )
      ).rejects.toThrow(new AccessDeniedException('Only an admin can update the linkType'));
    });
    test('Throws error if linkType not found', async () => {
      vi.spyOn(prisma.linkType, 'findUnique').mockResolvedValue(null);
      await expect(
        ProjectsService.editLinkType(mockLinkType1.name, mockLinkType1.iconName, !mockLinkType1.required, batman)
      ).rejects.toThrow(new NotFoundException('Link Type', mockLinkType1.name));
    });
    test('LinkType edits successfully, changes its foreign key in Link objects as well', async () => {
      vi.spyOn(prisma.linkType, 'findUnique').mockResolvedValue({ ...mockLinkType1, creatorId: batman.userId });
      vi.spyOn(prisma.linkType, 'update').mockResolvedValue({
        ...mockLinkType1,
        creatorId: batman.userId,
        iconName: 'Doc2'
      });

      const updated = await ProjectsService.editLinkType(mockLinkType1.name, 'Doc2', mockLinkType1.required, batman);

      expect(updated).toEqual(transformedMockLinkType1);
      expect(prisma.linkType.update).toHaveBeenCalledWith({
        where: { name: mockLinkType1.name },
        data: {
          iconName: 'Doc2',
          required: mockLinkType1.required
        },
        ...linkTypeQueryArgs
      });
    });
  });
});

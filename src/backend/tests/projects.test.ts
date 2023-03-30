import prisma from '../src/prisma/prisma';
import { getHighestProjectNumber } from '../src/utils/projects.utils';
import * as changeRequestUtils from '../src/utils/change-requests.utils';
import { aquaman, batman, wonderwoman } from './test-data/users.test-data';
import { prismaProject1, sharedProject1 } from './test-data/projects.test-data';
import { prismaChangeRequest1 } from './test-data/change-requests.test-data';
import { prismaTeam1 } from './test-data/teams.test-data';
import * as projectTransformer from '../src/transformers/projects.transformer';
import ProjectsService from '../src/services/projects.services';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import WorkPackagesService from '../src/services/work-packages.services';
import { WbsNumber } from 'shared';
import { User } from '@prisma/client';

jest.mock('../src/utils/projects.utils');
const mockGetHighestProjectNumber = getHighestProjectNumber as jest.Mock<Promise<number>>;

describe('Projects', () => {
  beforeEach(() => {
    jest
      .spyOn(changeRequestUtils, 'validateChangeRequestAccepted')
      .mockImplementation(async (_crId) => prismaChangeRequest1);
    jest.spyOn(projectTransformer, 'default').mockReturnValue(sharedProject1);
    jest.spyOn(WorkPackagesService, 'deleteWorkPackage').mockImplementation(async (_user: User, _wbsNum: WbsNumber) => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getSingleProject fails given invalid project wbs number', async () => {
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 })
    ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));
  });

  test('getSingleProject fails when associated wbsElement doesnt exist', async () => {
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);
    await expect(
      async () => await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
    ).rejects.toThrow(new NotFoundException('Project', '1.1.0'));
  });

  test('getSingleProject works', async () => {
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

    const res = await ProjectsService.getSingleProject({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 });

    expect(res).toStrictEqual(sharedProject1);
  });

  test('getAllProjects works', async () => {
    jest.spyOn(prisma.project, 'findMany').mockResolvedValue([]);

    const res = await ProjectsService.getAllProjects();

    expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual([]);
  });

  test('createProject fails when unknown teamId provided', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

    await expect(async () => await ProjectsService.createProject(batman, 1, 2, 'name', 'summary', 'teamId')).rejects.toThrow(
      new NotFoundException('Team', 'teamId')
    );
  });

  test('createProject works', async () => {
    mockGetHighestProjectNumber.mockResolvedValue(0);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    jest.spyOn(prisma.wBS_Element, 'create').mockResolvedValue(prismaWbsElement1);

    const res = await ProjectsService.createProject(batman, 1, 2, 'name', 'summary', undefined);

    expect(res).toStrictEqual({
      carNumber: prismaWbsElement1.carNumber,
      projectNumber: prismaWbsElement1.projectNumber,
      workPackageNumber: prismaWbsElement1.workPackageNumber
    });
  });

  describe('setProjectTeam', () => {
    test('setProjectTeam fails given invalid project wbs number', async () => {
      await expect(
        async () =>
          await ProjectsService.setProjectTeam(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 1 }, 'teamId')
      ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));
    });

    test('setProjectTeam fails when the team is not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.setProjectTeam(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }, 'teamId')
      ).rejects.toThrow(new NotFoundException('Team', 'teamId'));
    });

    test('setProjectTeam fails with no permission from submitter (guest)', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.setProjectTeam(
            wonderwoman,
            { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
            'teamId'
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('set project teams'));
    });

    test('setProjectTeam fails with no permission from submitter (leadership)', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      jest.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.setProjectTeam(aquaman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }, 'teamId')
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('set project teams'));
    });

    test('setProjectTeam works if the submitter is not an admin but is the lead of the team', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({ ...prismaTeam1, leaderId: aquaman.userId });
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);

      // no error, no return value
      await ProjectsService.setProjectTeam(aquaman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 }, 'teamId');
    });
  });

  describe('deleteProject', () => {
    test('deleteProject works correctly', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      jest.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);
      jest.spyOn(prisma.work_Package, 'findMany').mockResolvedValue([]);

      const res = await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 });

      expect(res).toStrictEqual(sharedProject1);
      expect(prisma.project.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledTimes(1);
    });

    test('deleteProject fails when bad role', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      jest.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);

      await expect(
        async () =>
          await ProjectsService.deleteProject(wonderwoman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete projects'));

      expect(prisma.project.findFirst).toHaveBeenCalledTimes(0);
      expect(prisma.project.update).toHaveBeenCalledTimes(0);
    });

    test('deleteProject fails when wp, not project, given', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(prismaProject1);
      jest.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);

      await expect(
        async () => await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 1 })
      ).rejects.toThrow(new HttpException(400, `1.1.1 is not a valid project WBS #!`));

      expect(prisma.project.findFirst).toHaveBeenCalledTimes(0);
      expect(prisma.project.update).toHaveBeenCalledTimes(0);
    });

    test('deleteProject fails when project not found', async () => {
      jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

      await expect(
        async () => await ProjectsService.deleteProject(batman, { carNumber: 1, projectNumber: 1, workPackageNumber: 0 })
      ).rejects.toThrow(new NotFoundException('Project', '1.1.0'));

      expect(prisma.project.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledTimes(0);
    });
  });
});

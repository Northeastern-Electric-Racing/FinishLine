import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils';
import * as slackModule from '../../src/integrations/slack';
import { supermanAdmin } from '../test-data/users.test-data';
import prisma from '../../src/prisma/prisma';
import { Organization, User, WBS_Element_Status } from '@prisma/client';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import WorkPackagesService from '../../src/services/work-packages.services';
import { WorkPackage } from '../../src/prisma/context';

describe('Change Request Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;
  let wp: WorkPackage;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    await prisma.wBS_Element.create({
      data: {
        carNumber: 12,
        projectNumber: 13,
        workPackageNumber: 14,
        name: 'test wbs',
        organizationId: orgId,
        status: WBS_Element_Status.INACTIVE
      }
    });

    const car = await createTestCar(orgId, user.userId, 2);
    const project = await createTestProject(user, orgId, undefined, car.carId, 2, 1);
    wp = await createTestWorkPackage(user, orgId, project.projectId, 2, 1, 1);

    const team = await prisma.team.create({
      data: {
        teamName: 'Test Team',
        organizationId: orgId,
        slackId: 'test-slack-id',
        description: 'Test',
        financeTeam: false,
        operationsTeam: false,
        headId: user.userId
      }
    });

    await prisma.wBS_Element.update({
      where: {
        wbsElementId: wp.wbsElementId
      },
      data: {
        status: WBS_Element_Status.INACTIVE
      }
    });
    await prisma.project.update({
      where: {
        projectId: wp.projectId
      },
      data: {
        teams: {
          connect: {
            teamId: team.teamId
          }
        }
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('send messages', () => {
    it('does not send a message for an inactive work package as its start date is two days later', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // tomorrow
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still inactive. '),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });

    it('sends a message for an inactive work package and its start date is tomorrow', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still inactive. The start date is tomorrow.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('sends a message for an inactive work package and its start date is today', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now()), // today
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still inactive. The start date is today.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('sends a message for an inactive work package and its start date was yesterday', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still inactive. The start date was yesterday.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('does not send a message for an inactive work package since its start date was two days ago', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still inactive.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });

    it('does not send a message for an inactive work package and its end date in two days', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          duration: 1
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still not complete.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });

    it('sends a message for an inactive work package and its end date is tomorrow', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          duration: 1
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still not complete. The end date is tomorrow.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('sends a message for an inactive work package and its end date is today', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          duration: 1
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();
      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still not complete. The end date is today.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('sends a message for an inactive work package and its end date was yesterday', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
          duration: 1
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still not complete. The end date was yesterday.'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('does not send a message for an inactive work package since its end date was two days ago', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
          duration: 1
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
      console.log(sendMessageSpy.mock.calls);
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still not complete'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });
  });

  it('sends a message for both the end date and start date being today', async () => {
    await prisma.work_Package.update({
      where: {
        workPackageId: wp.workPackageId
      },
      data: {
        startDate: new Date(Date.now()), // today
        duration: 0
      }
    });

    const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
    console.log(sendMessageSpy.mock.calls);
    await WorkPackagesService.sendWorkPackageDeadlineNotifications();
    expect(sendMessageSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('The work package, 2.1.1, is still inactive. The start date is today.'),
      expect.any(String),
      expect.any(String)
    );
    expect(sendMessageSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('The work package, 2.1.1, is still not complete. The end date is today.'),
      expect.any(String),
      expect.any(String)
    );
    expect(sendMessageSpy).toHaveBeenCalledTimes(2);
  });
});

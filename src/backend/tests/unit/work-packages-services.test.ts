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

// NOTE: "today's" date is 01/01/1970. This is due to the usage UTC, which starts at the mentioned date.
describe('Work Package Deadline Notifications', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;
  let wp: WorkPackage;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);

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
        status: WBS_Element_Status.INACTIVE,
        name: 'TEST NAME'
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

    vi.restoreAllMocks();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await resetUsers();
  });

  describe('send messages', () => {
    it('does not send a message for an inactive work package as its start date is two days later', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: wp.workPackageId
        },
        data: {
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();
      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still inactive. The start date, 1/2/1970, is tomorrow.'
        ),
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still inactive. The start date, 1/1/1970, is today.'
        ),
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still inactive. The start date, 12/31/1969, was yesterday.'
        ),
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still not complete. The end date, 1/2/1970, is tomorrow.'
        ),
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();
      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still not complete. The end date, 1/1/1970, is today.'
        ),
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still not complete. The end date, 12/31/1969, was yesterday.'
        ),
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('The work package, 2.1.1, is still not complete'),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
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
      await WorkPackagesService.sendWorkPackageDeadlineNotifications();
      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still inactive. The start date, 1/1/1970, is today.'
        ),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          'The work package, TEST NAME (WBS Element: 2.1.1), is still not complete. The end date, 1/1/1970, is today.'
        ),
        expect.any(String),
        expect.any(String)
      );
      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
    });
  });
});

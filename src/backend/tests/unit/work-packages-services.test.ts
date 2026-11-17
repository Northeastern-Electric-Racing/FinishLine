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
import { afterEach, beforeEach, describe } from 'node:test';
import WorkPackagesService from '../../src/services/work-packages.services';
import { WorkPackage } from '../../src/prisma/context';
import { sendMessage } from '../../src/integrations/slack';

describe('Change Request Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;
  let wpWbsElementId: string;
  let workPackageId: string;
  let startDate: Date;
  let duration: number;
  let workPackage: WorkPackage;

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
    const wp = await createTestWorkPackage(user, orgId, project.projectId, 2, 1, 1);

    workPackage = await createTestWorkPackage(user, orgId, project.projectId, 2, 1, 1);

    wpWbsElementId = wp.wbsElement.wbsElementId;
    ({ workPackageId, startDate, duration } = wp);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('send messages', () => {
    it('sends a message that a work package inactive and its start date is tomorrow', async () => {
      await prisma.work_Package.update({
        where: {
          workPackageId: workPackage.workPackageId
        },
        data: {
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          duration: 10
        }
      });

      const sendMessageSpy = vi.spyOn(slackModule, 'sendMessage').mockResolvedValue({ ok: true });

      await WorkPackagesService.sendWorkPackageDeadlineNotifications();

      expect(sendMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(' is still inactive ')
        }),
        expect.objectContaining({
          text: expect.stringContaining(' The start date ')
        }),
        expect.objectContaining({
          text: expect.stringContaining('is tomorrow')
        })
      );
    });
  });
});

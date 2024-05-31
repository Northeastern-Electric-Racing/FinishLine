import WorkPackageService from '../../src/services/work-packages.services';
import {
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException
} from '../../src/utils/errors.utils';
import { createTestOrganization, createTestUser, createTestWorkPackageTemplate, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data';
import { workPackageTemplateTransformer } from '../../src/transformers/work-package-template.transformer';
import prisma from '../../src/prisma/prisma';

describe('Work Package Template Tests', () => {
  let orgId: string;
  beforeEach(async () => {
    await resetUsers();
    orgId = (await createTestOrganization()).organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get single work package template', () => {
    it('fails if user is a guest', async () => {
      await expect(
        async () =>
          await WorkPackageService.getSingleWorkPackageTemplate(await createTestUser(theVisitorGuest, orgId), 'id', orgId)
      ).rejects.toThrow(new AccessDeniedGuestException('get a work package template'));
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(
        async () =>
          await WorkPackageService.getSingleWorkPackageTemplate(await createTestUser(batmanAppAdmin, orgId), 'id1', orgId)
      ).rejects.toThrow(new HttpException(400, `Work package template with id id1 not found`));
    });

    it('get single work package template succeeds', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const createdWorkPackageTemplate = await createTestWorkPackageTemplate(testBatman, orgId);

      const recievedWorkPackageTemplate = await WorkPackageService.getSingleWorkPackageTemplate(
        await createTestUser(supermanAdmin, orgId),
        createdWorkPackageTemplate.workPackageTemplateId,
        orgId
      );

      expect(recievedWorkPackageTemplate).toStrictEqual(workPackageTemplateTransformer(createdWorkPackageTemplate));
    });
  });

  describe('Delete single work package template', () => {
    it('fails if user is a guest', async () => {
      await expect(
        async () =>
          await WorkPackageService.deleteWorkPackageTemplate(await createTestUser(theVisitorGuest, orgId), 'id', orgId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete work package template'));
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(
        async () =>
          await WorkPackageService.deleteWorkPackageTemplate(await createTestUser(supermanAdmin, orgId), 'id1', orgId)
      ).rejects.toThrow(new HttpException(400, `Work Package Template with id: id1 not found!`));
    });

    it('fails is the work package template has already been deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testWorkPackageTemplate = await createTestWorkPackageTemplate(testSuperman, orgId);
      await WorkPackageService.deleteWorkPackageTemplate(testSuperman, testWorkPackageTemplate.workPackageTemplateId, orgId);

      await expect(
        async () =>
          await WorkPackageService.deleteWorkPackageTemplate(
            testSuperman,
            testWorkPackageTemplate.workPackageTemplateId,
            orgId
          )
      ).rejects.toThrow(new DeletedException('Work Package Template', testWorkPackageTemplate.workPackageTemplateId));
    });

    it('succeeds and deletes all blocking templates', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testWorkPackageTemplate1 = await createTestWorkPackageTemplate(testSuperman, orgId);
      const testWorkPackageTemplate2 = await createTestWorkPackageTemplate(testSuperman, orgId);
      const testWorkPackageTemplate3 = await createTestWorkPackageTemplate(testSuperman, orgId);

      await prisma.work_Package_Template.update({
        where: {
          workPackageTemplateId: testWorkPackageTemplate3.workPackageTemplateId
        },
        data: {
          blockedBy: {
            connect: {
              workPackageTemplateId: testWorkPackageTemplate2.workPackageTemplateId
            }
          }
        }
      });

      await prisma.work_Package_Template.update({
        where: {
          workPackageTemplateId: testWorkPackageTemplate2.workPackageTemplateId
        },
        data: {
          blockedBy: {
            connect: {
              workPackageTemplateId: testWorkPackageTemplate1.workPackageTemplateId
            }
          }
        }
      });

      await WorkPackageService.deleteWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate1.workPackageTemplateId,
        orgId
      );

      const updatedTestWorkPackageTemplate1 = await prisma.work_Package_Template.findFirst({
        where: {
          workPackageTemplateId: testWorkPackageTemplate1.workPackageTemplateId
        },
        include: {
          blocking: true
        }
      });

      const updatedTestWorkPackageTemplate2 = await prisma.work_Package_Template.findFirst({
        where: {
          workPackageTemplateId: testWorkPackageTemplate2.workPackageTemplateId
        },
        include: {
          blocking: true
        }
      });

      const updatedTestWorkPackageTemplate3 = await prisma.work_Package_Template.findFirst({
        where: {
          workPackageTemplateId: testWorkPackageTemplate3.workPackageTemplateId
        },
        include: {
          blocking: true,
        }
      });
      console.log(updatedTestWorkPackageTemplate1);
      console.log(updatedTestWorkPackageTemplate2);
      console.log(updatedTestWorkPackageTemplate3);
      expect(updatedTestWorkPackageTemplate1?.dateDeleted).not.toBe(null);
      expect(updatedTestWorkPackageTemplate2?.dateDeleted).not.toBe(null);
      expect(updatedTestWorkPackageTemplate3?.dateDeleted).not.toBe(null);
    });
  });
});

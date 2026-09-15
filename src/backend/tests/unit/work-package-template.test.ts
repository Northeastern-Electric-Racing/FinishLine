import {
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils.js';
import { createTestOrganization, createTestUser, createTestWorkPackageTemplate, resetUsers } from '../test-utils.js';
import { batmanAppAdmin, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { workPackageTemplateTransformer } from '../../src/transformers/work-package-template.transformer.js';
import prisma from '../../src/prisma/prisma.js';
import WorkPackageTemplatesService from '../../src/services/wbs-element-templates.services.js';
import { Organization } from '@prisma/client';

describe('Work Package Template Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get single work package template', () => {
    it('fails if user is a guest', async () => {
      await expect(
        async () =>
          await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
            await createTestUser(theVisitorGuest, orgId),
            'id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedGuestException('get a work package template'));
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(
        async () =>
          await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
            await createTestUser(batmanAppAdmin, orgId),
            'id1',
            organization
          )
      ).rejects.toThrow(new HttpException(400, `Work package template with id id1 not found`));
    });

    it('get single work package template succeeds', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const createdWorkPackageTemplate = await createTestWorkPackageTemplate(testBatman, orgId);

      const recievedWorkPackageTemplate = await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
        await createTestUser(supermanAdmin, orgId),
        createdWorkPackageTemplate.wbsElementTemplateId,
        organization
      );

      expect(recievedWorkPackageTemplate).toStrictEqual(workPackageTemplateTransformer(createdWorkPackageTemplate));
    });
  });

  describe('Delete single work package template', () => {
    it('fails if user is a guest', async () => {
      await expect(
        async () =>
          await WorkPackageTemplatesService.deleteWorkPackageTemplate(
            await createTestUser(theVisitorGuest, orgId),
            'id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete work package template'));
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(
        async () =>
          await WorkPackageTemplatesService.deleteWorkPackageTemplate(
            await createTestUser(supermanAdmin, orgId),
            'id1',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Work Package Template', 'id1'));
    });

    it('fails is the work package template has already been deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testWorkPackageTemplate = await createTestWorkPackageTemplate(testSuperman, orgId);
      await WorkPackageTemplatesService.deleteWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate.wbsElementTemplateId,
        organization
      );

      await expect(
        async () =>
          await WorkPackageTemplatesService.deleteWorkPackageTemplate(
            testSuperman,
            testWorkPackageTemplate.wbsElementTemplateId,
            organization
          )
      ).rejects.toThrow(new DeletedException('Work Package Template', testWorkPackageTemplate.wbsElementTemplateId));
    });

    it('succeeds and deletes all blocking templates', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const [testWorkPackageTemplate1, testWorkPackageTemplate2, testWorkPackageTemplate3] = await Promise.all([
        createTestWorkPackageTemplate(testSuperman, orgId),
        createTestWorkPackageTemplate(testSuperman, orgId),
        createTestWorkPackageTemplate(testSuperman, orgId)
      ]);

      await prisma.work_Package_Template.update({
        where: {
          wbsElementTemplateId: testWorkPackageTemplate3.wbsElementTemplateId
        },
        data: {
          blockedBy: {
            connect: {
              wbsElementTemplateId: testWorkPackageTemplate2.wbsElementTemplateId
            }
          }
        }
      });

      await prisma.work_Package_Template.update({
        where: {
          wbsElementTemplateId: testWorkPackageTemplate2.wbsElementTemplateId
        },
        data: {
          blockedBy: {
            connect: {
              wbsElementTemplateId: testWorkPackageTemplate1.wbsElementTemplateId
            }
          }
        }
      });

      await WorkPackageTemplatesService.deleteWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate1.wbsElementTemplateId,
        organization
      );

      const updatedTestWorkPackageTemplate1 = await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate1.wbsElementTemplateId,
        organization
      );

      const updatedTestWorkPackageTemplate2 = await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate2.wbsElementTemplateId,
        organization
      );
      const updatedTestWorkPackageTemplate3 = await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate3.wbsElementTemplateId,
        organization
      );

      expect(updatedTestWorkPackageTemplate1.dateDeleted).not.toBe(null);
      expect(updatedTestWorkPackageTemplate2.dateDeleted).not.toBe(null);
      expect(updatedTestWorkPackageTemplate3.dateDeleted).not.toBe(null);
    });
  });
});

import {
  AccessDeniedGuestException,
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import {
  createTestOrganization,
  createTestProjectTemplate,
  createTestUser,
  createTestWorkPackageTemplate,
  resetUsers
} from '../test-utils';
import { batmanAppAdmin, supermanAdmin, theVisitorGuest, greenlanternHead } from '../test-data/users.test-data';
import {
  projectTemplateTransformer,
  workPackageTemplateTransformer
} from '../../src/transformers/work-package-template.transformer';
import prisma from '../../src/prisma/prisma';
import WbsElementTemplatesService from '../../src/services/wbs-element-templates.services';
import { Organization } from '@prisma/client';
import {
  getProjectTemplateQueryArgs,
  getWorkPackageTemplateQueryArgs
} from '../../src/prisma-query-args/wbs-element-template.query-args';

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
          await WbsElementTemplatesService.getSingleWorkPackageTemplate(
            await createTestUser(theVisitorGuest, orgId),
            'id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedGuestException('get a work package template'));
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.getSingleWorkPackageTemplate(
            await createTestUser(batmanAppAdmin, orgId),
            'id1',
            organization
          )
      ).rejects.toThrow(new HttpException(400, `Work package template with id id1 not found`));
    });

    it('get single work package template succeeds', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const createdWorkPackageTemplate = await createTestWorkPackageTemplate(testBatman, orgId);

      const recievedWorkPackageTemplate = await WbsElementTemplatesService.getSingleWorkPackageTemplate(
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
          await WbsElementTemplatesService.deleteWorkPackageTemplate(
            await createTestUser(theVisitorGuest, orgId),
            'id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete work package template'));
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.deleteWorkPackageTemplate(
            await createTestUser(supermanAdmin, orgId),
            'id1',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Work Package Template', 'id1'));
    });

    it('fails is the work package template has already been deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testWorkPackageTemplate = await createTestWorkPackageTemplate(testSuperman, orgId);
      await WbsElementTemplatesService.deleteWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate.wbsElementTemplateId,
        organization
      );

      await expect(
        async () =>
          await WbsElementTemplatesService.deleteWorkPackageTemplate(
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

      await WbsElementTemplatesService.deleteWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate1.wbsElementTemplateId,
        organization
      );

      const updatedTestWorkPackageTemplate1 = await WbsElementTemplatesService.getSingleWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate1.wbsElementTemplateId,
        organization
      );

      const updatedTestWorkPackageTemplate2 = await WbsElementTemplatesService.getSingleWorkPackageTemplate(
        testSuperman,
        testWorkPackageTemplate2.wbsElementTemplateId,
        organization
      );
      const updatedTestWorkPackageTemplate3 = await WbsElementTemplatesService.getSingleWorkPackageTemplate(
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

describe('Project Template Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get all project templates', () => {
    it('fails if user is a guest', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.getAllProjectTemplates(await createTestUser(theVisitorGuest, orgId), organization)
      ).rejects.toThrow(new AccessDeniedGuestException('get project templates'));
    });

    it('succeeds if user is an admin', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testProjectTemplate1 = await createTestProjectTemplate(testSuperman, orgId);
      const testProjectTemplate2 = await createTestProjectTemplate(testBatman, orgId);

      const recievedProjectTemplates = await WbsElementTemplatesService.getAllProjectTemplates(testSuperman, organization);
      expect(recievedProjectTemplates).toStrictEqual(
        [testProjectTemplate1, testProjectTemplate2].map(projectTemplateTransformer)
      );
    });
  });

  describe('Delete project template', () => {
    it('fails if user is not an admin', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.deleteProjectTemplate(
            await createTestUser(theVisitorGuest, orgId),
            'id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete project template'));
    });

    it('fails is the project template ID is not found', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.deleteProjectTemplate(
            await createTestUser(supermanAdmin, orgId),
            'id1',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Project Template', 'id1'));
    });

    it('fails is the project template has already been deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testProjectTemplate = await createTestProjectTemplate(testSuperman, orgId);
      await WbsElementTemplatesService.deleteProjectTemplate(
        testSuperman,
        testProjectTemplate.wbsElementTemplateId,
        organization
      );

      await expect(
        async () =>
          await WbsElementTemplatesService.deleteProjectTemplate(
            testSuperman,
            testProjectTemplate.wbsElementTemplateId,
            organization
          )
      ).rejects.toThrow(new DeletedException('Project Template', testProjectTemplate.wbsElementTemplateId));
    });

    it('succeeds and deletes all work package templates', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testProjectTemplate = await createTestProjectTemplate(testSuperman, orgId);

      await prisma.work_Package_Template.create({
        data: {
          wbsElementTemplate: {
            create: {
              templateName: 'wp name',
              templateNotes: 'wp notes',
              organization: {
                connect: {
                  organizationId: orgId
                }
              },
              userCreated: { connect: { userId: testSuperman.userId } }
            }
          },
          projectTemplate: { connect: { wbsElementTemplateId: testProjectTemplate.wbsElementTemplateId } }
        }
      });

      await prisma.work_Package_Template.create({
        data: {
          wbsElementTemplate: {
            create: {
              templateName: 'wp name',
              templateNotes: 'wp notes',
              organization: {
                connect: {
                  organizationId: orgId
                }
              },
              userCreated: { connect: { userId: testSuperman.userId } }
            }
          },
          projectTemplate: { connect: { wbsElementTemplateId: testProjectTemplate.wbsElementTemplateId } }
        }
      });

      await WbsElementTemplatesService.deleteProjectTemplate(
        testSuperman,
        testProjectTemplate.wbsElementTemplateId,
        organization
      );

      const updatedTestProjectTemplate = await prisma.project_Template.findUnique({
        where: {
          wbsElementTemplateId: testProjectTemplate.wbsElementTemplateId
        },
        ...getProjectTemplateQueryArgs(orgId)
      });

      expect(updatedTestProjectTemplate!.wbsElementTemplate.dateDeleted).not.toBe(null);

      const updatedWorkPackageTemplates = await prisma.work_Package_Template.findMany({
        where: {
          projectTemplateId: testProjectTemplate.wbsElementTemplateId
        },
        ...getWorkPackageTemplateQueryArgs(orgId)
      });

      updatedWorkPackageTemplates.forEach((workPackageTemplate) => {
        expect(workPackageTemplate.wbsElementTemplate.dateDeleted).not.toBe(null);
      });
    });
  });

  describe('Get single project template', () => {
    it('fails if user is a guest', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.getSingleProjectTemplate(
            await createTestUser(theVisitorGuest, orgId),
            'id',
            organization
          )
      ).rejects.toThrow(new AccessDeniedGuestException('get a project template'));
    });

    it('fails is the project template ID is not found', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.getSingleProjectTemplate(
            await createTestUser(batmanAppAdmin, orgId),
            'id1',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Project Template', 'id1'));
    });

    it('succeeds', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const createdProjectTemplate = await createTestProjectTemplate(testBatman, orgId);

      const recievedProjectTemplate = await WbsElementTemplatesService.getSingleProjectTemplate(
        await createTestUser(supermanAdmin, orgId),
        createdProjectTemplate.wbsElementTemplateId,
        organization
      );

      expect(recievedProjectTemplate).toStrictEqual(projectTemplateTransformer(createdProjectTemplate));
    });
  });

  describe('Edit project template', () => {
    it('fails if user is not an admin', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.editProjectTemplate(
            await createTestUser(greenlanternHead, orgId),
            'id',
            'template name',
            'template notes',
            [],
            [],
            organization,
            []
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a project template'));
    });
    it('fails if the project template ID is not found', async () => {
      await expect(
        async () =>
          await WbsElementTemplatesService.editProjectTemplate(
            await createTestUser(supermanAdmin, orgId),
            'id1',
            'template name',
            'template notes',
            [],
            [],
            organization,
            [],
            'project name'
          )
      ).rejects.toThrow(new NotFoundException('Project Template', 'id1'));
    });

    it('succeeds', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testProjectTemplate = await createTestProjectTemplate(testSuperman, orgId);
      const testWorkPackageTemplate = await createTestWorkPackageTemplate(testSuperman, orgId);

      let updatedProjectTemplate = await WbsElementTemplatesService.editProjectTemplate(
        testSuperman,
        testProjectTemplate.wbsElementTemplateId,
        'new template name',
        'new template notes',
        [
          {
            ...testWorkPackageTemplate,
            templateName: testWorkPackageTemplate.wbsElementTemplate.templateName,
            templateNotes: testWorkPackageTemplate.wbsElementTemplate.templateNotes,
            descriptionBullets: [],
            duration: testWorkPackageTemplate.duration ?? undefined,
            stage: undefined,
            blockedBy: testWorkPackageTemplate.blockedBy.map((bb) => bb.wbsElementTemplateId)
          }
        ],
        [],
        organization,
        [],
        'project name'
      );

      expect(updatedProjectTemplate.templateName).toBe('new template name');
      expect(updatedProjectTemplate.templateNotes).toBe('new template notes');
      expect(updatedProjectTemplate.workPackageTemplates).toHaveLength(1);
      expect(updatedProjectTemplate.workPackageTemplates[0]).toStrictEqual(
        workPackageTemplateTransformer(testWorkPackageTemplate)
      );

      updatedProjectTemplate = await WbsElementTemplatesService.editProjectTemplate(
        testSuperman,
        testProjectTemplate.wbsElementTemplateId,
        'new new template name',
        'new new template notes',
        [
          {
            ...testWorkPackageTemplate,
            workPackageTemplateId: testWorkPackageTemplate.wbsElementTemplateId,
            templateName: 'changed name',
            templateNotes: testWorkPackageTemplate.wbsElementTemplate.templateNotes,
            descriptionBullets: [],
            duration: testWorkPackageTemplate.duration ?? undefined,
            stage: undefined,
            blockedBy: testWorkPackageTemplate.blockedBy.map((bb) => bb.wbsElementTemplateId)
          }
        ],
        [],
        organization,
        []
      );

      testWorkPackageTemplate.wbsElementTemplate.templateName = 'changed name';

      expect(updatedProjectTemplate.templateName).toBe('new new template name');
      expect(updatedProjectTemplate.templateNotes).toBe('new new template notes');
      expect(updatedProjectTemplate.workPackageTemplates).toHaveLength(1);
      expect(updatedProjectTemplate.workPackageTemplates[0]).toStrictEqual(
        workPackageTemplateTransformer(testWorkPackageTemplate)
      );

      updatedProjectTemplate = await WbsElementTemplatesService.editProjectTemplate(
        testSuperman,
        testProjectTemplate.wbsElementTemplateId,
        'new new new template name',
        'new new new template notes',
        [],
        [],
        organization,
        []
      );

      expect(updatedProjectTemplate.templateName).toBe('new new new template name');
      expect(updatedProjectTemplate.templateNotes).toBe('new new new template notes');
      expect(updatedProjectTemplate.workPackageTemplates).toHaveLength(0);
    });
  });
});

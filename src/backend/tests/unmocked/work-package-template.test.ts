import prisma from '../../src/prisma/prisma';
import WorkPackageService from '../../src/services/work-packages.services';
import { AccessDeniedGuestException, HttpException } from '../../src/utils/errors.utils';
import { createTestUser } from '../create-test-user';
import { batman, theVisitor, thomasEmrax } from '../test-data/users.test-data';
import { WorkPackageTemplate1 } from '../test-data/work-packages.test-data';

describe('Work Package Template Tests', () => {
  beforeEach(async () => {
    await prisma.material.deleteMany();
    await prisma.manufacturer.deleteMany();
    await prisma.material_Type.deleteMany();
    await prisma.assembly.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user_Secure_Settings.deleteMany();
    await prisma.reimbursement_Product.deleteMany();
    await prisma.reimbursement_Status.deleteMany();
    await prisma.reimbursement_Request.deleteMany();
    await prisma.task.deleteMany();
    await prisma.stage_Gate_CR.deleteMany();
    await prisma.activation_CR.deleteMany();
    await prisma.change.deleteMany();
    await prisma.proposed_Solution.deleteMany();
    await prisma.scope_CR_Why.deleteMany();
    await prisma.scope_CR.deleteMany();
    await prisma.change_Request.deleteMany();
    await prisma.link.deleteMany();
    await prisma.linkType.deleteMany();
    await prisma.work_Package_Template.deleteMany();
    await prisma.user_Settings.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Get single work package template', () => {
    it('fails if user is a guest', async () => {
      await expect(async () => await WorkPackageService.getSingleWorkPackageTemplate(theVisitor, 'id')).rejects.toThrow(
        new AccessDeniedGuestException('get a work package template')
      );
    });

    it('fails is the work package template ID is not found', async () => {
      await expect(async () => await WorkPackageService.getSingleWorkPackageTemplate(batman, 'id1')).rejects.toThrow(
        new HttpException(400, `Work package template with id id1 not found`)
      );
    });

    it('get single work package template succeeds', async () => {
      const createdUser = await createTestUser(thomasEmrax);
      console.log(createdUser.userId);
      await prisma.work_Package_Template.create({
        data: {
          workPackageTemplateId: 'id1',
          workPackageName: 'Work Package 1',
          templateName: 'Template 1',
          templateNotes: 'This is a new work package template',
          dateCreated: new Date('03/25/2024'),
          userCreatedId: createdUser.userId
        }
      });

      const recievedWorkPackageTemplate = await WorkPackageService.getSingleWorkPackageTemplate(thomasEmrax, 'id1');
      expect(recievedWorkPackageTemplate).toStrictEqual({ ...WorkPackageTemplate1, userCreatedId: createdUser.userId });
    });
  });
});

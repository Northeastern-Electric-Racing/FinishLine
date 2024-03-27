import prisma from '../../src/prisma/prisma';
import WorkPackageService from '../../src/services/work-packages.services';
import { AccessDeniedGuestException, HttpException } from '../../src/utils/errors.utils';
import { createTestUser, resetUsers } from '../test-utils';
import { batman, theVisitor } from '../test-data/users.test-data';
import { WorkPackageTemplate1 } from '../test-data/work-packages.test-data';

describe('Work Package Template Tests', () => {
  beforeEach(async () => {
    await resetUsers();
  });

  afterEach(async () => {
    await resetUsers();
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
      const createdUser = await createTestUser(batman);
      console.log(createdUser)
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

      const recievedWorkPackageTemplate = await WorkPackageService.getSingleWorkPackageTemplate(batman, 'id1');
      expect(recievedWorkPackageTemplate).toStrictEqual({
        ...WorkPackageTemplate1,
        userCreated: { ...batman, userId: createdUser.userId },
        userCreatedId: createdUser.userId
      });
    });
  });
});

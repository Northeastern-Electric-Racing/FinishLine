import WorkPackageService from '../../src/services/work-packages.services';
import { AccessDeniedGuestException, HttpException } from '../../src/utils/errors.utils';
import { createTestOrganization, createTestUser, createTestWorkPackageTemplate, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data';
import { workPackageTemplateTransformer } from '../../src/transformers/work-package-template.transformer';

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
      const createdWorkPackageTemplate = await createTestWorkPackageTemplate(orgId);

      const recievedWorkPackageTemplate = await WorkPackageService.getSingleWorkPackageTemplate(
        await createTestUser(supermanAdmin, orgId),
        createdWorkPackageTemplate.workPackageTemplateId,
        orgId
      );

      expect(recievedWorkPackageTemplate).toStrictEqual(workPackageTemplateTransformer(createdWorkPackageTemplate));
    });
  });
});

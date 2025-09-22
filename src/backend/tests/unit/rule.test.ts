// tests go below here
import { Organization } from '@prisma/client';
import RulesService from '../../src/services/rules.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';

describe('Rule Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Ruleset Type', () => {
    it('Fails if user not an admin', async () => {
      await expect(
        async () => await RulesService.deleteRulesetType(await createTestUser(wonderwomanGuest, orgId), 'FSAE', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('only admin are allowed to delete ruleset types'));
    });

    /*it('Succeeds and creates a ruleset type', async () => {
      const result = await RulesService.createRulesetType(await createTestUser(batmanAppAdmin, orgId), 'FSAE', organization);

      expect(result.name).toEqual('FSAE');

    });
    */
  });
});

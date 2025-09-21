import { Organization } from '@prisma/client';
import RulesService from '../../src/services/rules.services';
import { AccessDeniedException } from '../../src/utils/errors.utils';
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
    it('Fails if user is not leadership or above', async () => {
      await expect(
        async () => await RulesService.createRulesetType(await createTestUser(wonderwomanGuest, orgId), 'FSAE', organization)
      ).rejects.toThrow(new AccessDeniedException('only leadership and above can create ruleset types!'));
    });

    it('Succeeds and creates a ruleset type', async () => {
      const result = await RulesService.createRulesetType(await createTestUser(batmanAppAdmin, orgId), 'FSAE', organization);

      expect(result.name).toEqual('FSAE');
    });
  });
});

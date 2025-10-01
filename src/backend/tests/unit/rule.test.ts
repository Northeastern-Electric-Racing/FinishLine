// tests go below here
import prisma from '../../src/prisma/prisma';
import { Organization } from '@prisma/client';
import RulesService from '../../src/services/rules.services';
import { AccessDeniedAdminOnlyException, DeletedException } from '../../src/utils/errors.utils';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { vi } from 'vitest';

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

  describe('Delete Ruleset Type', () => {
    it('Fails if user not an admin', async () => {
      await expect(
        async () => await RulesService.deleteRulesetType(await createTestUser(wonderwomanGuest, orgId), 'FSAE', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('only admin are allowed to delete ruleset types'));
    });

    it('Fails if the ruleset type has already been deleted', async () => {
      vi.spyOn(prisma.ruleset_Type, 'findUnique').mockResolvedValue({
        name: 'FSAE',
        rulesetTypeId: '1',
        lastUpdated: new Date(),
        createdByUserId: 'kk',
        deletedByUserId: 'berthaaa'
      });

      await expect(
        RulesService.deleteRulesetType(await createTestUser(batmanAppAdmin, orgId), '1', organization)
      ).rejects.toThrow(new DeletedException('Ruleset Type', '1'));
    });

    it('Successfully deletes the ruleset type', async () => {
      vi.spyOn(prisma.ruleset_Type, 'findUnique').mockResolvedValue({
        name: 'FSAE',
        rulesetTypeId: '234',
        lastUpdated: new Date(),
        createdByUserId: 'bertha',
        deletedByUserId: null
      });
      vi.spyOn(prisma.ruleset_Type, 'update').mockResolvedValue({
        name: 'Test Ruleset',
        rulesetTypeId: '234',
        lastUpdated: new Date(),
        createdByUserId: 'user1',
        deletedByUserId: 'bertha' // Now deleted
      });

      const result = await RulesService.deleteRulesetType(await createTestUser(batmanAppAdmin, orgId), '123', organization);

      expect(result).toEqual({ message: 'Ruleset Type Deleted' });
    });
  });
});

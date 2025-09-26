import { Car, Organization, Rule, Ruleset, Ruleset_Type, User } from '@prisma/client';
import { createTestCar, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import RulesService from '../../src/services/rules.services';
import { supermanAdmin, wonderwomanGuest, batmanAppAdmin } from '../test-data/users.test-data';
import { AccessDeniedException, DeletedException, NotFoundException } from '../../src/utils/errors.utils';

describe('Rules Tests', () => {
  let deletedRule: Rule;
  let rule: Rule;
  let user: User;
  let organization: Organization;
  let orgId: string;
  let car: Car;
  let rulesetType: Ruleset_Type;
  let ruleset: Ruleset;

  beforeEach(async () => {
    await resetUsers();

    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    rulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE',
        createdByUserId: user.userId
      }
    });
    car = await createTestCar(orgId, user.userId);
    ruleset = await prisma.ruleset.create({
      data: {
        name: 'ruleset name',
        fileId: 'fileId',
        active: true,
        dateCreated: new Date(),
        rulesetTypeId: rulesetType.rulesetTypeId,
        createdByUserId: user.userId,
        carId: car.carId
      }
    });
    rule = await prisma.rule.create({
      data: {
        ruleCode: 'rule code',
        ruleContent: 'rule contenet',
        imageFileIds: [],
        ruleset: { connect: { rulesetId: ruleset.rulesetId } },
        createdBy: { connect: { userId: user.userId } }
      }
    });
  });

  describe('Delete rule', () => {
    it('Successful deletion', async () => {
      deletedRule = await RulesService.deleteRule(rule.ruleId, user, organization);
      expect(deletedRule.dateDeleted).toBeTruthy();
      expect(deletedRule).toMatchObject({
        ...rule,
        dateUpdated: deletedRule.dateUpdated,
        dateDeleted: deletedRule.dateDeleted,
        deletedByUserId: user.userId
      });
    });
    it('Fails when non admin tries to delete', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      await expect(RulesService.deleteRule(rule.ruleId, guest, organization)).rejects.toThrow(
        new AccessDeniedException('Only admins can delete rules.')
      );
    });
    it('Fails when rule has already been deleted', async () => {
      await RulesService.deleteRule(rule.ruleId, user, organization);

      await expect(RulesService.deleteRule(rule.ruleId, user, organization)).rejects.toThrow(
        new DeletedException('Rule', rule.ruleId)
      );
    });
    it('Fails with invalid ruleId', async () => {
      await expect(RulesService.deleteRule('bad id', user, organization)).rejects.toThrow(
        new NotFoundException('Rule', 'bad id')
      );
    });
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
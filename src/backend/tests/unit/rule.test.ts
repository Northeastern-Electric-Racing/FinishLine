import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin, aquamanLeadership, wonderwomanGuest } from '../test-data/users.test-data';
import RulesService from '../../src/services/rules.services';
import prisma from '../../src/prisma/prisma';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../../src/utils/errors.utils';

describe('Rules Tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let aquaman: User;
  let wonderwoman: User;
  let rulesetId: string;
  let carId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
    aquaman = await createTestUser(aquamanLeadership, orgId);
    wonderwoman = await createTestUser(wonderwomanGuest, orgId);

    const car = await prisma.car.create({
      data: {
        wbsElement: {
          create: {
            name: 'Test Car',
            carNumber: 0,
            projectNumber: 0,
            workPackageNumber: 0,
            organizationId: orgId
          }
        }
      }
    });
    carId = car.carId;

    const rulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE Rules',
        createdBy: { connect: { userId: batman.userId } }
      }
    });

    const ruleset = await prisma.ruleset.create({
      data: {
        fileId: 'test-file-id',
        name: '2025 FSAE Rules',
        active: true,
        rulesetType: { connect: { rulesetTypeId: rulesetType.rulesetTypeId } },
        car: { connect: { carId } },
        createdBy: { connect: { userId: batman.userId } }
      }
    });
    rulesetId = ruleset.rulesetId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Rule', () => {
    it('successfully creates a basic rule', async () => {
      const rule = await RulesService.createRule(
        batman,
        'T.1.1.1',
        'The vehicle must have four wheels',
        rulesetId,
        organization
      );

      expect(rule.ruleCode).toBe('T.1.1.1');
      expect(rule.ruleContent).toBe('The vehicle must have four wheels');
      expect(rule.ruleset.rulesetId).toBe(rulesetId);
      expect(rule.parentRule).toBeUndefined();
      expect(rule.subRuleIds).toHaveLength(0);
      expect(rule.referencedRules).toHaveLength(0);
      expect(rule.imageFileIds).toHaveLength(0);
    });

    it('successfully creates a rule with a parent', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1.1', 'Vehicle Requirements', rulesetId, organization);

      const childRule = await RulesService.createRule(
        superman,
        'T.1.1.1',
        'The vehicle must have four wheels',
        rulesetId,
        organization,
        parentRule.ruleId
      );

      expect(childRule.parentRule?.ruleId).toBe(parentRule.ruleId);
      expect(childRule.ruleCode).toBe('T.1.1.1');
    });

    it('successfully creates a rule with referenced rules', async () => {
      const rule1 = await RulesService.createRule(batman, 'T.1.1', 'Vehicle must have wheels', rulesetId, organization);

      const rule2 = await RulesService.createRule(batman, 'T.1.2', 'Vehicle must have brakes', rulesetId, organization);

      const rule3 = await RulesService.createRule(
        superman,
        'T.2.1',
        'Braking system must work with wheels (see T.1.1 and T.1.2)',
        rulesetId,
        organization,
        undefined,
        [rule1.ruleId, rule2.ruleId]
      );

      expect(rule3.referencedRules).toHaveLength(2);
      expect(rule3.referencedRules.map((r) => r.ruleId)).toContain(rule1.ruleId);
      expect(rule3.referencedRules.map((r) => r.ruleId)).toContain(rule2.ruleId);
    });

    it('successfully creates a rule with image file IDs', async () => {
      const rule = await RulesService.createRule(
        batman,
        'T.3.1',
        'Chassis must meet specifications',
        rulesetId,
        organization,
        undefined,
        [],
        ['file-id-1', 'file-id-2']
      );

      expect(rule.imageFileIds).toHaveLength(2);
      expect(rule.imageFileIds).toContain('file-id-1');
      expect(rule.imageFileIds).toContain('file-id-2');
    });

    it('fails when guest tries to create a rule', async () => {
      await expect(RulesService.createRule(wonderwoman, 'T.1.1', 'Some rule', rulesetId, organization)).rejects.toThrow(
        new AccessDeniedException('Only members and above can create rules')
      );
    });

    it('fails when ruleset does not exist', async () => {
      await expect(RulesService.createRule(batman, 'T.1.1', 'Some rule', 'fake-ruleset-id', organization)).rejects.toThrow(
        new NotFoundException('Ruleset', 'fake-ruleset-id')
      );
    });

    it('fails when ruleset is deleted', async () => {
      await prisma.ruleset.update({
        where: { rulesetId },
        data: { deletedBy: { connect: { userId: batman.userId } } }
      });

      await expect(RulesService.createRule(batman, 'T.1.1', 'Some rule', rulesetId, organization)).rejects.toThrow(
        new DeletedException('Ruleset', rulesetId)
      );
    });

    it('fails when duplicate rule code in same ruleset', async () => {
      await RulesService.createRule(batman, 'T.1.1', 'First rule', rulesetId, organization);

      await expect(RulesService.createRule(superman, 'T.1.1', 'Duplicate code', rulesetId, organization)).rejects.toThrow(
        new HttpException(400, 'Rule with code T.1.1 already exists in this ruleset')
      );
    });

    it('fails when parent rule does not exist', async () => {
      await expect(
        RulesService.createRule(batman, 'T.1.1', 'Some rule', rulesetId, organization, 'fake-parent-id')
      ).rejects.toThrow(new NotFoundException('Parent Rule', 'fake-parent-id'));
    });

    it('fails when parent rule is deleted', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent', rulesetId, organization);

      await prisma.rule.update({
        where: { ruleId: parentRule.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: batman.userId } } }
      });

      await expect(
        RulesService.createRule(superman, 'T.1.1', 'Child', rulesetId, organization, parentRule.ruleId)
      ).rejects.toThrow(new DeletedException('Parent Rule', parentRule.ruleId));
    });

    it('fails when parent rule is in different ruleset', async () => {
      const otherRuleset = await prisma.ruleset.create({
        data: {
          fileId: 'other-file',
          name: 'Other Rules',
          active: true,
          rulesetTypeId: (await prisma.ruleset_Type.findFirst())!.rulesetTypeId,
          carId,
          createdByUserId: batman.userId
        }
      });

      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent', otherRuleset.rulesetId, organization);

      await expect(
        RulesService.createRule(superman, 'T.1.1', 'Child', rulesetId, organization, parentRule.ruleId)
      ).rejects.toThrow(new HttpException(400, 'Parent rule must be in the same ruleset'));
    });

    it('fails when referenced rule does not exist', async () => {
      await expect(
        RulesService.createRule(batman, 'T.1.1', 'Some rule', rulesetId, organization, undefined, ['fake-rule-id'])
      ).rejects.toThrow(new NotFoundException('Referenced Rule', 'provided IDs'));
    });

    it('fails when referenced rule is deleted', async () => {
      const rule1 = await RulesService.createRule(batman, 'T.1.1', 'Rule 1', rulesetId, organization);

      await prisma.rule.update({
        where: { ruleId: rule1.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: batman.userId } } }
      });

      await expect(
        RulesService.createRule(superman, 'T.1.2', 'Rule 2', rulesetId, organization, undefined, [rule1.ruleId])
      ).rejects.toThrow(new DeletedException('Referenced Rule', rule1.ruleId));
    });

    it('allows members and above to create rules', async () => {
      await RulesService.createRule(aquaman, 'T.1.1', 'Member created rule', rulesetId, organization);
      await RulesService.createRule(aquaman, 'T.1.2', 'Leadership created rule', rulesetId, organization);
      await RulesService.createRule(superman, 'T.1.3', 'Admin created rule', rulesetId, organization);
    });
  });

  describe('Complex Rule Scenarios', () => {
    it('creates a hierarchical rule structure', async () => {
      const root = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);

      const child1 = await RulesService.createRule(
        batman,
        'T.1.1',
        'Vehicle Requirements',
        rulesetId,
        organization,
        root.ruleId
      );

      const child2 = await RulesService.createRule(
        batman,
        'T.1.2',
        'Safety Requirements',
        rulesetId,
        organization,
        root.ruleId
      );

      const grandchild1 = await RulesService.createRule(
        superman,
        'T.1.1.1',
        'Wheels',
        rulesetId,
        organization,
        child1.ruleId
      );

      expect(root.parentRule).toBeUndefined();
      expect(child1.parentRule?.ruleId).toBe(root.ruleId);
      expect(child2.parentRule?.ruleId).toBe(root.ruleId);
      expect(grandchild1.parentRule?.ruleId).toBe(child1.ruleId);
    });

    it('creates rules with cross-references', async () => {
      const wheelRule = await RulesService.createRule(batman, 'T.1.1', 'Wheel specifications', rulesetId, organization);

      const brakeRule = await RulesService.createRule(batman, 'T.1.2', 'Brake specifications', rulesetId, organization);

      const brakingSystemRule = await RulesService.createRule(
        superman,
        'T.2.1',
        'Braking system must comply with T.1.1 and T.1.2',
        rulesetId,
        organization,
        undefined,
        [wheelRule.ruleId, brakeRule.ruleId]
      );

      expect(brakingSystemRule.referencedRules).toHaveLength(2);

      const wheelRuleFromDb = await prisma.rule.findUnique({
        where: { ruleId: wheelRule.ruleId },
        include: { referencedBy: true }
      });

      expect(wheelRuleFromDb?.referencedBy.some((r) => r.ruleId === brakingSystemRule.ruleId)).toBe(true);
    });
  });
});

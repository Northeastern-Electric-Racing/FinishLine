import RulesService from '../../src/services/rules.services';
import { Organization, User, Project, Car, Ruleset_Type, Rule_Completion } from '@prisma/client';
import {
  supermanAdmin,
  financeMember,
  wonderwomanGuest,
  batmanAppAdmin,
  aquamanLeadership
} from '../test-data/users.test-data';
import { createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException,
  AccessDeniedAdminOnlyException
} from '../../src/utils/errors.utils';

describe('Create Rules Tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let aquaman: User;
  let wonderwoman: User;
  let rulesetId: string;
  let carId: string;
  let rulesetType: Ruleset_Type;

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
    ({ carId } = car);

    rulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE Rules',
        createdBy: { connect: { userId: batman.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
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
    ({ rulesetId } = ruleset);
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

  describe('Get rulesets by ruleset type', () => {
    it('Successful get rulesets by ruleset types', async () => {
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(1);
      expect(rulesets[0].name).toBe('2025 FSAE Rules');
      expect(rulesets[0].active).toBeTruthy();
      expect(rulesets[0].assignedPercentage).toBe(0);
    });

    it('Successful get rulesets by ruleset types after deleting ruleset', async () => {
      await RulesService.deleteRuleset(rulesetId, batman.userId, orgId);
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(0);
    });

    it('Successful get rulesets by ruleset types after adding ruleset', async () => {
      await prisma.ruleset.create({
        data: {
          fileId: 'test-file-id2',
          name: '2025 FSAE Rules2',
          active: true,
          rulesetType: { connect: { rulesetTypeId: rulesetType.rulesetTypeId } },
          car: { connect: { carId } },
          createdBy: { connect: { userId: batman.userId } }
        }
      });
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(2);
      expect(rulesets[0].name).toBe('2025 FSAE Rules');
      expect(rulesets[1].name).toBe('2025 FSAE Rules2');
    });
  });
});

describe('Delete Rules Tests', () => {
  let organization: Organization;
  let orgId: string;
  let admin: User;
  let nonLeadership: User;
  let project: Project;
  let fsaeRulesetType: Ruleset_Type;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    admin = await createTestUser(supermanAdmin, organization.organizationId);
    nonLeadership = await createTestUser(financeMember, organization.organizationId);
    project = await createTestProject(admin, organization.organizationId);

    fsaeRulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE',
        createdBy: { connect: { userId: admin.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  const createUniqueCar = async (orgId: string) => {
    let carCounter = 1;

    const car = await prisma.car.create({
      data: {
        wbsElement: {
          create: {
            name: `Test Car ${carCounter}`,
            carNumber: carCounter,
            projectNumber: 0,
            workPackageNumber: 0,
            organizationId: orgId
          }
        }
      },
      include: {
        wbsElement: true
      }
    });
    carCounter++;
    return car;
  };

  const setupRules = async (car: Car) => {
    const ruleset1 = await prisma.ruleset.create({
      data: {
        name: 'FSAE Rules 2025',
        fileId: 'fsae-rules-2025',
        active: true,
        dateCreated: new Date(),
        car: { connect: { carId: car.carId } },
        createdBy: { connect: { userId: admin.userId } },
        rulesetType: { connect: { rulesetTypeId: fsaeRulesetType.rulesetTypeId } }
      }
    });

    const topLevelRule = await prisma.rule.create({
      data: {
        ruleCode: 'T',
        ruleContent: 'PART T - GENERAL TECHNICAL REQUIREMENTS',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } }
      }
    });

    const leafRule1 = await prisma.rule.create({
      data: {
        ruleCode: 'T2',
        ruleContent: 'The vehicle must be open-wheeled and open-cockpit...',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        parentRule: { connect: { ruleId: topLevelRule.ruleId } }
      }
    });

    const leafRule2 = await prisma.rule.create({
      data: {
        ruleCode: 'T2.1',
        ruleContent: 'T2.1 Vehicle Configuration',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        parentRule: { connect: { ruleId: topLevelRule.ruleId } }
      }
    });

    return { ruleset1, topLevelRule, leafRule1, leafRule2 };
  };

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

  describe('Project Rule endpoints', () => {
    it('Creates a project rule successfully', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(topLevelRule.ruleId);
      expect(projectRule.rule.ruleCode).toBe(topLevelRule.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(Rule_Completion.REVIEW);
    });
    it('Creates a project rule successfully for a leaf rule', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(leafRule1.ruleId);
      expect(projectRule.rule.ruleCode).toBe(leafRule1.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(Rule_Completion.REVIEW);
    });
    it('Create project rule fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(
        async () => await RulesService.createProjectRule(nonLeadership, organization, leafRule1.ruleId, project.projectId)
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to assign rules to projects'));
    });
    it('Create project rule fails if rule was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule2 } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: leafRule2.ruleId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () => await RulesService.createProjectRule(admin, organization, leafRule2.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Rule', leafRule2.ruleId));
    });
    it('Create project rule fails if rule does not exist', async () => {
      await expect(
        async () => await RulesService.createProjectRule(admin, organization, '019263825673825738', project.projectId)
      ).rejects.toThrow(new NotFoundException('Rule', '019263825673825738'));
    });
    it('Create project rule fails if project was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule2 } = await setupRules(car);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: {
          wbsElement: {
            update: { dateDeleted: new Date() }
          }
        }
      });
      await expect(
        async () => await RulesService.createProjectRule(admin, organization, leafRule2.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Project', project.projectId));
    });
    it('Create project rule fails if project does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, 'fake-project-id')).rejects.toThrow(
        new NotFoundException('Project', 'fake-project-id')
      );
    });
    it('Create project rule fails if project rule assignment already exists', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId)).rejects.toThrow(
        new HttpException(400, 'This rule is already associated with the project')
      );
    });

    // Updating Project Rule Status
    it('Updates a project rule status successfully', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      const updatedProjectRule = await RulesService.editProjectRuleStatus(
        admin,
        organization,
        projectRule.projectRuleId,
        Rule_Completion.COMPLETED
      );

      expect(updatedProjectRule.projectRuleId).toBe(projectRule.projectRuleId);
      expect(updatedProjectRule.currentStatus).toBe(Rule_Completion.COMPLETED);
      expect(updatedProjectRule.statusHistory.length).toBe(1);
      expect(updatedProjectRule.statusHistory[0].newStatus).toBe(Rule_Completion.COMPLETED);
      expect(updatedProjectRule.statusHistory[0].projectRuleId).toBe(projectRule.projectRuleId);
      expect(updatedProjectRule.statusHistory[0].userUpdated.userId).toBe(admin.userId);
      expect(new Date(updatedProjectRule.statusHistory[0].updatedAt).getTime()).toBeGreaterThan(Date.now() - 10000);
    });

    it('Updates a project rule status to the same status', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      const updatedProjectRule = await RulesService.editProjectRuleStatus(
        admin,
        organization,
        projectRule.projectRuleId,
        Rule_Completion.REVIEW
      );

      expect(updatedProjectRule.projectRuleId).toBe(projectRule.projectRuleId);
      expect(updatedProjectRule.currentStatus).toBe(Rule_Completion.REVIEW);
      expect(updatedProjectRule.statusHistory).toHaveLength(0);
    });

    it('Update project rule fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      await expect(
        async () =>
          await RulesService.editProjectRuleStatus(
            nonLeadership,
            organization,
            projectRule.projectRuleId,
            Rule_Completion.REVIEW
          )
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to update a project rule status'));
    });
  });

  describe('Delete Ruleset', () => {
    it('Deletes a ruleset successfully and returns the correct information', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      const expectedPercentage = 0;

      const deleted = await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);

      expect(deleted).toBeDefined();
      expect(deleted.rulesetId).toBe(ruleset1.rulesetId);
      expect(deleted.assignedPercentage).toBeCloseTo(expectedPercentage, 2);
    });
    it('Delete ruleset fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await expect(
        async () => await RulesService.deleteRuleset(ruleset1.rulesetId, nonLeadership.userId, organization.organizationId)
      ).rejects.toThrow(new AccessDeniedException('Only admins can delete a ruleset.'));
    });
    it('Delete ruleset fails if ruleset was already deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);
      await expect(
        async () => await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId)
      ).rejects.toThrow(new DeletedException('Ruleset', ruleset1.rulesetId));
    });
    it('Delete ruleset fails if ruleset does not exist', async () => {
      await expect(
        async () => await RulesService.deleteRuleset('fake-ruleset-id', admin.userId, organization.organizationId)
      ).rejects.toThrow(new NotFoundException('Ruleset', 'fake-ruleset-id'));
    });
  });

  describe('Get all ruleset types', () => {
    it('Successful get all ruleset types', async () => {
      const rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(1);
      expect(rulesetTypes[0].name).toEqual('FSAE');
    });
    it('Get all ruleset types successful after adding ruleset type', async () => {
      await prisma.ruleset_Type.create({
        data: {
          name: 'FSAE2',
          createdByUserId: admin.userId,
          organizationId: orgId
        }
      });
      const rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(2);
      expect(rulesetTypes[1].name).toEqual('FSAE2');
    });
    it('Get all ruleset types successful after deleting ruleset type', async () => {
      await prisma.ruleset_Type.update({
        where: {
          rulesetTypeId: fsaeRulesetType.rulesetTypeId
        },
        data: {
          deletedByUserId: admin.userId
        }
      });
      const rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(0);
    });
  });

  describe('Delete Ruleset Type', () => {
    it('Fails if user not an admin', async () => {
      await expect(async () => await RulesService.deleteRulesetType(nonLeadership, 'FSAE', organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('only admin are allowed to delete ruleset types')
      );
    });

    it('Fails if the ruleset type has already been deleted', async () => {
      const appAdmin = await createTestUser(batmanAppAdmin, orgId);
      await RulesService.deleteRulesetType(appAdmin, 'FSAE', organization);

      await expect(RulesService.deleteRulesetType(appAdmin, '1', organization)).rejects.toThrow(
        new DeletedException('Ruleset Type', '1')
      );
    });

    it('Successfully deletes the ruleset type', async () => {
      const appAdmin = await createTestUser(batmanAppAdmin, orgId);
      const result = await RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization);

      expect(result.deletedByUserId).toBe(appAdmin.userId);
      expect(result.rulesetTypeId).toBe(fsaeRulesetType.rulesetTypeId);
    });
  });
});

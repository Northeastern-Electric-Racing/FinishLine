import { Car, Organization, Rule, Ruleset, Ruleset_Type, User, Project, Rule_Completion } from '@prisma/client';
import { createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import RulesService from '../../src/services/rules.services';
import { supermanAdmin, financeMember, wonderwomanGuest, batmanAppAdmin } from '../test-data/users.test-data';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
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
});

describe('Delete Rules Tests', () => {
  let deletedRule: Rule;
  let rule: Rule;
  let user: User;
  let organization: Organization;
  let orgId: string;
  let car: Car;
  let rulesetType: Ruleset_Type;
  let ruleset: Ruleset;
  let subRule: Rule;
  let project: Project;
  let nonLeadership: User;
  let carCounter = 1;

  const createUniqueCar = async (orgId: string) => {
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

  beforeEach(async () => {
    await resetUsers();

    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    nonLeadership = await createTestUser(financeMember, orgId);

    rulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE',
        createdByUserId: user.userId
      }
    });

    car = await createUniqueCar(orgId);
    project = await createTestProject(user, orgId);

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

    subRule = await prisma.rule.create({
      data: {
        ruleCode: 'parent rule code',
        ruleContent: 'parent rule contenet',
        imageFileIds: [],
        ruleset: { connect: { rulesetId: ruleset.rulesetId } },
        createdBy: { connect: { userId: user.userId } },
        parentRule: {
          connect: { ruleId: rule.ruleId }
        }
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
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

      const deletedSubRule = await prisma.rule.findUnique({
        where: {
          ruleId: subRule.ruleId
        }
      });

      expect(deletedSubRule).toMatchObject({
        ...subRule,
        dateUpdated: deletedSubRule!.dateUpdated,
        dateDeleted: deletedSubRule!.dateDeleted,
        deletedByUserId: user.userId
      });
    });

    it('Fails when non admin tries to delete', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      await expect(RulesService.deleteRule(rule.ruleId, guest, organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete rules')
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

    it('Fails with inconsistent organizations', async () => {
      const user2 = await prisma.user.create({
        data: {
          firstName: 'Admin2',
          lastName: 'User2',
          email: '2',
          googleAuthId: 'organizationCreato2'
        }
      });

      const org2 = await prisma.organization.create({
        data: {
          name: 'Org 2',
          description: 'Org 2 description',
          applicationLink: '',
          userCreated: {
            connect: {
              userId: user2.userId
            }
          }
        }
      });

      const car2 = await createUniqueCar(org2.organizationId);

      const ruleset2 = await prisma.ruleset.create({
        data: {
          name: 'ruleset name',
          fileId: 'fileId',
          active: true,
          dateCreated: new Date(),
          rulesetTypeId: rulesetType.rulesetTypeId,
          createdByUserId: user.userId,
          carId: car2.carId
        }
      });

      const rule2 = await prisma.rule.create({
        data: {
          ruleCode: 'rule org2',
          ruleContent: 'rule content org2',
          imageFileIds: [],
          ruleset: { connect: { rulesetId: ruleset2.rulesetId } },
          createdBy: { connect: { userId: user2.userId } }
        }
      });

      await expect(RulesService.deleteRule(rule2.ruleId, user, organization)).rejects.toThrow(
        new InvalidOrganizationException('Rule')
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

  describe('Project Rule endpoints', () => {
    it('Creates a project rule successfully', async () => {
      const projectRule = await RulesService.createProjectRule(user, organization, rule.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(rule.ruleId);
      expect(projectRule.rule.ruleCode).toBe(rule.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(Rule_Completion.REVIEW);
    });

    it('Creates a project rule successfully for a leaf rule', async () => {
      const projectRule = await RulesService.createProjectRule(user, organization, subRule.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(subRule.ruleId);
      expect(projectRule.rule.ruleCode).toBe(subRule.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(Rule_Completion.REVIEW);
    });

    it('Create project rule fails if user does not have permission', async () => {
      await expect(
        async () => await RulesService.createProjectRule(nonLeadership, organization, subRule.ruleId, project.projectId)
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to assign rules to projects'));
    });

    it('Create project rule fails if rule was deleted', async () => {
      await prisma.rule.update({
        where: { ruleId: subRule.ruleId },
        data: { dateDeleted: new Date() }
      });

      await expect(
        async () => await RulesService.createProjectRule(user, organization, subRule.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Rule', subRule.ruleId));
    });

    it('Create project rule fails if rule does not exist', async () => {
      await expect(
        async () => await RulesService.createProjectRule(user, organization, '019263825673825738', project.projectId)
      ).rejects.toThrow(new NotFoundException('Rule', '019263825673825738'));
    });

    it('Create project rule fails if project was deleted', async () => {
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: {
          wbsElement: {
            update: { dateDeleted: new Date() }
          }
        }
      });

      await expect(
        async () => await RulesService.createProjectRule(user, organization, subRule.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Project', project.projectId));
    });

    it('Create project rule fails if project does not exist', async () => {
      await expect(RulesService.createProjectRule(user, organization, rule.ruleId, 'fake-project-id')).rejects.toThrow(
        new NotFoundException('Project', 'fake-project-id')
      );
    });

    it('Create project rule fails if project rule assignment already exists', async () => {
      await RulesService.createProjectRule(user, organization, rule.ruleId, project.projectId);

      await expect(RulesService.createProjectRule(user, organization, rule.ruleId, project.projectId)).rejects.toThrow(
        new HttpException(400, 'This rule is already associated with the project')
      );
    });
  });
});

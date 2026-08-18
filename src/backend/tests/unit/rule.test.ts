import RulesService from '../../src/services/rules.services';
import { Organization, User, Project, Car, Ruleset_Type, Ruleset, Team } from '@prisma/client';
import {
  supermanAdmin,
  financeMember,
  wonderwomanGuest,
  batmanAppAdmin,
  aquamanLeadership,
  alfred,
  flashAdmin
} from '../test-data/users.test-data';
import {
  createTestOrganization,
  createTestProject,
  createTestUser,
  resetUsers,
  createTestTeam,
  createTestTeamType
} from '../test-utils';
import prisma from '../../src/prisma/prisma';
import {
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  NotFoundException,
  AccessDeniedAdminOnlyException,
  InvalidOrganizationException
} from '../../src/utils/errors.utils';
import TeamsService from '../../src/services/teams.services';
import ProjectsService from '../../src/services/projects.services';

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

    const ruleset1 = await prisma.ruleset.create({
      data: {
        fileId: 'test-file-id',
        name: '2025 FSAE Rules',
        active: true,
        rulesetType: { connect: { rulesetTypeId: rulesetType.rulesetTypeId } },
        car: { connect: { carId } },
        createdBy: { connect: { userId: batman.userId } },
        dateCreated: new Date('2025-01-01T10:00:00Z')
      }
    });

    ({ rulesetId } = ruleset1);
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

      const referencedIds = rule3.referencedRules.map((ref) => ref.ruleId);
      expect(referencedIds).toHaveLength(2);
      expect(referencedIds).toContain(rule1.ruleId);
      expect(referencedIds).toContain(rule2.ruleId);
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
        new AccessDeniedException('Only leadership and above can create rules')
      );
    });

    it('fails when a member tries to create a rule', async () => {
      const member = await createTestUser(financeMember, orgId);
      await expect(RulesService.createRule(member, 'T.1.1', 'Some rule', rulesetId, organization)).rejects.toThrow(
        new AccessDeniedException('Only leadership and above can create rules')
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

    // this is allowed but with warning in case a parent code needs to be updated which won't break all existing children
    it('allows a child rule code that does not start with the parent rule code', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent', rulesetId, organization);

      const childRule = await RulesService.createRule(superman, 'TH.1', 'Child', rulesetId, organization, parentRule.ruleId);

      expect(childRule.ruleCode).toBe('TH.1');
      expect(childRule.parentRule?.ruleId).toBe(parentRule.ruleId);
    });

    it('successfully creates a rule with blank content', async () => {
      const rule = await RulesService.createRule(batman, 'T.9.1', '', rulesetId, organization);
      expect(rule.ruleContent).toBe('');
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

    it('allows leadership and above to create rules', async () => {
      await RulesService.createRule(aquaman, 'T.1.1', 'Leadership created rule', rulesetId, organization);
      await RulesService.createRule(superman, 'T.1.2', 'Admin created rule', rulesetId, organization);
    });

    describe('Create ruleset', () => {
      it('successful create ruleset', async () => {
        const ruleset = await RulesService.createRuleset(
          superman,
          organization,
          'ruleset name',
          rulesetType.rulesetTypeId,
          0,
          false,
          'fileId'
        );

        expect(ruleset.name).toEqual('ruleset name');
      });
      it('Create ruleset fails when submitters is not leadership', async () => {
        await expect(
          async () =>
            await RulesService.createRuleset(
              wonderwoman,
              organization,
              'ruleset name',
              rulesetType.rulesetTypeId,
              0,
              false,
              'fileId'
            )
        ).rejects.toThrow(new AccessDeniedException('only leadership and above can create ruleset!'));
      });
      it('Create ruleset fails when given bad ruleset id', async () => {
        await expect(
          async () =>
            await RulesService.createRuleset(superman, organization, 'ruleset name', 'bad ruleset type', 0, false, 'fileId')
        ).rejects.toThrow(new NotFoundException('Ruleset Type', 'bad ruleset type'));
      });
      it('Create ruleset fails when given bad car number', async () => {
        await expect(
          async () =>
            await RulesService.createRuleset(
              superman,
              organization,
              'ruleset name',
              rulesetType.rulesetTypeId,
              12312312,
              false,
              'fileId'
            )
        ).rejects.toThrow(new NotFoundException('Car', 12312312));
      });
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

      const wheelRuleFromDb = await prisma.rule.findUnique({
        where: { ruleId: wheelRule.ruleId },
        include: { referencedBy: true }
      });

      expect(wheelRuleFromDb?.referencedBy.some((r) => r.ruleId === brakingSystemRule.ruleId)).toBe(true);
    });
  });

  describe('Create Project Rule', () => {
    it('Creates project rules for all ancestors when assigning deep child rule', async () => {
      const topLevelRule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);
      const child = await RulesService.createRule(
        batman,
        'T.1.1',
        'Vehicle Requirements',
        rulesetId,
        organization,
        topLevelRule.ruleId
      );
      const grandchild = await RulesService.createRule(batman, 'T.1.1.1', 'Wheels', rulesetId, organization, child.ruleId);

      const teamType = await createTestTeamType('technical', orgId);
      const team = await createTestTeam(batman.userId, teamType.teamTypeId, orgId);
      // every rule in the ancestor chain must be on the project's team for the leaf to be assignable
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, batman, organization);
      await RulesService.toggleRuleTeam(child.ruleId, team.teamId, batman, organization);

      await RulesService.toggleRuleTeam(grandchild.ruleId, team.teamId, batman, organization);

      const project = await createTestProject(aquaman, orgId, team.teamId, carId);

      await RulesService.createProjectRule(aquaman, organization, grandchild.ruleId, project.projectId);

      const projectRules = await RulesService.getProjectRules(aquaman, rulesetId, project.projectId, organization);
      const assignedRuleIds = projectRules.map((pr) => pr.rule.ruleId);
      expect(assignedRuleIds).toHaveLength(3); // grandchild, child, topLevelRule
      expect(assignedRuleIds).toEqual(expect.arrayContaining([topLevelRule.ruleId, child.ruleId, grandchild.ruleId]));
    });

    it('Creates project rules for shared ancestors when adding a sibling child rule', async () => {
      const topLevelRule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);
      const child = await RulesService.createRule(
        batman,
        'T.1.1',
        'Vehicle Requirements',
        rulesetId,
        organization,
        topLevelRule.ruleId
      );
      const grandchild1 = await RulesService.createRule(batman, 'T.1.1.1', 'Wheels', rulesetId, organization, child.ruleId);
      const grandchild2 = await RulesService.createRule(batman, 'T.1.1.2', 'Brakes', rulesetId, organization, child.ruleId);

      const teamType = await createTestTeamType('technical', orgId);
      const team = await createTestTeam(batman.userId, teamType.teamTypeId, orgId);

      // every rule in the ancestor chain must be on the project's team for the leaves to be assignable
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, batman, organization);
      await RulesService.toggleRuleTeam(child.ruleId, team.teamId, batman, organization);

      await RulesService.toggleRuleTeam(grandchild1.ruleId, team.teamId, batman, organization);
      await RulesService.toggleRuleTeam(grandchild2.ruleId, team.teamId, batman, organization);

      const project = await createTestProject(aquaman, orgId, team.teamId, carId);

      await RulesService.createProjectRule(aquaman, organization, grandchild1.ruleId, project.projectId);
      // adding sibling must not error or duplicate the already-present parent/root rules
      await RulesService.createProjectRule(aquaman, organization, grandchild2.ruleId, project.projectId);

      const projectRules = await RulesService.getProjectRules(aquaman, rulesetId, project.projectId, organization);
      const assignedRuleIds = projectRules.map((pr) => pr.rule.ruleId);
      expect(assignedRuleIds).toHaveLength(4); // grandchild1, grandchild2, child, topLevelRule
      expect(assignedRuleIds).toEqual(
        expect.arrayContaining([topLevelRule.ruleId, child.ruleId, grandchild1.ruleId, grandchild2.ruleId])
      );
    });

    it('Creating project rule does not assign descendants of the selected rule', async () => {
      const topLevelRule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);
      const child = await RulesService.createRule(
        batman,
        'T.1.1',
        'Vehicle Requirements',
        rulesetId,
        organization,
        topLevelRule.ruleId
      );
      await RulesService.createRule(batman, 'T.1.1.1', 'Wheels', rulesetId, organization, child.ruleId);

      const teamType = await createTestTeamType('technical', orgId);
      const team = await createTestTeam(batman.userId, teamType.teamTypeId, orgId);

      await RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, batman, organization);
      await RulesService.toggleRuleTeam(child.ruleId, team.teamId, batman, organization);

      const project = await createTestProject(aquaman, orgId, team.teamId, carId);

      await RulesService.createProjectRule(aquaman, organization, child.ruleId, project.projectId);

      const projectRules = await RulesService.getProjectRules(aquaman, rulesetId, project.projectId, organization);
      const assignedRuleIds = projectRules.map((pr) => pr.rule.ruleId);
      expect(assignedRuleIds).toHaveLength(2); // child and topLevelRule, not grandchild
      expect(assignedRuleIds).toEqual(expect.arrayContaining([topLevelRule.ruleId, child.ruleId]));
    });

    it('Creating project rule is refused entirely when an ancestor has been deleted', async () => {
      const topLevelRule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);
      const child = await RulesService.createRule(
        batman,
        'T.1.1',
        'Vehicle Requirements',
        rulesetId,
        organization,
        topLevelRule.ruleId
      );
      const grandchild = await RulesService.createRule(batman, 'T.1.1.1', 'Wheels', rulesetId, organization, child.ruleId);

      const teamType = await createTestTeamType('technical', orgId);
      const team = await createTestTeam(batman.userId, teamType.teamTypeId, orgId);
      await RulesService.toggleRuleTeam(grandchild.ruleId, team.teamId, batman, organization);

      // soft-delete an ancestor so the chain to the top-level rule is broken
      await prisma.rule.update({
        where: { ruleId: child.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: batman.userId } } }
      });

      const project = await createTestProject(aquaman, orgId, team.teamId, carId);

      // a broken chain means the grandchild could never display, so no rules are assigned to the project and an error is thrown
      await expect(
        async () => await RulesService.createProjectRule(aquaman, organization, grandchild.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Rule', child.ruleId));

      // nothing should have been assigned (not the grandchild, the deleted parent, or the root)
      const projectRules = await RulesService.getProjectRules(aquaman, rulesetId, project.projectId, organization);
      expect(projectRules).toHaveLength(0);

      const grandchildProjectRule = await prisma.project_Rule.findUnique({
        where: { ruleId_projectId: { ruleId: grandchild.ruleId, projectId: project.projectId } }
      });
      expect(grandchildProjectRule).toBeNull();
    });

    it('throws when the rule is already associated with the project', async () => {
      const rule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);

      const teamType = await createTestTeamType('technical', orgId);
      const team = await createTestTeam(batman.userId, teamType.teamTypeId, orgId);
      await RulesService.toggleRuleTeam(rule.ruleId, team.teamId, batman, organization);

      const project = await createTestProject(aquaman, orgId, team.teamId, carId);

      await RulesService.createProjectRule(aquaman, organization, rule.ruleId, project.projectId);

      await expect(
        async () => await RulesService.createProjectRule(aquaman, organization, rule.ruleId, project.projectId)
      ).rejects.toThrow(new HttpException(400, 'This rule is already associated with the project'));
    });

    it('throws when a guest tries to assign a rule to a project', async () => {
      const rule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);
      const project = await createTestProject(aquaman, orgId, undefined, carId);

      await expect(
        async () => await RulesService.createProjectRule(wonderwoman, organization, rule.ruleId, project.projectId)
      ).rejects.toThrow(AccessDeniedException);
    });

    it('throws when the rule does not exist', async () => {
      const project = await createTestProject(aquaman, orgId, undefined, carId);

      await expect(
        async () => await RulesService.createProjectRule(aquaman, organization, 'fake-rule-id', project.projectId)
      ).rejects.toThrow(new NotFoundException('Rule', 'fake-rule-id'));
    });

    it('throws when the project does not exist', async () => {
      const rule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);

      await expect(
        async () => await RulesService.createProjectRule(aquaman, organization, rule.ruleId, 'fake-project-id')
      ).rejects.toThrow(new NotFoundException('Project', 'fake-project-id'));
    });

    it('throws when the rule is not on any of the project`s teams', async () => {
      // rule has no team, but the project belongs to a team, so they share no team
      const rule = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);

      const teamType = await createTestTeamType('technical', orgId);
      const team = await createTestTeam(batman.userId, teamType.teamTypeId, orgId);
      const project = await createTestProject(aquaman, orgId, team.teamId, carId);

      await expect(
        async () => await RulesService.createProjectRule(aquaman, organization, rule.ruleId, project.projectId)
      ).rejects.toThrow(new HttpException(400, "Rule must be on one of the project's teams to be assigned to it"));
    });
  });

  describe('Get rulesets by ruleset type', () => {
    it('Successful get rulesets by ruleset types', async () => {
      const rulesets = await RulesService.getRulesetsByRulesetType(aquaman, rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(1);
      expect(rulesets[0].name).toBe('2025 FSAE Rules');
      expect(rulesets[0].active).toBeTruthy();
      expect(rulesets[0].assignedPercentage).toBe(0);
    });

    it('Successful get rulesets by ruleset types after deleting ruleset', async () => {
      // Deactivate the ruleset before deleting
      await prisma.ruleset.update({
        where: { rulesetId },
        data: { active: false }
      });

      await RulesService.deleteRuleset(rulesetId, batman.userId, orgId);
      const rulesets = await RulesService.getRulesetsByRulesetType(aquaman, rulesetType.rulesetTypeId, orgId);
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
      const rulesets = await RulesService.getRulesetsByRulesetType(aquaman, rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(2);
      expect(rulesets[0].name).toBe('2025 FSAE Rules2');
      expect(rulesets[1].name).toBe('2025 FSAE Rules');
    });

    it('Successful get rulesets by ruleset types filtered by car', async () => {
      const otherCar = await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              name: 'Other Car',
              carNumber: 1,
              projectNumber: 0,
              workPackageNumber: 0,
              organizationId: orgId
            }
          }
        }
      });

      const otherCarRuleset = await prisma.ruleset.create({
        data: {
          fileId: 'other-car-file-id',
          name: 'Other Car FSAE Rules',
          active: false,
          rulesetType: { connect: { rulesetTypeId: rulesetType.rulesetTypeId } },
          car: { connect: { carId: otherCar.carId } },
          createdBy: { connect: { userId: batman.userId } }
        }
      });

      // 2 total rulesets for this type
      const allRulesets = await RulesService.getRulesetsByRulesetType(aquaman, rulesetType.rulesetTypeId, orgId);
      expect(allRulesets.length).toBe(2);

      // 1 ruleset when filtered to the original car
      const originalCarRulesets = await RulesService.getRulesetsByRulesetType(aquaman, rulesetType.rulesetTypeId, orgId, carId);
      expect(originalCarRulesets.length).toBe(1);
      expect(originalCarRulesets[0].rulesetId).toBe(rulesetId);

      const otherCarRulesets = await RulesService.getRulesetsByRulesetType(aquaman, rulesetType.rulesetTypeId, orgId, otherCar.carId);

      // 1 ruleset when filtered to the other car
      expect(otherCarRulesets.length).toBe(1);
      expect(otherCarRulesets[0].rulesetId).toBe(otherCarRuleset.rulesetId);
    });
  });

  describe('Get Child Rules', () => {
    it('Successfully gets child rules for a parent rule', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent Rule', rulesetId, organization);
      await RulesService.createRule(batman, 'T.1.1', 'Child Rule 1', rulesetId, organization, parentRule.ruleId);
      await RulesService.createRule(batman, 'T.1.2', 'Child Rule 2', rulesetId, organization, parentRule.ruleId);
      const childRules = await RulesService.getChildRules(aquaman, parentRule.ruleId, organization);
      expect(childRules.length).toBe(2);
      expect(childRules[0].ruleCode).toBe('T.1.1');
      expect(childRules[1].ruleCode).toBe('T.1.2');
    });

    it('Successfully gets child rules after deleting child rule', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.2', 'Parent Rule', rulesetId, organization);
      const childRule = await RulesService.createRule(
        batman,
        'T.2.1',
        'Child Rule',
        rulesetId,
        organization,
        parentRule.ruleId
      );
      await RulesService.deleteRule(childRule.ruleId, batman, organization);
      const childRules = await RulesService.getChildRules(aquaman, parentRule.ruleId, organization);
      expect(childRules.length).toBe(0);
    });

    it('Successfully gets child rules after adding child rule', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.3', 'Parent Rule', rulesetId, organization);
      await RulesService.createRule(batman, 'T.3.1', 'Child Rule 1', rulesetId, organization, parentRule.ruleId);
      const childRulesAfterOne = await RulesService.getChildRules(aquaman, parentRule.ruleId, organization);
      expect(childRulesAfterOne.length).toBe(1);
      await RulesService.createRule(batman, 'T.3.2', 'Child Rule 2', rulesetId, organization, parentRule.ruleId);
      const childRulesAfterTwo = await RulesService.getChildRules(aquaman, parentRule.ruleId, organization);
      expect(childRulesAfterTwo.length).toBe(2);
      expect(childRulesAfterTwo[0].ruleCode).toBe('T.3.1');
      expect(childRulesAfterTwo[1].ruleCode).toBe('T.3.2');
    });

    it('Fails if parent rule does not exist', async () => {
      await expect(async () => await RulesService.getChildRules(aquaman, 'fake-rule-id', organization)).rejects.toThrow(
        new NotFoundException('Rule', 'fake-rule-id')
      );
    });

    it('Fails if parent rule is deleted', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.4', 'Parent Rule', rulesetId, organization);
      await RulesService.deleteRule(parentRule.ruleId, batman, organization);
      await expect(async () => await RulesService.getChildRules(aquaman, parentRule.ruleId, organization)).rejects.toThrow(
        new DeletedException('Rule', parentRule.ruleId)
      );
    });

    it('Fails if parent rule is from another organization', async () => {
      //manually create a user to avoid same googleAuthID as otherBatman
      const otherUser = await prisma.user.create({
        data: {
          firstName: alfred.firstName,
          lastName: alfred.lastName,
          email: alfred.email,
          googleAuthId: alfred.googleAuthId
        }
      });
      const otherOrganization = await prisma.organization.create({
        data: {
          name: 'Other Org',
          description: 'Another organization',
          applicationLink: '',
          userCreated: {
            connect: {
              userId: otherUser.userId
            }
          }
        }
      });
      const otherBatman = await createTestUser(flashAdmin, otherOrganization.organizationId);
      const otherCar = await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              name: 'Other Car',
              carNumber: 2,
              projectNumber: 0,
              workPackageNumber: 0,
              organizationId: otherOrganization.organizationId
            }
          }
        },
        include: { wbsElement: true }
      });

      const otherRuleset = await prisma.ruleset.create({
        data: {
          name: 'Other Ruleset',
          fileId: 'other',
          active: true,
          carId: otherCar.carId,
          createdByUserId: otherBatman.userId,
          rulesetTypeId: rulesetType.rulesetTypeId
        }
      });
      const otherParentRule = await prisma.rule.create({
        data: {
          ruleCode: 'O.1',
          ruleContent: 'Other Parent',
          imageFileIds: [],
          rulesetId: otherRuleset.rulesetId,
          createdByUserId: otherBatman.userId
        }
      });
      await expect(async () => await RulesService.getChildRules(aquaman, otherParentRule.ruleId, organization)).rejects.toThrow(
        new InvalidOrganizationException('Rule')
      );
    });
  });
  describe('Update ruleset status', () => {
    it('update ruleset status - successful', async () => {
      const ruleset1 = await RulesService.updateRuleset(batman, orgId, rulesetId, 'name1', false);
      expect(ruleset1.active).toBe(false);
      expect(ruleset1.name).toBe('name1');
      const ruleset2 = await RulesService.updateRuleset(batman, orgId, rulesetId, 'name2', true);
      expect(ruleset2.active).toBe(true);
      expect(ruleset2.name).toBe('name2');
    });
    it('update ruleset status on deleted ruleset fails', async () => {
      // Deactivate the ruleset before deleting
      await prisma.ruleset.update({
        where: { rulesetId },
        data: { active: false }
      });
      await RulesService.deleteRuleset(rulesetId, batman.userId, orgId);
      await expect(async () => await RulesService.updateRuleset(batman, orgId, rulesetId, 'name', false)).rejects.toThrow(
        new NotFoundException('Ruleset', rulesetId)
      );
    });
    it('update active ruleset successful with active ruleset in different type', async () => {
      const ruleset2 = await RulesService.createRuleset(
        superman,
        organization,
        'ruleset name',
        (await RulesService.createRulesetType(batman, 'ruleset type 2', organization)).rulesetTypeId,
        0,
        false,
        'fileId'
      );
      await RulesService.updateRuleset(batman, orgId, ruleset2.rulesetId, 'name', false);
      const ruleset = await RulesService.updateRuleset(batman, orgId, rulesetId, 'name', true);
      expect(ruleset.active).toBe(true);
    });
    it('update ruleset status fails with wrong org', async () => {
      const wrongOrg = await prisma.organization.create({
        data: {
          name: 'wrong org',
          userCreatedId: batman.userId,
          description: 'desc',
          applicationLink: '1'
        }
      });

      const wrongOrgCar = await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              name: 'wrong org car',
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0,
              organizationId: wrongOrg.organizationId
            }
          }
        }
      });

      const wrongOrgRulesetType = await prisma.ruleset_Type.create({
        data: {
          name: 'ruleset type 2',
          createdBy: { connect: { userId: batman.userId } },
          organization: { connect: { organizationId: wrongOrg.organizationId } }
        }
      });

      const wrongOrgRuleset = await prisma.ruleset.create({
        data: {
          fileId: 'fileId',
          name: 'ruleset name',
          active: false,
          rulesetType: { connect: { rulesetTypeId: wrongOrgRulesetType.rulesetTypeId } },
          car: { connect: { carId: wrongOrgCar.carId } },
          createdBy: { connect: { userId: batman.userId } }
        }
      });

      await expect(
        async () => await RulesService.updateRuleset(batman, orgId, wrongOrgRuleset.rulesetId, 'name', false)
      ).rejects.toThrow(new NotFoundException('Ruleset', wrongOrgRuleset.rulesetId));
    });
    it('update ruleset status - fails non leadership', async () => {
      await expect(
        async () => await RulesService.updateRuleset(wonderwoman, orgId, rulesetId, 'name', false)
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to update ruleset status'));
    });
    it('update ruleset status - fails if another ruleset for the same car and type is already active', async () => {
      // car 0 already has an active ruleset, so activating ruleset2 for car 0 should fail
      const ruleset2 = await RulesService.createRuleset(
        superman,
        organization,
        'ruleset name',
        rulesetType.rulesetTypeId,
        0,
        false,
        'fileId'
      );
      await expect(
        async () => await RulesService.updateRuleset(batman, orgId, ruleset2.rulesetId, 'name', true)
      ).rejects.toThrow(new HttpException(400, 'There is already an active ruleset for this ruleset type and car'));
    });
    it('Update active ruleset successful with active ruleset for a different car', async () => {
      // ensure ruleset for car 0 already has an active ruleset
      const originalRulesetBefore = await prisma.ruleset.findUniqueOrThrow({ where: { rulesetId } });
      expect(originalRulesetBefore.active).toBe(true);

      const otherCar = await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              name: 'Other Car',
              carNumber: 1,
              projectNumber: 0,
              workPackageNumber: 0,
              organizationId: orgId
            }
          }
        },
        include: { wbsElement: true }
      });

      // create inactive ruleset for the other car, under the same ruleset type as the already active car 0 ruleset
      const otherCarRuleset = await RulesService.createRuleset(
        superman,
        organization,
        'other car ruleset name',
        rulesetType.rulesetTypeId,
        otherCar.wbsElement.carNumber,
        false,
        'fileId'
      );

      // activating another car's ruleset should succeed since "already active" check is scoped per car
      const updatedOtherCarRuleset = await RulesService.updateRuleset(
        batman,
        orgId,
        otherCarRuleset.rulesetId,
        'name',
        true
      );
      expect(updatedOtherCarRuleset.active).toBe(true);

      // original car's ruleset is untouched
      // two active rulesets for one ruleset type but different cars
      const originalRulesetAfter = await prisma.ruleset.findUniqueOrThrow({ where: { rulesetId } });
      expect(originalRulesetAfter.active).toBe(true);
    });
  });
});

describe('Rule Tests', () => {
  let organization: Organization;
  let orgId: string;
  let otherOrg: Organization;
  let admin: User;
  let nonLeadership: User;
  let guest: User;
  let project: Project;
  let fsaeRulesetType: Ruleset_Type;
  let emptyRulesetType: Ruleset_Type;
  let testTeam: Team;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    admin = await createTestUser(supermanAdmin, organization.organizationId);
    nonLeadership = await createTestUser(financeMember, organization.organizationId);
    guest = await createTestUser(wonderwomanGuest, organization.organizationId);
    project = await createTestProject(admin, organization.organizationId);
    testTeam = await prisma.team.create({
      data: {
        teamName: 'Test',
        slackId: 'test-slack',
        headId: admin.userId,
        organizationId: organization.organizationId
      }
    });
    const otherOrgUser = await prisma.user.create({
      data: {
        firstName: 'Other',
        lastName: 'Admin',
        email: 'other@test.com',
        googleAuthId: 'otherOrganizationCreator' // different googleAuthId
      }
    });
    otherOrg = await prisma.organization.create({
      data: {
        name: 'Other Organization',
        description: 'Other test organization',
        applicationLink: '',
        userCreated: {
          connect: {
            userId: otherOrgUser.userId
          }
        }
      }
    });

    fsaeRulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE',
        createdBy: { connect: { userId: admin.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
      }
    });

    emptyRulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'Ruleset Type with no Active Rulesets or Anything',
        createdBy: { connect: { userId: admin.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

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

    const ruleset2 = await prisma.ruleset.create({
      data: {
        fileId: 'test-file-id',
        name: 'Inactive 2025 FSAE Rules',
        active: false,
        rulesetType: { connect: { rulesetTypeId: fsaeRulesetType.rulesetTypeId } },
        car: { connect: { carId: car.carId } },
        createdBy: { connect: { userId: admin.userId } },
        dateCreated: new Date('2024-12-31T10:00:00Z')
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

    const referencedRule = await prisma.rule.create({
      data: {
        ruleCode: 'B2',
        ruleContent: 'Rule content for B2',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } }
      }
    });

    const referencingRule = await prisma.rule.create({
      data: {
        ruleCode: 'A2',
        ruleContent: 'This rule references B2',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        referencedRule: { connect: { ruleId: referencedRule.ruleId } }
      }
    });

    return { ruleset1, ruleset2, topLevelRule, leafRule1, leafRule2, referencedRule, referencingRule };
  };

  describe('Create Ruleset Type', () => {
    it('Fails if user is not leadership or above', async () => {
      await expect(async () => await RulesService.createRulesetType(guest, 'FSAE', organization)).rejects.toThrow(
        new AccessDeniedException('only leadership and above can create ruleset types!')
      );
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
      // rule and project must share a team for the rule to be assignable
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(topLevelRule.ruleId);
      expect(projectRule.rule.ruleCode).toBe(topLevelRule.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.rule.isComplete).toBe(false);
    });
    it('Creates a project rule successfully for a leaf rule', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1, topLevelRule } = await setupRules(car);
      // every rule in the ancestor chain must be on the project's team for the leaf to be assignable
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, testTeam.teamId, admin, organization);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(leafRule1.ruleId);
      expect(projectRule.rule.ruleCode).toBe(leafRule1.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.rule.isComplete).toBe(false);
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
      const { leafRule1, topLevelRule } = await setupRules(car);
      // every rule in the chain must be on the project's team
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, testTeam.teamId, admin, organization);
      await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId)).rejects.toThrow(
        new HttpException(400, 'This rule is already associated with the project')
      );
    });

    // Setting Rule Completion
    it('Marks a rule complete successfully and records who/where', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      const updatedRule = await RulesService.setRuleCompletion(
        admin,
        organization,
        topLevelRule.ruleId,
        true,
        project.projectId
      );

      expect(updatedRule.ruleId).toBe(topLevelRule.ruleId);
      expect(updatedRule.isComplete).toBe(true);
      expect(updatedRule.completedBy?.firstName).toBe(admin.firstName);
      expect(updatedRule.completedBy?.lastName).toBe(admin.lastName);
      expect(updatedRule.completedInProject?.projectId).toBe(project.projectId);
    });

    it('Marks a rule complete without a project (general view)', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      const updatedRule = await RulesService.setRuleCompletion(admin, organization, topLevelRule.ruleId, true);

      expect(updatedRule.isComplete).toBe(true);
      expect(updatedRule.completedBy?.firstName).toBe(admin.firstName);
      expect(updatedRule.completedInProject).toBeUndefined();
    });

    it('Marks a rule incomplete and clears completion info', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      await RulesService.setRuleCompletion(admin, organization, topLevelRule.ruleId, true, project.projectId);
      const updatedRule = await RulesService.setRuleCompletion(admin, organization, topLevelRule.ruleId, false);

      expect(updatedRule.isComplete).toBe(false);
      expect(updatedRule.completedBy).toBeUndefined();
      expect(updatedRule.completedInProject).toBeUndefined();
    });

    it('Set rule completion fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      await expect(
        async () =>
          await RulesService.setRuleCompletion(nonLeadership, organization, topLevelRule.ruleId, true, project.projectId)
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to update rule completion'));
    });
  });

  describe('Edit Rule', () => {
    it('Fails if user is not an admin', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.editRule(
            guest,
            'Some rule content',
            leafRule1.ruleId,
            leafRule1.ruleCode,
            ['newfile'],
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a rule'));
    });

    it('Fails if rule doesn`t exist', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.editRule(
            await createTestUser(batmanAppAdmin, orgId),
            'Some more rule content',
            '1',
            leafRule1.ruleCode,
            ['samefile'],
            organization
          )
      ).rejects.toThrow(new NotFoundException('Rule', 1));
    });

    it('Succeeds and edits a rule', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const updatedRule = await RulesService.editRule(
        admin,
        'BRAND NEW RULE CONTENT',
        leafRule1.ruleId,
        leafRule1.ruleCode,
        leafRule1.imageFileIds,
        organization
      );

      expect(updatedRule.ruleContent).toEqual('BRAND NEW RULE CONTENT');
    });

    it('Succeeds and edits a rule to have blank content', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const updatedRule = await RulesService.editRule(
        admin,
        '',
        leafRule1.ruleId,
        leafRule1.ruleCode,
        leafRule1.imageFileIds,
        organization
      );

      expect(updatedRule.ruleContent).toEqual('');
    });

    it('Fails when new rule code is blank', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);

      await expect(
        RulesService.editRule(admin, leafRule1.ruleContent, leafRule1.ruleId, '', leafRule1.imageFileIds, organization)
      ).rejects.toThrow(new HttpException(400, 'Rule code cannot be empty'));
    });

    it('Succeeds and changes a rule code that still satisfies the parent prefix', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);

      const updatedRule = await RulesService.editRule(
        admin,
        leafRule1.ruleContent,
        leafRule1.ruleId,
        'T99',
        leafRule1.imageFileIds,
        organization
      );

      expect(updatedRule.ruleCode).toEqual('T99');
    });

    it('Fails when new rule code duplicates another rule in the same ruleset', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1, leafRule2 } = await setupRules(car);

      await expect(
        RulesService.editRule(
          admin,
          leafRule1.ruleContent,
          leafRule1.ruleId,
          leafRule2.ruleCode,
          leafRule1.imageFileIds,
          organization
        )
      ).rejects.toThrow(new HttpException(400, `Rule with code ${leafRule2.ruleCode} already exists in this ruleset`));
    });

    it('Fails when new rule code duplicates another rule code padded with whitespace', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1, leafRule2 } = await setupRules(car);

      await expect(
        RulesService.editRule(
          admin,
          leafRule1.ruleContent,
          leafRule1.ruleId,
          `  ${leafRule2.ruleCode}  `,
          leafRule1.imageFileIds,
          organization
        )
      ).rejects.toThrow(new HttpException(400, `Rule with code ${leafRule2.ruleCode} already exists in this ruleset`));
    });

    it('Fails when parent rule is in a different ruleset', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset2, leafRule1 } = await setupRules(car);

      const otherRulesetRule = await prisma.rule.create({
        data: {
          ruleCode: 'X1',
          ruleContent: 'Rule in a different ruleset',
          imageFileIds: [],
          dateCreated: new Date(),
          ruleset: { connect: { rulesetId: ruleset2.rulesetId } },
          createdBy: { connect: { userId: admin.userId } }
        }
      });

      await expect(
        RulesService.editRule(
          admin,
          leafRule1.ruleContent,
          leafRule1.ruleId,
          leafRule1.ruleCode,
          leafRule1.imageFileIds,
          organization,
          otherRulesetRule.ruleId
        )
      ).rejects.toThrow(new HttpException(400, 'Parent rule must be in the same ruleset'));
    });

    it('Allows a new rule code that does not start with the existing parent rule code', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule2 } = await setupRules(car); // leafRule2's parent code is 'T'

      const updatedRule = await RulesService.editRule(
        admin,
        leafRule2.ruleContent,
        leafRule2.ruleId,
        'X2.1',
        leafRule2.imageFileIds,
        organization
      );

      expect(updatedRule.parentRule?.ruleCode).not.toEqual('X2');
      expect(updatedRule.ruleCode).toEqual('X2.1');
    });
  });

  describe('Delete Ruleset', () => {
    it('Deletes a ruleset successfully and returns the correct information', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      // deactivate before deleting
      await prisma.ruleset.update({
        where: { rulesetId: ruleset1.rulesetId },
        data: { active: false }
      });

      const totalRules = await prisma.rule.count({
        where: { rulesetId: ruleset1.rulesetId }
      });
      const rulesWithTeams = await prisma.rule.count({
        where: {
          rulesetId: ruleset1.rulesetId,
          teams: { some: {} }
        }
      });
      const expectedPercentage = totalRules > 0 ? (rulesWithTeams / totalRules) * 100 : 0;
      const deleted = await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);

      expect(deleted).toBeDefined();
      expect(deleted.rulesetId).toBe(ruleset1.rulesetId);
      expect(deleted.assignedPercentage).toBeCloseTo(expectedPercentage, 2);
    });
    it('Throws error when trying to delete an active ruleset', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      // Ensure the ruleset is active
      await prisma.ruleset.update({
        where: { rulesetId: ruleset1.rulesetId },
        data: { active: true }
      });

      await expect(
        RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId)
      ).rejects.toThrow('Cannot delete an active ruleset. Please deactivate it first.');
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

      // Deactivate the ruleset before deleting
      await prisma.ruleset.update({
        where: { rulesetId: ruleset1.rulesetId },
        data: { active: false }
      });

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
      const rulesetTypes = await RulesService.getAllRulesetTypes(admin, organization);
      expect(rulesetTypes.length).toEqual(2);
      expect(rulesetTypes[0].name).toEqual('FSAE');
      expect(rulesetTypes[1].name).toEqual('Ruleset Type with no Active Rulesets or Anything');
    });
    it('Get all ruleset types successful after adding ruleset type', async () => {
      await prisma.ruleset_Type.create({
        data: {
          name: 'FSAE2',
          createdByUserId: admin.userId,
          organizationId: orgId
        }
      });
      const rulesetTypes = await RulesService.getAllRulesetTypes(admin, organization);
      expect(rulesetTypes.length).toEqual(3);
      expect(rulesetTypes[2].name).toEqual('FSAE2');
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
      const rulesetTypes = await RulesService.getAllRulesetTypes(admin, organization);
      expect(rulesetTypes.length).toEqual(1);
    });
  });

  describe('Get Active Ruleset', () => {
    it('Fails if user is a guest', async () => {
      await expect(RulesService.getActiveRuleset(guest, fsaeRulesetType.rulesetTypeId, organization)).rejects.toThrow(
        new AccessDeniedException('only members and above can view ruleset types!')
      );
    });

    it('Fails if ruleset type does not exist', async () => {
      await expect(RulesService.getActiveRuleset(admin, 'fake-ruleset-type-id', organization)).rejects.toThrow(
        new NotFoundException('Ruleset Type', 'fake-ruleset-type-id')
      );
    });

    it('Fails if ruleset type is already deleted', async () => {
      await prisma.ruleset_Type.update({
        where: {
          rulesetTypeId: emptyRulesetType.rulesetTypeId
        },
        data: {
          deletedByUserId: admin.userId
        }
      });

      await expect(RulesService.getActiveRuleset(admin, emptyRulesetType.rulesetTypeId, organization)).rejects.toThrow(
        new DeletedException('Ruleset Type', emptyRulesetType.rulesetTypeId)
      );
    });

    it('Fails if there are no rulesets in the given ruleset type', async () => {
      await expect(RulesService.getActiveRuleset(admin, emptyRulesetType.rulesetTypeId, organization)).rejects.toThrow(
        new NotFoundException('Active Ruleset for given Ruleset Type', emptyRulesetType.rulesetTypeId)
      );
    });

    it('Successfully gets the active ruleset for a ruleset type', async () => {
      await setupRules(await createUniqueCar(orgId));

      const activeRuleset = await RulesService.getActiveRuleset(admin, fsaeRulesetType.rulesetTypeId, organization);
      expect(activeRuleset).toBeDefined();
      if (Array.isArray(activeRuleset)) {
        throw new Error('Expected a single active ruleset, but got an array');
      }

      expect(activeRuleset.name).toBe('FSAE Rules 2025');
      expect(activeRuleset.active).toBe(true);
    });

    it('Fails if the given carNumber does not exist in the org', async () => {
      await setupRules(await createUniqueCar(orgId));

      await expect(RulesService.getActiveRuleset(admin, fsaeRulesetType.rulesetTypeId, organization, 999)).rejects.toThrow(
        new NotFoundException('Car', 999)
      );
    });

    it('Scopes the active ruleset to the given car when multiple cars each have their own active ruleset', async () => {
      // fsaeRulesetType contains two active ruleset, one for carA one for carB
      const carA = await createUniqueCar(orgId);
      const carB = await createUniqueCar(orgId);
      await setupRules(carA);
      await setupRules(carB);

      // fetching carA's active ruleset returns carA's, not carB's, even though both are active for the same ruleset type
      const activeRulesetForCarA = await RulesService.getActiveRuleset(
        admin,
        fsaeRulesetType.rulesetTypeId,
        organization,
        carA.wbsElement.carNumber
      );
      expect(activeRulesetForCarA.car.carId).toBe(carA.carId);

      // asking for carB's active ruleset must return carB's, not carA's
      const activeRulesetForCarB = await RulesService.getActiveRuleset(
        admin,
        fsaeRulesetType.rulesetTypeId,
        organization,
        carB.wbsElement.carNumber
      );
      expect(activeRulesetForCarB.car.carId).toBe(carB.carId);
    });
  });

  describe('Toggle Rule Team', () => {
    it('Fails if user is a guest', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await expect(
        async () => await RulesService.toggleRuleTeam(topLevelRule.ruleId, '', guest, organization)
      ).rejects.toThrow(new AccessDeniedException('Only leadership and above can assign rules to teams'));
    });
    it('Fails if user is a member', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await expect(
        async () => await RulesService.toggleRuleTeam(topLevelRule.ruleId, '', nonLeadership, organization)
      ).rejects.toThrow(new AccessDeniedException('Only leadership and above can assign rules to teams'));
    });
    it('Fails if rule does not exist', async () => {
      await expect(async () => await RulesService.toggleRuleTeam('fake-rule-id', '', admin, organization)).rejects.toThrow(
        new NotFoundException('Rule', 'fake-rule-id')
      );
    });
    it('Fails if rule is deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await RulesService.deleteRule(topLevelRule.ruleId, admin, organization);
      await expect(
        async () => await RulesService.toggleRuleTeam(topLevelRule.ruleId, '', admin, organization)
      ).rejects.toThrow(new DeletedException('Rule', topLevelRule.ruleId));
    });
    it('Fails if a team does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await expect(
        async () => await RulesService.toggleRuleTeam(topLevelRule.ruleId, 'fake-team-id', admin, organization)
      ).rejects.toThrow(new NotFoundException('Team', 'fake-team-id'));
    });
    it('Fails if a team is not in the correct organization', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'Admin',
          email: 'testemail@hotmail.com',
          googleAuthId: 'orgCreator1'
        }
      });
      const org2 = await prisma.organization.create({
        data: {
          name: 'Joe mama',
          description: 'Joe mama`s organization',
          applicationLink: '',
          userCreated: {
            connect: {
              userId: user.userId
            }
          }
        }
      });
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const teamType = await createTestTeamType('electrical', org2.organizationId);
      const team = await createTestTeam(admin.userId, teamType.teamTypeId, org2.organizationId);
      await expect(RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, admin, organization)).rejects.toThrow(
        new InvalidOrganizationException('Rule')
      );
    });
    it('Fails if a team is archived', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const teamType = await createTestTeamType('electrical', organization.organizationId);
      const team = await createTestTeam(admin.userId, teamType.teamTypeId, organization.organizationId);
      await TeamsService.archiveTeam(admin, team.teamId, organization);
      await expect(RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, admin, organization)).rejects.toThrow(
        new HttpException(400, 'Cannot toggle an archived team.')
      );
    });
    it('Successfully adds a team to a rule', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const teamType = await createTestTeamType('electrical', organization.organizationId);
      const team = await createTestTeam(admin.userId, teamType.teamTypeId, organization.organizationId);
      const updRule = await RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, admin, organization);
      const ruleWithTeams = await prisma.rule.findUnique({
        where: { ruleId: topLevelRule.ruleId },
        include: { teams: true }
      });
      expect(updRule).toBeDefined();
      expect(ruleWithTeams?.teams.length).toBe(1);
      expect(ruleWithTeams?.teams[0].teamId).toBe(team.teamId);
    });
    it('Successfully removes a team from a rule', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const teamType = await createTestTeamType('electrical', organization.organizationId);
      const team = await createTestTeam(admin.userId, teamType.teamTypeId, organization.organizationId);
      const teamAddedRule = await RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, admin, organization);
      expect(teamAddedRule).toBeDefined();

      const teamRemovedRule = await RulesService.toggleRuleTeam(topLevelRule.ruleId, team.teamId, admin, organization);
      const ruleWithTeams = await prisma.rule.findUnique({
        where: { ruleId: topLevelRule.ruleId },
        include: { teams: true }
      });
      expect(teamRemovedRule).toBeDefined();
      expect(ruleWithTeams?.teams.length).toBe(0);
      expect(ruleWithTeams?.teams[0]).toBeUndefined();
    });
  });

  describe('Delete Project Rule', () => {
    it('Deletes a project rule successfully and returns the correct information', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1, topLevelRule } = await setupRules(car);
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      // every rule in the chain must be on the project's team for the leaf to be assignable
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, testTeam.teamId, admin, organization);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      const deletedProjectRule = await RulesService.deleteProjectRule(projectRule.projectRuleId, admin, organization);

      expect(deletedProjectRule).toBeDefined();
      expect(deletedProjectRule.projectRuleId).toBe(projectRule.projectRuleId);

      const found = await prisma.project_Rule.findUnique({ where: { projectRuleId: projectRule.projectRuleId } });
      expect(found?.dateDeleted).toBeDefined();
    });
    it('Delete project rule fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1, topLevelRule } = await setupRules(car);
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, testTeam.teamId, admin, organization);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      await expect(
        async () => await RulesService.deleteProjectRule(projectRule.projectRuleId, nonLeadership, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete project rules'));
    });
    it('Delete project rule fails if project rule was already deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1, topLevelRule } = await setupRules(car);
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, testTeam.teamId, admin, organization);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      await RulesService.deleteProjectRule(projectRule.projectRuleId, admin, organization);
      await expect(
        async () => await RulesService.deleteProjectRule(projectRule.projectRuleId, admin, organization)
      ).rejects.toThrow(new DeletedException('Project Rule', projectRule.projectRuleId));
    });
    it('Delete project rule fails if project rule does not exist', async () => {
      await expect(
        async () => await RulesService.deleteProjectRule('fake-project-rule-id', admin, organization)
      ).rejects.toThrow(new NotFoundException('Project Rule', 'fake-project-rule-id'));
    });
  });

  describe('Delete Ruleset Type', () => {
    it('Fails if user not an admin', async () => {
      await expect(async () => await RulesService.deleteRulesetType(nonLeadership, 'FSAE', organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete ruleset types')
      );
    });

    it('Fails if the ruleset type has already been deleted', async () => {
      const appAdmin = await createTestUser(batmanAppAdmin, orgId);
      await RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization);

      await expect(RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization)).rejects.toThrow(
        new DeletedException('Ruleset Type', fsaeRulesetType.rulesetTypeId)
      );
    });

    it('Successfully deletes the ruleset type', async () => {
      let rulesetTypes = await RulesService.getAllRulesetTypes(admin, organization);
      expect(rulesetTypes.length).toEqual(2);

      const appAdmin = await createTestUser(batmanAppAdmin, orgId);
      const result = await RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization);

      rulesetTypes = await RulesService.getAllRulesetTypes(admin, organization);

      expect(rulesetTypes.length).toEqual(1);

      expect(result.rulesetTypeId).toBe(fsaeRulesetType.rulesetTypeId);
    });

    it('Successfully deletes all revision files in revision files', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      const revFiles: Ruleset[] = [ruleset1];

      const fsaeRulesetType2WithRevisionFiles = await prisma.ruleset_Type.create({
        data: {
          name: 'FSAE2',
          createdBy: { connect: { userId: admin.userId } },
          organization: { connect: { organizationId: organization.organizationId } },
          revisionFiles: { connect: revFiles }
        }
      });

      let rulesets = await RulesService.getRulesetsByRulesetType(admin, fsaeRulesetType2WithRevisionFiles.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(1);
      await RulesService.deleteRulesetType(admin, fsaeRulesetType2WithRevisionFiles.rulesetTypeId, organization);
      rulesets = await RulesService.getRulesetsByRulesetType(admin, fsaeRulesetType2WithRevisionFiles.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(0);
    });
  });

  describe('Get unassigned Rules - unassigned to project', () => {
    it('fails if ruleset is in the wrong org', async () => {
      const car = await createUniqueCar(orgId);
      const otherOrgRulesetType = await prisma.ruleset_Type.create({
        data: {
          name: 'Other Org FHE',
          createdByUserId: admin.userId,
          organizationId: otherOrg.organizationId
        }
      });
      const otherRuleset: Ruleset = await prisma.ruleset.create({
        data: {
          name: '2024',
          fileId: 'other-fhe-2024',
          active: true,
          rulesetTypeId: otherOrgRulesetType.rulesetTypeId,
          carId: car.carId,
          createdByUserId: admin.userId
        }
      });
      await expect(
        RulesService.getUnassignedRulesForProjectRuleset(admin, 
          otherRuleset.rulesetId,
          project.projectId,
          organization.organizationId
        )
      ).rejects.toThrow(InvalidOrganizationException);
    });
    it('fails if project is in the wrong org', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      const otherOrgProject = await createTestProject(admin, otherOrg.organizationId);
      await expect(
        RulesService.getUnassignedRulesForProjectRuleset(admin, 
          ruleset1.rulesetId,
          otherOrgProject.projectId,
          organization.organizationId
        )
      ).rejects.toThrow(InvalidOrganizationException);
    });
    it('fails if ruleset does not exist', async () => {
      await expect(
        RulesService.getUnassignedRulesForProjectRuleset(admin, 
          'nonexistent-ruleset-id',
          project.projectId,
          organization.organizationId
        )
      ).rejects.toThrow(new NotFoundException('Ruleset', 'nonexistent-ruleset-id'));
    });
    it('fails if project does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      await expect(
        RulesService.getUnassignedRulesForProjectRuleset(admin, ruleset1.rulesetId, 'fake-project-id', organization.organizationId)
      ).rejects.toThrow(new NotFoundException('Project', 'fake-project-id'));
    });
    it("successfully returns rules on the project's teams that are not already assigned to the project", async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);
      // the project belongs to the team, so rules on that team are candidates
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      // add rules to the project's team
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, testTeam.teamId, admin, organization);
      // rule on the project's team that is already assigned to the project
      const ruleWithProject = await prisma.rule.create({
        data: {
          ruleCode: 'T.1.3',
          ruleContent: 'Rule with project',
          imageFileIds: [],
          rulesetId: ruleset1.rulesetId,
          createdByUserId: admin.userId
        }
      });
      await RulesService.toggleRuleTeam(ruleWithProject.ruleId, testTeam.teamId, admin, organization);
      await prisma.project_Rule.create({
        data: {
          projectId: project.projectId,
          ruleId: ruleWithProject.ruleId,
          createdByUserId: admin.userId
        }
      });
      const rules = await RulesService.getUnassignedRulesForProjectRuleset(admin, 
        ruleset1.rulesetId,
        project.projectId,
        organization.organizationId
      );
      expect(rules.length).toEqual(2);
      expect(rules[0].ruleCode).toEqual('T');
      expect(rules[1].ruleCode).toEqual('T2');
      // leafRule2 is not on any of the project's teams so should not be returned
      expect(rules.find((r) => r.ruleCode === leafRule2.ruleCode)).toBeUndefined();
      // ruleWithProject is already assigned to the project so should not be returned
      expect(rules.find((r) => r.ruleCode === ruleWithProject.ruleCode)).toBeUndefined();
    });
    it('returns rules from any of the project`s teams when it belongs to multiple', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);

      // a second team the project also belongs to
      const teamType = await createTestTeamType('secondTeamType', orgId);
      const secondTeam = await createTestTeam(admin.userId, teamType.teamTypeId, orgId);

      // project belongs to both testTeam and secondTeam
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await ProjectsService.setProjectTeam(
        admin,
        { carNumber: car.wbsElement.carNumber, projectNumber: 1, workPackageNumber: 0 },
        secondTeam.teamId,
        organization
      );

      // topLevelRule on the first team, leafRule1 on the second team - both should be returned
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      await RulesService.toggleRuleTeam(leafRule1.ruleId, secondTeam.teamId, admin, organization);

      const rules = await RulesService.getUnassignedRulesForProjectRuleset(admin, 
        ruleset1.rulesetId,
        project.projectId,
        organization.organizationId
      );
      expect(rules.map((r) => r.ruleId)).toContain(topLevelRule.ruleId);
      expect(rules.map((r) => r.ruleId)).toContain(leafRule1.ruleId);
      // leafRule2 has no team so it should not be returned
      expect(rules.map((r) => r.ruleId)).not.toContain(leafRule2.ruleId);
    });
    it("successfully returns empty if the project's teams have no assignable rules", async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      const rules = await RulesService.getUnassignedRulesForProjectRuleset(admin, 
        ruleset1.rulesetId,
        project.projectId,
        organization.organizationId
      );
      expect(rules).toEqual([]);
    });
  });

  describe('Get Project Rules', () => {
    it('Successfully gets all project rules for a project', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const project = await createTestProject(admin, orgId, testTeam.teamId, car.carId, car.wbsElement.carNumber);
      await RulesService.toggleRuleTeam(topLevelRule.ruleId, testTeam.teamId, admin, organization);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      const projectRules = await RulesService.getProjectRules(admin, topLevelRule.rulesetId, projectRule.projectId, organization);

      expect(projectRules.length).toBe(1);
      expect(projectRules[0].projectRuleId).toBe(projectRule.projectRuleId);
      expect(projectRules[0].rule.ruleId).toBe(topLevelRule.ruleId);
    });

    it('Get project rules returns empty array if no project rules exist for the project', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      const projectRules = await RulesService.getProjectRules(admin, topLevelRule.rulesetId, project.projectId, organization);
      expect(projectRules.length).toBe(0);
    });

    it('Get project rules fails if project is deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: {
          wbsElement: {
            update: { dateDeleted: new Date() }
          }
        }
      });

      await expect(
        async () => await RulesService.getProjectRules(admin, topLevelRule.rulesetId, project.projectId, organization)
      ).rejects.toThrow(new DeletedException('Project', project.projectId));
    });

    it('Get project rules fails if ruleset does not exist', async () => {
      await expect(
        async () => await RulesService.getProjectRules(admin, 'fake-ruleset-id', project.projectId, organization)
      ).rejects.toThrow(new NotFoundException('Ruleset', 'fake-ruleset-id'));
    });

    it('Get project rules fails if project does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      await expect(
        async () => await RulesService.getProjectRules(admin, topLevelRule.rulesetId, 'fake-project-id', organization)
      ).rejects.toThrow(new NotFoundException('Project', 'fake-project-id'));
    });

    it('Get project rules fails if ruleset is deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await prisma.ruleset.update({
        where: { rulesetId: topLevelRule.rulesetId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: admin.userId } } }
      });

      await expect(
        async () => await RulesService.getProjectRules(admin, topLevelRule.rulesetId, project.projectId, organization)
      ).rejects.toThrow(new DeletedException('Ruleset', topLevelRule.rulesetId));
    });
  });

  describe('Get Top Level Rules', () => {
    it('Fails if user is a guest', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await expect(RulesService.getTopLevelRules(guest, ruleset1.rulesetId, organization.organizationId)).rejects.toThrow(
        new AccessDeniedGuestException('view rules')
      );
    });

    it('Successful get all rules with no parent id', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule } = await setupRules(car);

      const rules = await RulesService.getTopLevelRules(admin, ruleset1.rulesetId, organization.organizationId);

      expect(rules.length).toEqual(3);
      expect(rules.map((r) => r.ruleCode).sort()).toEqual(['A2', 'B2', 'T']);
      expect(rules.find((r) => r.ruleId === topLevelRule.ruleId)?.ruleCode).toEqual('T');
    });

    it('Gets multiple top level rules', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      await prisma.rule.create({
        data: {
          ruleCode: 'A',
          ruleContent: 'PART A - ADMINISTRATIVE REQUIREMENTS',
          imageFileIds: [],
          dateCreated: new Date(),
          ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
          createdBy: { connect: { userId: admin.userId } }
        }
      });

      const rules = await RulesService.getTopLevelRules(admin, ruleset1.rulesetId, organization.organizationId);

      expect(rules.length).toEqual(4);
      expect(rules.map((r) => r.ruleCode).sort()).toEqual(['A', 'A2', 'B2', 'T']);
    });

    it('Returns empty array when no top level rules exist', async () => {
      const car = await createUniqueCar(orgId);
      const ruleset = await prisma.ruleset.create({
        data: {
          name: 'Empty Ruleset',
          fileId: 'empty-ruleset',
          active: true,
          dateCreated: new Date(),
          car: { connect: { carId: car.carId } },
          createdBy: { connect: { userId: admin.userId } },
          rulesetType: { connect: { rulesetTypeId: fsaeRulesetType.rulesetTypeId } }
        }
      });

      const rules = await RulesService.getTopLevelRules(admin, ruleset.rulesetId, organization.organizationId);
      expect(rules.length).toEqual(0);
    });

    it('Does not return child rules', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);
      const rules = await RulesService.getTopLevelRules(admin, ruleset1.rulesetId, organization.organizationId);

      expect(rules.length).toEqual(3);
      expect(rules.find((r) => r.ruleId === topLevelRule.ruleId)).toBeDefined();
      expect(rules.find((r) => r.ruleId === leafRule1.ruleId)).toBeUndefined();
      expect(rules.find((r) => r.ruleId === leafRule2.ruleId)).toBeUndefined();
    });

    it('Does not return deleted top level rules', async () => {
      const carr = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule } = await setupRules(carr);

      await prisma.rule.update({
        where: { ruleId: topLevelRule.ruleId },
        data: {
          dateDeleted: new Date(),
          deletedByUserId: admin.userId
        }
      });

      const rules = await RulesService.getTopLevelRules(admin, ruleset1.rulesetId, organization.organizationId);
      expect(rules.find((r) => r.ruleId === topLevelRule.ruleId)).toBeUndefined();
    });
  });

  describe('Get All Rules For Ruleset', () => {
    it('Fails if user is a guest', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await expect(
        RulesService.getAllRulesForRuleset(guest, ruleset1.rulesetId, organization.organizationId)
      ).rejects.toThrow(new AccessDeniedGuestException('view rules'));
    });

    it('Successfully gets every rule in a ruleset, including children', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2, referencedRule, referencingRule } = await setupRules(car);

      const rules = await RulesService.getAllRulesForRuleset(admin, ruleset1.rulesetId, organization.organizationId);

      expect(rules.length).toEqual(5);
      const ruleIds = rules.map((r) => r.ruleId);
      expect(ruleIds).toContain(topLevelRule.ruleId);
      expect(ruleIds).toContain(leafRule1.ruleId);
      expect(ruleIds).toContain(leafRule2.ruleId);
      expect(ruleIds).toContain(referencedRule.ruleId);
      expect(ruleIds).toContain(referencingRule.ruleId);
    });

    it('Returns parent/subRuleIds correctly for rules at every depth', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);

      const rules = await RulesService.getAllRulesForRuleset(admin, ruleset1.rulesetId, organization.organizationId);

      const topRule = rules.find((r) => r.ruleId === topLevelRule.ruleId);
      const leaf1 = rules.find((r) => r.ruleId === leafRule1.ruleId);
      const leaf2 = rules.find((r) => r.ruleId === leafRule2.ruleId);

      expect(topRule?.parentRule).toBeUndefined();
      expect(topRule?.subRuleIds).toContain(leafRule1.ruleId);
      expect(topRule?.subRuleIds).toContain(leafRule2.ruleId);

      expect(leaf1?.parentRule?.ruleId).toBe(topLevelRule.ruleId);
      expect(leaf2?.parentRule?.ruleId).toBe(topLevelRule.ruleId);
    });

    it('Does not return rules from a different ruleset', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, ruleset2, topLevelRule } = await setupRules(car);

      const otherRule = await prisma.rule.create({
        data: {
          ruleCode: 'Z',
          ruleContent: 'Different ruleset rule',
          imageFileIds: [],
          ruleset: { connect: { rulesetId: ruleset2.rulesetId } },
          createdBy: { connect: { userId: admin.userId } }
        }
      });

      const rules = await RulesService.getAllRulesForRuleset(admin, ruleset1.rulesetId, organization.organizationId);

      expect(rules.find((r) => r.ruleId === topLevelRule.ruleId)).toBeDefined();
      expect(rules.find((r) => r.ruleId === otherRule.ruleId)).toBeUndefined();
    });

    it('Does not return deleted rules', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, leafRule1 } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: leafRule1.ruleId },
        data: { dateDeleted: new Date(), deletedByUserId: admin.userId }
      });

      const rules = await RulesService.getAllRulesForRuleset(admin, ruleset1.rulesetId, organization.organizationId);
      expect(rules.find((r) => r.ruleId === leafRule1.ruleId)).toBeUndefined();
    });

    it('Returns rules ordered by ruleCode ascending', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      const rules = await RulesService.getAllRulesForRuleset(admin, ruleset1.rulesetId, organization.organizationId);

      for (let i = 0; i < rules.length - 1; i++) {
        expect(rules[i].ruleCode <= rules[i + 1].ruleCode).toBe(true);
      }
    });

    it('Returns an empty array when the ruleset has no rules', async () => {
      const car = await createUniqueCar(orgId);
      const ruleset = await prisma.ruleset.create({
        data: {
          name: 'Empty Ruleset',
          fileId: 'empty-ruleset-all',
          active: true,
          car: { connect: { carId: car.carId } },
          createdBy: { connect: { userId: admin.userId } },
          rulesetType: { connect: { rulesetTypeId: fsaeRulesetType.rulesetTypeId } }
        }
      });

      const rules = await RulesService.getAllRulesForRuleset(admin, ruleset.rulesetId, organization.organizationId);
      expect(rules.length).toEqual(0);
    });

    it('Fails when ruleset does not exist', async () => {
      await expect(RulesService.getAllRulesForRuleset(admin, 'fake-ruleset-id', organization.organizationId)).rejects.toThrow(
        new NotFoundException('Ruleset', 'fake-ruleset-id')
      );
    });

    it('Fails when ruleset is deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await prisma.ruleset.update({
        where: { rulesetId: ruleset1.rulesetId },
        data: { active: false }
      });
      await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);

      await expect(RulesService.getAllRulesForRuleset(admin, ruleset1.rulesetId, organization.organizationId)).rejects.toThrow(
        new DeletedException('Ruleset', ruleset1.rulesetId)
      );
    });

    it('Fails if ruleset is in the wrong org', async () => {
      const car = await createUniqueCar(orgId);
      const otherOrgRulesetType = await prisma.ruleset_Type.create({
        data: {
          name: 'Other Org FHE',
          createdByUserId: admin.userId,
          organizationId: otherOrg.organizationId
        }
      });
      const otherRuleset = await prisma.ruleset.create({
        data: {
          name: '2024',
          fileId: 'other-fhe-2024-all-rules',
          active: true,
          rulesetTypeId: otherOrgRulesetType.rulesetTypeId,
          carId: car.carId,
          createdByUserId: admin.userId
        }
      });

      await expect(
        RulesService.getAllRulesForRuleset(admin, otherRuleset.rulesetId, organization.organizationId)
      ).rejects.toThrow(InvalidOrganizationException);
    });
  });

  describe('Get Ruleset Type', () => {
    it('Successfully gets a ruleset type by ID', async () => {
      const rulesetType = await RulesService.getRulesetType(admin, fsaeRulesetType.rulesetTypeId, organization.organizationId);
      expect(rulesetType).toBeDefined();
      expect(rulesetType.rulesetTypeId).toBe(fsaeRulesetType.rulesetTypeId);
      expect(rulesetType.name).toBe(fsaeRulesetType.name);
    });
  });

  describe('Referenced rule tests', () => {
    it('Successfully deletes a referenced rule', async () => {
      const car = await createUniqueCar(orgId);
      const { referencedRule, referencingRule } = await setupRules(car);
      const rule = await RulesService.removeRuleReferences(
        admin,
        referencingRule.ruleId,
        referencedRule.ruleId,
        organization
      );
      expect(rule.ruleId).toBe(referencingRule.ruleId);
      expect(rule.referencedRules.length).toEqual(0);
    });

    it('Successfully adds a referenced rule', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule, referencedRule } = await setupRules(car);
      const rule = await RulesService.addRuleReferences(admin, topLevelRule.ruleId, referencedRule.ruleId, organization);
      expect(rule.ruleId).toBe(topLevelRule.ruleId);
      expect(rule.referencedRules.length).toEqual(1);
    });

    it('Successfully adds multiple referenced rules', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule, leafRule1, referencedRule } = await setupRules(car);
      await RulesService.addRuleReferences(admin, topLevelRule.ruleId, referencedRule.ruleId, organization);
      const rule = await RulesService.addRuleReferences(admin, topLevelRule.ruleId, leafRule1.ruleId, organization);
      expect(rule.ruleId).toBe(topLevelRule.ruleId);
      expect(rule.referencedRules.length).toEqual(2);
      expect(rule.referencedRules.map((r) => r.ruleId)).toEqual(
        expect.arrayContaining([referencedRule.ruleId, leafRule1.ruleId])
      );
    });

    it('Fails adding referenced rule if user is not admin', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule, referencedRule } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.addRuleReferences(nonLeadership, topLevelRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a rule'));
    });

    it('Fails adding referenced rule if rule does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { referencedRule } = await setupRules(car);
      await expect(
        async () => await RulesService.addRuleReferences(admin, 'fake-rule-id', referencedRule.ruleId, organization)
      ).rejects.toThrow(new NotFoundException('Rule', 'fake-rule-id'));
    });

    it('Fails adding referenced rule if rule is not in the correct organization', async () => {
      const otherCar = await createUniqueCar(otherOrg.organizationId);
      const { topLevelRule: otherOrgRule, referencedRule } = await setupRules(otherCar);
      await expect(
        async () => await RulesService.addRuleReferences(admin, otherOrgRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new InvalidOrganizationException('Rule'));
    });

    it('Fails adding referenced rule if rule was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule, referencedRule } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: topLevelRule.ruleId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () => await RulesService.addRuleReferences(admin, topLevelRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new DeletedException('Rule', topLevelRule.ruleId));
    });

    it('Fails adding referenced rule if referenced rule was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule, referencedRule } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: referencedRule.ruleId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () => await RulesService.addRuleReferences(admin, topLevelRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new DeletedException('Referenced Rule', referencedRule.ruleId));
    });

    it('Fails adding referenced rule if referenced rule does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await expect(
        async () => await RulesService.addRuleReferences(admin, topLevelRule.ruleId, 'fake-rule-id', organization)
      ).rejects.toThrow(new NotFoundException('Referenced Rule', 'fake-rule-id'));
    });

    it('Fails adding referenced rule if referenced rule is in a different ruleset', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule, ruleset2 } = await setupRules(car);
      const otherRulesetRule = await prisma.rule.create({
        data: {
          ruleCode: 'X1',
          ruleContent: 'Rule in a different ruleset',
          imageFileIds: [],
          dateCreated: new Date(),
          ruleset: { connect: { rulesetId: ruleset2.rulesetId } },
          createdBy: { connect: { userId: admin.userId } }
        }
      });
      await expect(
        async () => await RulesService.addRuleReferences(admin, topLevelRule.ruleId, otherRulesetRule.ruleId, organization)
      ).rejects.toThrow(new NotFoundException('Referenced Rule', otherRulesetRule.ruleId));
    });

    it('Fails adding referenced rule if referencing itself', async () => {
      const car = await createUniqueCar(orgId);
      const { referencingRule } = await setupRules(car);
      await expect(
        async () => await RulesService.addRuleReferences(admin, referencingRule.ruleId, referencingRule.ruleId, organization)
      ).rejects.toThrow(new HttpException(400, 'A rule cannot reference itself'));
    });

    it('Fails removing referenced rule if user is not admin', async () => {
      const car = await createUniqueCar(orgId);
      const { referencedRule, referencingRule } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.removeRuleReferences(nonLeadership, referencingRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a rule'));
    });

    it('Fails removing referenced rule if rule does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { referencedRule } = await setupRules(car);
      await expect(
        async () => await RulesService.removeRuleReferences(admin, 'fake-rule-id', referencedRule.ruleId, organization)
      ).rejects.toThrow(new NotFoundException('Rule', 'fake-rule-id'));
    });

    it('Fails removing referenced rule if rule was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { referencedRule, referencingRule } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: referencingRule.ruleId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () =>
          await RulesService.removeRuleReferences(admin, referencingRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new DeletedException('Rule', referencingRule.ruleId));
    });

    it('Fails removing referenced rule if rule is not in the correct organization', async () => {
      const otherCar = await createUniqueCar(otherOrg.organizationId);
      const { topLevelRule: otherOrgRule, referencedRule } = await setupRules(otherCar);
      await expect(
        async () => await RulesService.removeRuleReferences(admin, otherOrgRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new InvalidOrganizationException('Rule'));
    });

    it('Fails removing referenced rule if referenced rule does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { referencingRule } = await setupRules(car);
      await expect(
        async () => await RulesService.removeRuleReferences(admin, referencingRule.ruleId, 'fake-rule-id', organization)
      ).rejects.toThrow(new NotFoundException('Referenced Rule', 'fake-rule-id'));
    });

    it('Fails removing referenced rule if referenced rule was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { referencedRule, referencingRule } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: referencedRule.ruleId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () =>
          await RulesService.removeRuleReferences(admin, referencingRule.ruleId, referencedRule.ruleId, organization)
      ).rejects.toThrow(new DeletedException('Referenced Rule', referencedRule.ruleId));
    });
  });
});

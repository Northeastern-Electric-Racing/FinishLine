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

describe('Rules Tests', () => {
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

  describe('Edit Rule', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await RulesService.editRule(
            await createTestUser(wonderwomanGuest, orgId),
            'Some rule content',
            rule.ruleId,
            rule.ruleCode,
            ['newfile'],
            'noparent',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a rule'));
    });

    it('Fails if rule doesn`t exist', async () => {
      await expect(
        async () =>
          await RulesService.editRule(
            await createTestUser(batmanAppAdmin, orgId),
            'Some more rule content',
            '1',
            rule.ruleCode,
            ['samefile'],
            'noparent',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Rule', 1));
    });

    it('Succeeds and edits a rule', async () => {
      const updatedRule = await RulesService.editRule(
        user,
        'BRAND NEW RULE CONTENT',
        rule.ruleId,
        rule.ruleCode,
        rule.imageFileIds,
        'noparent',
        organization
      );

      expect(updatedRule.ruleContent).toEqual('BRAND NEW RULE CONTENT');
    });
  });
});

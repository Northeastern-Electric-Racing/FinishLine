import RulesService from '../../src/services/rules.services';
import { Organization, User, Project, Car, Ruleset_Type, Rule_Completion } from '@prisma/client';
import { supermanAdmin, financeMember, wonderwomanGuest, batmanAppAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException,
  AccessDeniedAdminOnlyException
} from '../../src/utils/errors.utils';

describe('Rule Tests', () => {
  let orgId: string;
  let organization: Organization;
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
        createdBy: { connect: { userId: admin.userId } }
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
  });

  describe('Edit Rule', () => {
    it('Fails if user is not an admin', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.editRule(
            await createTestUser(wonderwomanGuest, orgId),
            'Some rule content',
            topLevelRule.ruleId,
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
            organization
          )
      ).rejects.toThrow(new NotFoundException('Rule', 1));
    });

    it('Succeeds and edits a rule', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);

      const updatedRule = await RulesService.editRule(admin, 'BRAND NEW RULE CONTENT', topLevelRule.ruleId, organization);

      expect(updatedRule.ruleContent).toEqual('BRAND NEW RULE CONTENT');
    });
  });
});

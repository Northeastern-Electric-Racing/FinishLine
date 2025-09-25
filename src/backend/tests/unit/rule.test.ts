import RulesService from '../../src/services/rules.services';
import { Organization, User, Ruleset, Project, Rule } from '@prisma/client';
import { supermanAdmin, financeMember } from '../test-data/users.test-data';
import { createTestCar, createTestOrganization, createTestProject, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { RuleCompletion } from 'shared';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../../src/utils/errors.utils';

describe('Rule Tests', () => {
  let organization: Organization;
  let admin: User;
  let nonLeadership: User;
  let project: Project;
  let ruleset1: Ruleset;
  let topLevelRule: Rule;
  let leafRule1: Rule;
  let leafRule2: Rule;

  beforeEach(async () => {
    organization = await createTestOrganization();
    admin = await createTestUser(supermanAdmin, organization.organizationId);
    nonLeadership = await createTestUser(financeMember, organization.organizationId);

    project = await createTestProject(admin, organization.organizationId);

    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });

    const car = await createTestCar(organization.organizationId, admin.userId);

    const fsaeRulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE',
        createdBy: { connect: { userId: admin.userId } }
      }
    });

    ruleset1 = await prisma.ruleset.create({
      data: {
        name: 'FSAE Rules 2025',
        fileId: 'fsae-rules-2025',
        active: true,
        dateCreated: new Date('2025-01-01T10:00:00Z'),
        car: { connect: { carId: car.carId } },
        createdBy: { connect: { userId: admin.userId } },
        rulesetType: { connect: { rulesetTypeId: fsaeRulesetType.rulesetTypeId } }
      }
    });

    topLevelRule = await prisma.rule.create({
      data: {
        ruleCode: 'T',
        ruleContent: 'PART T - GENERAL TECHNICAL REQUIREMENTS',
        imageFileIds: [],
        dateCreated: new Date('2025-09-01T10:00:00Z'),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } }
      }
    });

    leafRule1 = await prisma.rule.create({
      data: {
        ruleCode: 'T2',
        ruleContent:
          'The vehicle must be open-wheeled and open-cockpit (a formula style body) with four (4) wheels that are not in a straight line.',
        imageFileIds: [],
        dateCreated: new Date('2025-09-01T10:00:00Z'),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        parentRule: { connect: { ruleId: topLevelRule.ruleId } }
      }
    });

    leafRule2 = await prisma.rule.create({
      data: {
        ruleCode: 'T2.1',
        ruleContent: 'T2.1 Vehicle Configuration',
        imageFileIds: [],
        dateCreated: new Date('2025-09-01T10:00:00Z'),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        parentRule: { connect: { ruleId: topLevelRule.ruleId } }
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Project Rule endpoints', () => {
    it('Creates a project rule successfully', async () => {
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);
      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(leafRule1.ruleId);
      expect(projectRule.rule.ruleCode).toBe(leafRule1.ruleCode);
      expect(projectRule.rule.ruleset.rulesetId).toBe(ruleset1.rulesetId);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(RuleCompletion.REVIEW);
    });
    it('Create project rule fails if user does not have permission', async () => {
      await expect(
        async () => await RulesService.createProjectRule(nonLeadership, organization, leafRule1.ruleId, project.projectId)
      ).rejects.toThrow(new AccessDeniedException('Only heads and above can create project rules'));
    });
    it('Create project rule fails if rule has sub rules', async () => {
      await expect(
        async () =>
          await RulesService.createProjectRule(
            admin,
            organization,
            topLevelRule.ruleId, //not leaf
            project.projectId
          )
      ).rejects.toThrow(new HttpException(400, 'Cannot add rules with sub-rules to projects'));
    });
    it('Create project rule fails if rule was deleted', async () => {
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
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, 'fake-project-id')).rejects.toThrow(
        new NotFoundException('Project', 'fake-project-id')
      );
    });
    it('Create project rule fails if project rule is in different organization', async () => {
      const otherOrganization = await createTestOrganization();
      await expect(
        RulesService.createProjectRule(admin, otherOrganization, leafRule1.ruleId, project.projectId)
      ).rejects.toThrow(InvalidOrganizationException);
    });
    it('Create project rule fails if project is in different organization', async () => {
      const otherOrganization = await createTestOrganization();
      const otherProject = await createTestProject(admin, otherOrganization.organizationId);
      await expect(
        RulesService.createProjectRule(
          admin,
          organization,
          leafRule1.ruleId,
          otherProject.projectId // Project from different organization
        )
      ).rejects.toThrow(new InvalidOrganizationException('Project'));
    });
    it('Create project rule fails if project rule assignment already exists', async () => {
      await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId)).rejects.toThrow(
        new HttpException(400, 'This rule is already associated with the project')
      );
    });
  });
});

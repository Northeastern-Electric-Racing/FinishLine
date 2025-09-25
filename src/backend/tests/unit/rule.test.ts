// tests go below here

import RulesService from '../../src/services/rules.services';
import { aquamanLeadership, supermanAdmin, financeMember } from '../test-data/users.test-data';

describe('Rule Tests', () => {
  beforeEach(async () => {
    organization = await createTestOrganization();
    admin = await createTestUser(supermanAdmin, organization.organizationId);
    nonAdmin = await createTestUser(aquamanLeadership, orgId);
    nonLeadership = await createTestUser(financeMember, orgId);
    ruleset = leafRule = topLevelRule = await createTestRule();

    orgId = organization.organizationId;

    project = await createTestProject(batman, orgId);
    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('project rule endpoints', () => {
    it('Creates a project rule', async () => {
      const projectRule = await RulesService.createProjectRule(
        admin,
        orgId,
        leafRule.ruleId,
        project.projectId
      );
      expect(projectRule.ruleId).toBe('?');
      expect(projectRule.ruleId).toBe('?')
      expect(projectRule.ruleId).toBe('?')
      expect(projectRule.ruleId).toBe('?')
    });
    it('Create project rule fails if user does not have permission', async () => {
      await expect(async () => await RulesService.createProjectRule(
        nonLeadership,
        orgId,
        leafRule.ruleId,
        project.projectId
      )).not.toThrow();
      )).rejects.toThrow(
        new AccessDeniedException('Only heads and above can create project rules')
      );
    });
    it('Create project rule fails if rule has sub rules', async () => {
      await expect(async () => await RulesService.createProjectRule(
        admin,
        orgId,
        leafRule.ruleId, // not leaf
        project.projectId
      )).rejects.toThrow();
    });
    it('Create project rule fails if rule does not exist', async () => {
      await expect(async () => await RulesService.createProjectRule()).rejects.toThrow();
    });
    it('Create project rule fails if rule was deleted', async () => {
      await expect(async () => await RulesService.createProjectRule()).rejects.toThrow();
    });
    it('Create project rule fails if project does not exist', async () => {
      await expect(async () => await RulesService.createProjectRule()).rejects.toThrow();
    });
    it('Create project rule fails if project was deleted', async () => {
      await expect(async () => await RulesService.createProjectRule()).rejects.toThrow();
    });
    it('Create project rule fails if this rule is already assigned to this project', async () => {
      await expect(async () => await RulesService.createProjectRule()).rejects.toThrow();
    });
  });
});

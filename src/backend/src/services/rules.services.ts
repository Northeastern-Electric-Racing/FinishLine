import { ProjectRule, isLeadership, RuleCompletion } from 'shared';
import { userHasPermission } from '../utils/users.utils';
import {
  AccessDeniedException,
  NotFoundException,
  HttpException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import { projectRuleTransformer } from '../transformers/rules.transformer';
import { getProjectRuleQueryArgs } from '../prisma-query-args/rules.query-args';
import { Organization, User } from '@prisma/client';

export default class RulesService {
  /**
   * Creates new ruleset type with the given information
   * @param submitter a user who is making this request
   * @param name the name of the ruleset type
   * @param organizationId the organization ID for permission check
   * @returns A newly created ruleset type
   */
  static async createRulesetType(submitter: User, name: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('only leadership and above can create ruleset types!');

    const rulesetType = await prisma.ruleset_Type.create({
      data: {
        name,
        createdByUserId: submitter.userId
      }
    });

    return rulesetType;
  }

  /**
   * Add a preexisting rule to a specific project
   *
   * @param submitter The user creating the project rule
   * @param organization The organization the project rule is being created in
   * @param ruleId The rule ID being added to the project
   * @param projectId The project ID to add the rule to
   * @returns The created project rule
   */
  static async createProjectRule(
    submitter: User,
    organization: Organization,
    ruleId: string,
    projectId: string
  ): Promise<ProjectRule> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to assign rules to projects');
    }

    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        subRules: true,
        ruleset: { select: { car: { include: { wbsElement: { select: { organizationId: true } } } } } }
      }
    });

    if (!rule) {
      throw new NotFoundException('Rule', ruleId);
    }
    if (rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);

    const project = await prisma.project.findUnique({
      where: { projectId },
      include: { wbsElement: true }
    });

    if (!project) {
      throw new NotFoundException('Project', projectId);
    }
    if (project.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project');
    }

    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);

    // Checks if this rule was already assigned to this project
    const existingProjectRule = await prisma.project_Rule.findUnique({
      where: { ruleId_projectId: { ruleId, projectId } }
    });

    if (existingProjectRule) {
      throw new HttpException(400, 'This rule is already associated with the project');
    }

    const projectRule = await prisma.project_Rule.create({
      data: { ruleId, projectId, currentStatus: RuleCompletion.REVIEW },
      ...getProjectRuleQueryArgs()
    });

    return projectRuleTransformer(projectRule);
  }

  /**
   * Updates the status of a project rule
   * Such as changing a project rule from INCOMPLETE to COMPLETE
   * @param submitter the user updating the status
   * @param organization the organization of the rule
   * @param projectRuleId the id of the project rule to update
   * @param newStatus the new status of the project rule
   * @returns the project rule with updated status
   */
  static async editProjectRuleStatus(
    submitter: User,
    organization: Organization,
    projectRuleId: string,
    newStatus: RuleCompletion
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to update a project rule status');
    }

    const projectRule = await prisma.project_Rule.findUnique({
      where: { projectRuleId },
      include: { rule: { include: { ruleset: { include: { car: { include: { wbsElement: true } } } } } } }
    });

    if (!projectRule) {
      throw new NotFoundException('Project Rule', projectRuleId);
    }

    if (projectRule.rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project Rule');
    }

    if (projectRule.dateDeleted) throw new DeletedException('Project Rule', projectRuleId);

    const newStatusHistory = {
      projectRuleId: projectRuleId,
      userUpdatedId: submitter.userId,
      updatedAt: new Date(),
      newStatus: projectRule.newStatus,
      note: `${submitter.firstName} ${submitter.lastName} marked as ${newStatus}`
    };

    const updatedProjectRule = await prisma.project_Rule.update({
      where: { projectRuleId },
      data: { currentStatus: newStatus, statusHistory: { create: newStatusHistory } },
      ...getProjectRuleQueryArgs()
    });

    return projectRuleTransformer(updatedProjectRule);
  }
}

import { ProjectRule, User, isLeadership, RuleCompletion } from 'shared';
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
import { Organization } from '@prisma/client';

/**
 * Add a preexisting rule to a specific project
 *
 * @param submitter The user creating the project rule
 * @param organization The organization the project rule is being created in
 * @param ruleId The rule ID being added to the project
 * @param projectId The project ID to add the rule to
 * @returns The created project rule
 */
export default class RulesService {
  static async createProjectRule(
    submitter: User,
    organization: Organization,
    ruleId: string,
    projectId: string
  ): Promise<ProjectRule> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permission to create a project rule');
    }

    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        subRules: true,
        ruleset: { include: { car: { include: { wbsElement: { select: { organizationId: true } } } } } }
      }
    });

    if (!rule) {
      throw new NotFoundException('Rule', ruleId);
    }
    if (rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    // must be leaf rule
    if (rule.subRules.length > 0) {
      throw new HttpException(400, 'Cannot add rules with sub-rules to projects');
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
}

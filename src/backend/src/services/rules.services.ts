import { Organization, Rule, User } from '@prisma/client';
import { isAdmin, isLeadership, ProjectRule, RuleCompletion } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

import { projectRuleTransformer, ruleTransformer, rulesetTransformer } from '../transformers/rules.transformer';
import { getProjectRuleQueryArgs, getRuleQueryArgs, getRulesetQueryArgs } from '../prisma-query-args/rules.query-args';

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
   * Deletes a rule
   * @param ruleId id of a rule to be deleted
   * @param deleter user deleting the rule
   * @param org the org of the user deleting the rule
   * @returns the deleted rule
   */
  static async deleteRule(ruleId: string, deleter: User, org: Organization): Promise<Rule> {
    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        ruleset: {
          include: {
            car: {
              include: {
                wbsElement: true
              }
            }
          }
        }
      }
    });

    if (!(await userHasPermission(deleter.userId, org.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete rules');
    }

    if (!rule) throw new NotFoundException('Rule', ruleId);
    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);

    if (rule.ruleset?.car?.wbsElement?.organizationId !== org.organizationId) throw new InvalidOrganizationException('Rule');

    await prisma.$transaction(async (tx) => {
      const deleteParentChildReferencing = async (currRuleId: string): Promise<void> => {
        const referencingRules = await tx.rule.findMany({
          where: {
            referencedRule: {
              some: { ruleId: currRuleId }
            },
            dateDeleted: null
          },
          select: { ruleId: true }
        });

        for (const referencingRule of referencingRules) {
          await tx.rule.update({
            where: { ruleId: referencingRule.ruleId },
            data: {
              referencedRule: {
                disconnect: { ruleId: currRuleId }
              }
            }
          });
        }

        const childRules = await tx.rule.findMany({
          where: {
            parentRuleId: currRuleId,
            dateDeleted: null
          }
        });
        for (const childRule of childRules) {
          await deleteParentChildReferencing(childRule.ruleId);
        }

        await tx.rule.update({
          where: { ruleId: currRuleId },
          data: {
            dateDeleted: new Date(),
            deletedByUserId: deleter.userId
          }
        });
      };

      await deleteParentChildReferencing(ruleId);
    });

    const deletedRule = await prisma.rule.findUnique({
      where: { ruleId }
    });

    return deletedRule!;
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
   * Edits a rule with the given id
   * @param submitter a user who is making this request
   * @param ruleContent the rule content to edit
   * @param ruleId The rule ID being edited
   * @param ruleCode The rule code to update
   * @param imageFileIds The image files to update
   * @param parentRuleId The parent rule ID to update
   * @param organizationId the organization Id
   * @returns the edited rule
   */
  static async editRule(
    submitter: User,
    ruleContent: string,
    ruleId: string,
    ruleCode: string,
    imageFileIds: string[],
    organization: Organization,
    parentRuleId?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit a rule');

    const currentRule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        ruleset: {
          include: {
            car: {
              include: {
                wbsElement: true
              }
            }
          }
        }
      }
    });

    if (!currentRule) {
      throw new NotFoundException('Rule', ruleId);
    }

    if (currentRule.dateDeleted) {
      throw new DeletedException('Rule', ruleId);
    }

    if (currentRule.ruleset?.car?.wbsElement?.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Rule');

    if (parentRuleId) {
      const parentRule = await prisma.rule.findUnique({
        where: { ruleId: parentRuleId }
      });

      if (!parentRule) {
        throw new NotFoundException('Parent Rule', parentRuleId);
      }

      if (parentRule.dateDeleted) {
        throw new DeletedException('Parent Rule', parentRuleId);
      }
    }

    const updatedRule = await prisma.rule.update({
      where: {
        ruleId
      },
      data: {
        ruleContent,
        ruleCode,
        imageFileIds,
        ...(parentRuleId && { parentRuleId }),
        dateUpdated: new Date(),
        updatedByUserId: submitter.userId
      },
      ...getRuleQueryArgs()
    });

    return ruleTransformer(updatedRule);
  }

  /**
   * Given a ruleset id, retrieves the ruleset and throws errors if
   * it does not exist or is already deleted
   * @param rulesetId the id of the ruleset
   * @param organizationId the id of the organization the ruleset is being deleted in
   * @returns the ruleset with query args
   */
  static async getRulesetWithQueryArgs(rulesetId: string, organizationId: string) {
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      ...getRulesetQueryArgs(organizationId)
    });

    if (!ruleset) throw new NotFoundException('Ruleset', rulesetId);
    if (ruleset.deletedByUserId) throw new DeletedException('Ruleset', rulesetId);

    return ruleset;
  }

  /**
   * Deletes a specific Ruleset
   * @param rulesetId the id of the ruleset to be deleted
   * @param deleterId the id of the user deleting the ruleset
   * @param organizationID the id of the organization the ruleset is being deleted in
   * @returns the deleted Ruleset
   */
  static async deleteRuleset(rulesetId: string, deleterId: string, organizationId: string) {
    const ruleset = await RulesService.getRulesetWithQueryArgs(rulesetId, organizationId);

    const hasPermission =
      (await userHasPermission(deleterId, organizationId, isAdmin)) || deleterId === ruleset.createdBy.userId;

    if (!hasPermission) throw new AccessDeniedException('Only admins can delete a ruleset.');

    const deletedRuleset = await prisma.ruleset.update({
      where: { rulesetId },
      data: { deletedBy: { connect: { userId: deleterId } } },
      ...getRulesetQueryArgs(organizationId)
    });

    return rulesetTransformer(deletedRuleset);
  }
}

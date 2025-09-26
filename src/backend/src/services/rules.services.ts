import { Organization, Rule, User } from '@prisma/client';
import { isAdmin, isLeadership } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

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
      where: {
        ruleId
      }
    });

    if (!(await userHasPermission(deleter.userId, org.organizationId, isAdmin))) {
      throw new AccessDeniedException('Only admins can delete rules.');
    }

    if (!rule) throw new NotFoundException('Rule', ruleId);
    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);

    const deletedRule = await prisma.rule.update({
      where: { ruleId },
      data: { dateDeleted: new Date(), deletedByUserId: deleter.userId }
    });

    return deletedRule;
  }
}

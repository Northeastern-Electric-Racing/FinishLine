import { Organization, Rule, User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, DeletedException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class RulesService {
  // service functions go here!
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

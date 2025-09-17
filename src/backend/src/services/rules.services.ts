import { User, Organization } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException } from '../utils/errors.utils';
import { DeletedException, NotFoundException } from '../utils/errors.utils';
import { isAdmin, Permission } from 'shared';

export default class RulesService {
  // service functions go here!

  /**
   * Deletes a ruleset type
   *
   * @param user The user who is deleting the ruleset type
   * @param rulesetTypeId The ruleset type to be deleted
   * @param organization The organization that the ruleset is being deleted for
   */
  static async deleteRulesetType(deleter: User, id: string, organization: Organization): Promise<{ message: string }> {
    //check if user is admin
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create event type');
    }

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: { rulesetTypeId: id }
    });

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', id);
    }
    if (rulesetType.deletedByUserId) {
      throw new DeletedException('Ruleset Type', id);
    }

    await prisma.ruleset_Type.update({
      where: { rulesetTypeId: id },
      data: {
        deletedByUserId: deleter.userId
      }
    });

    return { message: 'Ruleset Type Deleted' };
  }
}

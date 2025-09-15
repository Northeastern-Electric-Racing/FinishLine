import { User } from '@prisma/client';
import { userHasPermissionNew } from '../utils/users.utils';
import prisma from '../prisma/prisma';
import { AccessDeniedException } from '../utils/errors.utils';
import { DeletedException, NotFoundException } from '../utils/errors.utils';
import { isAdmin, Permission } from 'shared';

export default class RulesService {
  // service functions go here!

  /**
   * Deletes a ruleset type
   *
   * @param user The user who is deleting the ruleset type
   * @param rulesetTypeId The ruleset type to be deleted
   */
  static async deleteRulesetType(user: User, id: string): Promise<{ message: string }> {
    /* CHECK IF USER IS ADMIN SOMEHOW
    
    if (!isAdmin(user.role)) {
      throw new AccessDeniedException('You do not have permission to edit graph collections');
    }
      */

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
        deletedByUserId: user.userId,
        deletedBy: {
          connect: {
            userId: user.userId
          }
        }
      }
    });

    return { message: 'Ruleset Type Deleted' };
  }
}

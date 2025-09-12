import { Organization, User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class MachineryService {
  /**
   * Creates a new machinery and associates it with a shop.
   *
   * @param submitter The user submitting the request, who must be an admin.
   * @param name The name of the machinery.
   * @param shopId The ID of the shop to associate the machinery with.
   * @param quantity The quantity of machinery to add to the shop.
   * @param organization The organization for which the machinery is being created.
   *
   * @returns The created machinery object with associated shop machinery.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter is not an admin.
   */
  static async createMachinery(submitter: User, name: string, shopId: string, quantity: number, organization: Organization) {
    // Check if user is admin
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create machinery');
    }

    const newMachinery = await prisma.machinery.create({
      data: {
        name,
        userCreatedId: submitter.userId,
        shops: {
          create: {
            shopId,
            quantity
          }
        }
      },
      include: {
        shops: {
          include: {
            shop: true
          }
        }
      }
    });

    return newMachinery;
  }
}

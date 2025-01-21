import { getPopUpQueryArgs } from '../prisma-query-args/pop-up.query-args';
import prisma from '../prisma/prisma';
import popUpTransformer from '../transformers/pop-up.transformer';
import { HttpException, NotFoundException } from '../utils/errors.utils';

export class PopUpService {
  /**
   * Gets all of a user's unread pop up
   * @param userId id of user to get unread pop up from
   * @param organization the user's orgainzation
   * @returns the unread pop up of the user
   */
  static async getUserUnreadPopUps(userId: string, organizationId: string) {
    const unreadPopUps = await prisma.popUp.findMany({
      where: {
        usersReceived: {
          some: { userId }
        },
        organizationId
      },
      ...getPopUpQueryArgs(organizationId)
    });

    if (!unreadPopUps) throw new HttpException(404, 'User Unread Notifications Not Found');

    return unreadPopUps.map(popUpTransformer);
  }

  /**
   * Removes a pop up from the user's unread pop up
   * @param userId id of the current user
   * @param popUpId id of the pop up to remove
   * @param organization the user's organization
   * @returns the user's updated unread pop up
   */
  static async removeUserPopUp(userId: string, popUpId: string, organizationId: string) {
    const popUp = await prisma.popUp.findUnique({
      where: { popUpId }
    });

    if (!popUp) throw new NotFoundException('Pop Up', popUpId);

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        unreadPopUps: {
          disconnect: {
            popUpId
          }
        }
      },
      include: { unreadPopUps: getPopUpQueryArgs(organizationId) }
    });

    if (!updatedUser) throw new HttpException(404, `Failed to remove notication: ${popUpId}`);

    return updatedUser.unreadPopUps.map(popUpTransformer);
  }

  /**
   * Creates and sends a pop up to all users with the given userIds
   * @param text writing in the pop up
   * @param iconName icon that appears in the pop up
   * @param userIds ids of users to send the pop up to
   * @param organizationId
   * @param eventLink link the pop up will go to when clicked
   * @returns the created notification
   */
  static async sendPopUpToUsers(
    text: string,
    iconName: string,
    userIds: string[],
    organizationId: string,
    eventLink?: string
  ) {
    const createdPopUp = await prisma.popUp.create({
      data: {
        text,
        iconName,
        eventLink,
        organizationId
      },
      ...getPopUpQueryArgs(organizationId)
    });

    if (!createdPopUp) throw new HttpException(500, 'Failed to create notification');

    const popUpPromises = userIds.map(async (userId) => {
      const requestedUser = await prisma.user.findUnique({
        where: { userId }
      });

      if (!requestedUser) throw new NotFoundException('User', userId);

      return await prisma.user.update({
        where: { userId: requestedUser.userId },
        data: {
          unreadPopUps: {
            connect: { popUpId: createdPopUp.popUpId }
          }
        }
      });
    });

    await Promise.all(popUpPromises);
    return popUpTransformer(createdPopUp);
  }
}

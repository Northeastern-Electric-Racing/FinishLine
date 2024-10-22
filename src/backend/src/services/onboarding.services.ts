import { Checklist, Team_Type } from '@prisma/client';
import prisma from '../prisma/prisma';
import { HttpException } from '../utils/errors.utils';

export default class OnboardingServices {
  /**
   * Gets all checklists for the given user Id.
   * @param userId the user id to get checklists for
   * @returns all checklists for the given user Id
   */
  static async getUsersChecklists(userId: string) {
    const generalChecklists = await prisma.checklist.findMany({
      where: { teamTypeId: null }
    });

    const userTeams = await prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: {
        teamType: {
          include: {
            checklists: true
          }
        }
      }
    });
    if (!userTeams || userTeams.length === 0) {
      throw new HttpException(404, 'This user does not have any teams');
    }

    const userChecklists: Checklist[] = userTeams
      .map((team) => team.teamType)
      .filter(
        (teamType): teamType is Team_Type & { checklists: Checklist[] } =>
          teamType !== null && teamType.checklists.length > 0
      )
      .flatMap((teamType) => teamType.checklists);

    return generalChecklists.concat(userChecklists);
  }
}

import TeamsService from '../src/services/teams.services';
import prisma from '../src/prisma/prisma';
import * as teamsTransformer from '../src/transformers/teams.transformer';
import { prismaTeam1, sharedTeam1, justiceLeague, primsaTeam2 } from './test-data/teams.test-data';
import teamQueryArgs from '../src/prisma-query-args/teams.query-args';
import {
  alfred,
  aquaman,
  batman,
  flash,
  greenlantern,
  superman,
  theVisitor,
  wonderwoman
} from './test-data/users.test-data';
import * as userUtils from '../src/utils/users.utils';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import teamTransformer from '../src/transformers/teams.transformer';
import { Role } from '@prisma/client';

describe('Teams', () => {
  beforeEach(() => {
    vi.spyOn(teamsTransformer, 'default').mockReturnValue(sharedTeam1);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('getAllTeams works', async () => {
    vi.spyOn(prisma.team, 'findMany').mockResolvedValue([justiceLeague]);

    const teams = await TeamsService.getAllTeams();

    expect(teams).toStrictEqual([sharedTeam1]);
    expect(prisma.team.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.team.findMany).toHaveBeenCalledWith({ ...teamQueryArgs, where: { dateArchived: null } });
  });

  test('getSingleTeam works', async () => {
    vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);

    const { teamId } = prismaTeam1;
    const team = await TeamsService.getSingleTeam(teamId);

    expect(team).toStrictEqual(sharedTeam1);
    expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { teamId }, ...teamQueryArgs });
  });

  test('getSingleTeam not found', async () => {
    vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

    const { teamId } = prismaTeam1;
    await expect(() => TeamsService.getSingleTeam(teamId)).rejects.toThrow();

    expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { teamId }, ...teamQueryArgs });
  });

  describe('setTeamMembers', () => {
    test('setTeamMembers members not found', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([batman]);

      const callSetTeamMembers = async () =>
        await TeamsService.setTeamMembers(flash, sharedTeam1.teamId, [batman.userId, 122, 55]);

      // note that the error does not include batman's id since he was found in the database
      const expectedException = new HttpException(404, 'User(s) with the following ids not found: 122, 55');

      await expect(callSetTeamMembers).rejects.toThrow(expectedException);
    });

    test('setTeamMembers works', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.team, 'update').mockResolvedValue(justiceLeague);
      vi.spyOn(userUtils, 'getUsers').mockResolvedValue([greenlantern, theVisitor]);

      const teamId = 'id1';
      const userIds = [
        {
          userId: 5
        },
        {
          userId: 7
        }
      ];

      const res = await TeamsService.setTeamMembers(flash, sharedTeam1.teamId, [5, 7]);

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { teamId },
        data: {
          members: {
            set: userIds
          }
        },
        ...teamQueryArgs
      });
      expect(res).toStrictEqual(sharedTeam1);
    });
  });

  describe('Edit Team Description', () => {
    test('Update Team Description Success', async () => {
      const newJustice = { ...justiceLeague, description: 'hello!' };

      vi.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(justiceLeague);
      vi.spyOn(prisma.team, 'update').mockResolvedValue(newJustice);

      const res = await TeamsService.editDescription(batman, '1', 'hello!');

      expect(res).toStrictEqual(teamTransformer(newJustice));
      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
    });

    test('Returns Error If Not Admin', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(justiceLeague);

      await expect(() => TeamsService.editDescription(wonderwoman, '1', 'Hello!')).rejects.toThrow(
        new AccessDeniedException('you must be an admin or the team head to update the members!')
      );

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('setTeamHead', () => {
    test('setTeamHead head not found', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);

      const callSetTeamHead = async () => await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 122);

      const expectedException = new HttpException(404, 'User with id: 122 not found!');

      await expect(callSetTeamHead).rejects.toThrow(expectedException);
    });

    test('setTeamHead team not found', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(superman);
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

      const callSetTeamHead = async () => await TeamsService.setTeamHead(flash, 'randomId', 2);

      const expectedException = new HttpException(404, 'Team with id: randomId not found!');

      await expect(callSetTeamHead).rejects.toThrow(expectedException);
    });

    test(`setTeamHead head's role is not at least head role`, async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(wonderwoman);

      const callSetTeamHead = async () => await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 3);

      const expectedException = new HttpException(403, 'Access Denied: The team head must be at least a head');

      await expect(callSetTeamHead).rejects.toThrow(expectedException);
    });

    test('setTeamHead new head is already a head of another team', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);

      const callSetTeamHead = async () => await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 1);

      const expectedException = new HttpException(
        403,
        'Access Denied: The new team head must not be a head or lead of another team'
      );

      await expect(callSetTeamHead).rejects.toThrow(expectedException);
    });

    test('setTeamHead new head is already a lead of another team', async () => {
      const unArchivedTeam = { ...prismaTeam1, dateArchived: null };
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(unArchivedTeam);
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...wonderwoman, role: Role.HEAD });

      const callSetTeamHead = async () => await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 1);

      const expectedException = new HttpException(
        403,
        'Access Denied: The new team head must not be a head or lead of another team'
      );

      await expect(callSetTeamHead).rejects.toThrow(expectedException);
    });

    test('setTeamHead works', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.team, 'update').mockResolvedValue(justiceLeague);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(superman);
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(null);

      const teamId = 'id1';
      const res = await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 2);

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { teamId },
        data: {
          head: {
            connect: {
              userId: 2
            }
          }
        },
        ...teamQueryArgs
      });
      expect(res).toStrictEqual(sharedTeam1);
    });
  });

  describe('deleteTeam', () => {
    test('deleteTeam team not found', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

      const callDeleteTeam = async () => await TeamsService.deleteTeam(flash, 'fakeId');

      const expectedException = new HttpException(404, 'Team with id: fakeId not found!');

      await expect(callDeleteTeam).rejects.toThrow(expectedException);
    });

    test('deleteTeam submitter is not admin', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);

      const callDeleteTeam = async () => await TeamsService.deleteTeam(greenlantern, prismaTeam1.teamId);

      const expectedException = new HttpException(
        403,
        'Access Denied: admin and app-admin only have the ability to delete teams'
      );

      await expect(callDeleteTeam).rejects.toThrow(expectedException);
    });

    test('deleteTeam works', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.team, 'delete').mockResolvedValue(prismaTeam1);

      await TeamsService.deleteTeam(batman, prismaTeam1.teamId);

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.delete).toHaveBeenCalledTimes(1);
      expect(prisma.team.delete).toHaveBeenCalledWith({ where: { teamId: prismaTeam1.teamId }, ...teamQueryArgs });
    });
  });

  describe('setTeamLeads', () => {
    test('setTeamLeads submitter is not the head or admin', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([theVisitor]);
      vi.spyOn(prisma.team, 'findMany').mockResolvedValue([prismaTeam1, primsaTeam2, justiceLeague]);

      const callSetTeamLeads = async () =>
        await TeamsService.setTeamLeads(wonderwoman, prismaTeam1.teamId, [theVisitor.userId]);

      const expectedException = new HttpException(
        400,
        'Access Denied: You must be an admin or the head to update the lead!'
      );

      await expect(callSetTeamLeads).rejects.toThrow(expectedException);
    });

    test('setTeamLeads lead is a member', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([aquaman]);
      vi.spyOn(prisma.team, 'findMany').mockResolvedValue([prismaTeam1, primsaTeam2, justiceLeague]);

      const callSetTeamLeads = async () => await TeamsService.setTeamLeads(flash, sharedTeam1.teamId, [aquaman.userId]);

      const expectedException = new HttpException(400, 'A lead cannot be a member of the team!');

      await expect(callSetTeamLeads).rejects.toThrow(expectedException);
    });

    test('setTeamLeads lead is a head', async () => {
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(justiceLeague);
      vi.spyOn(userUtils, 'getUsers').mockResolvedValue([batman]);
      vi.spyOn(prisma.team, 'findMany').mockResolvedValue([prismaTeam1, primsaTeam2, justiceLeague]);

      const callSetTeamLeads = async () => await TeamsService.setTeamLeads(alfred, justiceLeague.teamId, [batman.userId]);

      const expectedException = new HttpException(400, 'A lead cannot be the head of the team!');

      await expect(callSetTeamLeads).rejects.toThrow(expectedException);
    });

    test('setTeamLeads works', async () => {
      const prisma1Unarchived = { ...prismaTeam1, dateArchived: null };
      const prisma2Unarchived = { ...primsaTeam2, dateArchived: null };
      vi.spyOn(prisma.team, 'findUnique').mockResolvedValue(prisma1Unarchived);
      vi.spyOn(prisma.team, 'update').mockResolvedValue(prisma1Unarchived);
      vi.spyOn(userUtils, 'getUsers').mockResolvedValue([greenlantern, theVisitor]);
      vi.spyOn(prisma.team, 'findMany').mockResolvedValue([prisma1Unarchived, prisma2Unarchived, justiceLeague]);

      const teamId = 'id1';
      const userIds = [
        {
          userId: 5
        },
        {
          userId: 7
        }
      ];

      const res = await TeamsService.setTeamLeads(flash, sharedTeam1.teamId, [5, 7]);

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { teamId },
        data: {
          leads: {
            set: userIds
          }
        },
        ...teamQueryArgs
      });
      expect(res).toStrictEqual(sharedTeam1);
    });
  });

  describe('Archive team', () => {
    test('Archive team doesn`t work if the team is not found', async () => {
      await expect(async () => await TeamsService.archiveTeam(batman, sharedTeam1.teamId)).rejects.toThrow(
        new NotFoundException('Team', sharedTeam1.teamId)
      );
    });

    test('Archive team doesn`t work if the user is not an admin or above', async () => {
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(justiceLeague);
      await expect(async () => await TeamsService.archiveTeam(theVisitor, primsaTeam2.teamId)).rejects.toThrow(
        new AccessDeniedException('You must be an admin or above to archive a team')
      );
    });

    test('Archive team doesn`t work if a project in the team is incomplete or active', async () => {
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(primsaTeam2);
      await expect(async () => await TeamsService.archiveTeam(superman, primsaTeam2.teamId)).rejects.toThrow(
        new HttpException(400, 'A team is not archivable if it has any active projects, or incomplete projects')
      );
    });

    test('Archive team works on an archived team', async () => {
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(prismaTeam1);

      const prismaTeamUpdates = { ...prismaTeam1, userArchivedId: null, userArchived: null, dateArchived: null };

      vi.spyOn(prisma.team, 'update').mockResolvedValue(prismaTeamUpdates);
      const { teamId } = prismaTeam1;
      const archivedTeam = await TeamsService.archiveTeam(superman, prismaTeam1.teamId);

      expect(archivedTeam.dateArchived).toBe(undefined);
      expect(archivedTeam.userArchived).toBe(undefined);
      expect(prisma.team.findFirst).toBeCalledTimes(1);
      expect(prisma.team.update).toBeCalledTimes(1);
    });

    test('Archive team works for a non archived team', async () => {
      vi.spyOn(prisma.team, 'findFirst').mockResolvedValue(justiceLeague);
      const dateArchived = new Date();
      const justiceLeagueUpdates = { ...justiceLeague, userArchivedId: 2, userArchived: superman, dateArchived };

      vi.spyOn(prisma.team, 'update').mockResolvedValue(justiceLeagueUpdates);
      vi.spyOn(teamsTransformer, 'default').mockReturnValue(justiceLeagueUpdates);
      const { teamId } = justiceLeague;
      const archivedTeam = await TeamsService.archiveTeam(superman, justiceLeague.teamId);

      expect(archivedTeam.dateArchived).toBe(dateArchived);
      expect(archivedTeam.userArchived).toBe(superman);
      expect(prisma.team.findFirst).toBeCalledTimes(1);
      expect(prisma.team.update).toBeCalledTimes(1);
    });
  });
});

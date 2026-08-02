import { Organization, Team } from '@prisma/client';
import { RoleEnum, User } from 'shared';
import TeamsService from '../../src/services/teams.services.js';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import {
  aquamanLeadership,
  greenlanternHead,
  robinMember,
  supermanAdmin,
  wonderwomanGuest
} from '../test-data/users.test-data.js';
import { createTestOrganization, createTestTeam, createTestTeamType, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';

describe('Team Join Request Tests', () => {
  let organization: Organization;
  let team: Team;
  let admin: User;
  let head: User;
  let lead: User;
  let requester: User;
  let outsider: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    const teamType = await createTestTeamType('electrical', organization.organizationId);
    admin = await createTestUser(supermanAdmin, organization.organizationId);
    head = await createTestUser(greenlanternHead, organization.organizationId);
    team = await createTestTeam(head.userId, teamType.teamTypeId, organization.organizationId);
    lead = await createTestUser(aquamanLeadership, organization.organizationId);
    await TeamsService.setTeamLeads(admin, team.teamId, [lead.userId], organization);
    requester = await createTestUser(wonderwomanGuest, organization.organizationId);
    outsider = await createTestUser(robinMember, organization.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Team Join Request', () => {
    it('fails if the team is archived', async () => {
      await TeamsService.archiveTeam(admin, team.teamId, organization);

      await expect(
        async () => await TeamsService.createTeamJoinRequest(requester, team.teamId, organization)
      ).rejects.toThrow(new DeletedException('Team', team.teamId));
    });

    it('fails if the submitter is already on the team', async () => {
      await expect(async () => await TeamsService.createTeamJoinRequest(head, team.teamId, organization)).rejects.toThrow(
        new HttpException(400, 'You are already part of this team')
      );
    });

    it('fails if the submitter already has a pending request for the team', async () => {
      await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      await expect(
        async () => await TeamsService.createTeamJoinRequest(requester, team.teamId, organization)
      ).rejects.toThrow(new HttpException(400, 'You already have a pending request to join this team'));
    });

    it('works and creates a pending request', async () => {
      const result = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      expect(result).toMatchObject({
        status: 'PENDING',
        team: { teamId: team.teamId },
        user: { userId: requester.userId }
      });
    });
  });

  describe('Get My Team Join Requests', () => {
    it('returns all of the requesting users requests, most recent first', async () => {
      const otherTeamType = await createTestTeamType('mechanical', organization.organizationId);
      const otherHead = await createTestUser(
        {
          firstName: 'Other',
          lastName: 'Head',
          email: 'otherhead',
          emailId: 'otherhead',
          googleAuthId: 'otherhead',
          role: RoleEnum.HEAD
        },
        organization.organizationId
      );
      const otherTeam = await createTestTeam(otherHead.userId, otherTeamType.teamTypeId, organization.organizationId);
      const request1 = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);
      const request2 = await TeamsService.createTeamJoinRequest(requester, otherTeam.teamId, organization);

      const result = await TeamsService.getMyTeamJoinRequests(requester, organization);

      expect(result.map((request) => request.teamJoinRequestId)).toStrictEqual([
        request2.teamJoinRequestId,
        request1.teamJoinRequestId
      ]);
    });
  });

  describe('Get Pending Team Join Requests', () => {
    it('fails if the reviewer is not an admin or the head', async () => {
      await expect(
        async () => await TeamsService.getPendingTeamJoinRequests(team.teamId, outsider, organization)
      ).rejects.toThrow(
        new AccessDeniedException('you must be an admin or the team head to review join requests for this team')
      );
    });

    it('succeeds for the team head', async () => {
      await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      const result = await TeamsService.getPendingTeamJoinRequests(team.teamId, head, organization);

      expect(result).toHaveLength(1);
    });

    it('fails for a team lead', async () => {
      await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      await expect(
        async () => await TeamsService.getPendingTeamJoinRequests(team.teamId, lead, organization)
      ).rejects.toThrow(
        new AccessDeniedException('you must be an admin or the team head to review join requests for this team')
      );
    });

    it('only returns requests that are still pending', async () => {
      const created = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);
      await TeamsService.reviewTeamJoinRequest(head, created.teamJoinRequestId, true, undefined, organization);

      const result = await TeamsService.getPendingTeamJoinRequests(team.teamId, head, organization);

      expect(result).toHaveLength(0);
    });
  });

  describe('Review Team Join Request', () => {
    it('fails if the request does not exist', async () => {
      await expect(
        async () => await TeamsService.reviewTeamJoinRequest(head, 'nonExistentId', true, undefined, organization)
      ).rejects.toThrow(new NotFoundException('Team Join Request', 'nonExistentId'));
    });

    it('fails if the request has already been reviewed', async () => {
      const created = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);
      await TeamsService.reviewTeamJoinRequest(head, created.teamJoinRequestId, true, undefined, organization);

      await expect(
        async () => await TeamsService.reviewTeamJoinRequest(head, created.teamJoinRequestId, true, undefined, organization)
      ).rejects.toThrow(new HttpException(400, 'This request has already been reviewed'));
    });

    it('fails if the reviewer is not an admin or the head', async () => {
      const created = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      await expect(
        async () =>
          await TeamsService.reviewTeamJoinRequest(outsider, created.teamJoinRequestId, true, undefined, organization)
      ).rejects.toThrow(
        new AccessDeniedException('you must be an admin or the team head to review join requests for this team')
      );
    });

    it('fails for a team lead', async () => {
      const created = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      await expect(
        async () => await TeamsService.reviewTeamJoinRequest(lead, created.teamJoinRequestId, true, undefined, organization)
      ).rejects.toThrow(
        new AccessDeniedException('you must be an admin or the team head to review join requests for this team')
      );
    });

    it('approving adds the requester to the team members', async () => {
      const created = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      const result = await TeamsService.reviewTeamJoinRequest(
        head,
        created.teamJoinRequestId,
        true,
        undefined,
        organization
      );

      expect(result.status).toBe('APPROVED');
      const updatedTeam = await prisma.team.findUnique({ where: { teamId: team.teamId }, include: { members: true } });
      expect(updatedTeam?.members.map((member) => member.userId)).toContain(requester.userId);
    });

    it('denying does not add the requester to the team members and stores the denial reason', async () => {
      const created = await TeamsService.createTeamJoinRequest(requester, team.teamId, organization);

      const result = await TeamsService.reviewTeamJoinRequest(
        head,
        created.teamJoinRequestId,
        false,
        'Not enough experience',
        organization
      );

      expect(result.status).toBe('DENIED');
      expect(result.denialReason).toBe('Not enough experience');
      const updatedTeam = await prisma.team.findUnique({ where: { teamId: team.teamId }, include: { members: true } });
      expect(updatedTeam?.members.map((member) => member.userId)).not.toContain(requester.userId);
    });
  });
});

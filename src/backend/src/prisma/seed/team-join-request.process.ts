import { Team_Join_Request, Team_Join_Request_Status } from '@prisma/client';
import { RoleEnum } from 'shared';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import {
  chooseDenialReason,
  chooseJoinRequestStatus,
  TEAM_JOIN_REQUEST_COUNT,
  teamJoinRequestCreateInput
} from '../factories/team-join-request.factory.js';

type TeamJoinRequestInput = OrganizationOutput & UsersOutput & TeamOutput;

export type TeamJoinRequestOutput = {
  teamJoinRequests: Team_Join_Request[];
};

export class TeamJoinRequestProcess extends SeedProcess<TeamJoinRequestInput, TeamJoinRequestOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, TeamProcess];
  }

  async run({ organization, guests, members, teams }: TeamJoinRequestInput): Promise<TeamJoinRequestOutput> {
    if (guests.length === 0) throw new Error('TeamJoinRequestProcess requires at least one guest user.');
    if (teams.length === 0) throw new Error('TeamJoinRequestProcess requires at least one team.');

    const now = new Date();
    // Each requester is used at most once, so no guest ends up with two pending requests for the same team.
    const requesters = this.faker.helpers.arrayElements(guests, Math.min(TEAM_JOIN_REQUEST_COUNT, guests.length));

    const teamJoinRequests = await Promise.all(
      requesters.map(async (requester) => {
        const team = this.faker.helpers.arrayElement(teams);
        const status = chooseJoinRequestStatus(this.faker);
        const dateRequested = this.faker.date.recent({ days: 30, refDate: now });

        const isResolved = status !== Team_Join_Request_Status.PENDING;
        const reviewedByUserId = isResolved ? team.headId : undefined;
        const dateReviewed = isResolved ? this.faker.date.between({ from: dateRequested, to: now }) : undefined;
        const denialReason = status === Team_Join_Request_Status.DENIED ? chooseDenialReason(this.faker) : undefined;

        const created = await this.prisma.team_Join_Request.create({
          data: teamJoinRequestCreateInput(
            requester.userId,
            team.teamId,
            status,
            dateRequested,
            reviewedByUserId,
            dateReviewed,
            denialReason
          )
        });

        // Mirror what TeamsService.reviewTeamJoinRequest does on approval, so seeded data is
        // internally consistent (an approved request implies team membership and, since the
        // requester was a guest, a promotion to member).
        if (status === Team_Join_Request_Status.APPROVED) {
          await this.prisma.team.update({
            where: { teamId: team.teamId },
            data: { members: { connect: { userId: requester.userId } } }
          });

          const promotedRole = await this.prisma.role.upsert({
            where: { uniqueRole: { userId: requester.userId, organizationId: organization.organizationId } },
            update: { roleType: RoleEnum.MEMBER },
            create: { userId: requester.userId, organizationId: organization.organizationId, roleType: RoleEnum.MEMBER }
          });

          // Keep the in-memory guests/members pools (shared with every later seed process) in
          // sync with the DB, so downstream processes that assign projects/tasks/CRs/etc. off of
          // `members` see this user as a real member instead of still treating them as a guest.
          const guestIndex = guests.findIndex((guest) => guest.userId === requester.userId);
          if (guestIndex !== -1) guests.splice(guestIndex, 1);
          requester.roles = [promotedRole];
          members.push(requester);
        }

        return created;
      })
    );

    return { teamJoinRequests };
  }
}

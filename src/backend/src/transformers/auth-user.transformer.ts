import { Prisma, Team } from '@prisma/client';
import { AuthenticatedUser } from 'shared';
import authUserQueryArgs from '../prisma-query-args/auth-user.query-args';

const authenticatedUserTransformer = (user: Prisma.UserGetPayload<typeof authUserQueryArgs>): AuthenticatedUser => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.role,
    defaultTheme: user.userSettings?.defaultTheme,
    teamAsLeadId: user.teamAsLead?.teamId,
    favoritedProjectsId: user.favoriteProjects.map((project) => project.projectId),
    isFinance:
      !!process.env.FINANCE_TEAM_ID &&
      (user.teams.map((team: Team) => team.teamId).includes(process.env.FINANCE_TEAM_ID) ||
        user.teamAsLead?.teamId === process.env.FINANCE_TEAM_ID)
  };
};

export default authenticatedUserTransformer;

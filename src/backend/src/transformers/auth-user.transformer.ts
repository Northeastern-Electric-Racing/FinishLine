import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from 'shared';
import authUserQueryArgs from '../prisma-query-args/auth-user.query-args';
import projectTransformer from './projects.transformer';

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
    favoriteProjects: user.favoriteProjects.map((project) => projectTransformer(project))
  };
};

export default authenticatedUserTransformer;

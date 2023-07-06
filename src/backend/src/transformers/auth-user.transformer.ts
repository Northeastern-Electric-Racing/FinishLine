import { Prisma } from '@prisma/client';
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
    changeRequestsToReviewId: user.changeRequestsToReview.map((changeRequest) => changeRequest.crId)
  };
};

export default authenticatedUserTransformer;

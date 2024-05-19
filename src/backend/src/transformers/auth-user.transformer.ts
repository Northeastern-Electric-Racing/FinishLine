import { AuthenticatedUser, RoleEnum } from 'shared';
import { AuthUserQueryArgs } from '../prisma-query-args/auth-user.query-args';
import {
  isAuthUserHeadOfFinance,
  isAuthUserAtLeastLeadForFinance,
  isAuthUserOnFinance
} from '../utils/reimbursement-requests.utils';
import { Prisma } from '@prisma/client';

const authenticatedUserTransformer = (user: Prisma.UserGetPayload<AuthUserQueryArgs>): AuthenticatedUser => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST,
    defaultTheme: user.userSettings?.defaultTheme,
    teamAsHeadId: user.teamsAsHead.length > 0 ? user.teamsAsHead[0].teamId : undefined,
    favoritedProjectsId: user.favoriteProjects.map((project) => project.projectId),
    isFinance: isAuthUserOnFinance(user),
    isHeadOfFinance: isAuthUserHeadOfFinance(user),
    isAtLeastFinanceLead: isAuthUserAtLeastLeadForFinance(user),
    changeRequestsToReviewId: user.changeRequestsToReview.map((changeRequest) => changeRequest.crId),
    organizations: user.organizations.map((organization) => organization.organizationId)
  };
};

export default authenticatedUserTransformer;

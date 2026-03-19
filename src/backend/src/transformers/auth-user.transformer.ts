import { AuthenticatedUser, RoleEnum } from 'shared';
import { AuthUserQueryArgs } from '../prisma-query-args/auth-user.query-args.js';
import { isCurrentUserAtLeastLeadForFinance, isCurrentUserOnFinance } from '../utils/reimbursement-requests.utils.js';
import { Prisma } from '@prisma/client';

const authenticatedUserTransformer = (user: Prisma.UserGetPayload<AuthUserQueryArgs>): AuthenticatedUser => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST,
    defaultTheme: user.userSettings?.defaultTheme,
    isFinance: isCurrentUserOnFinance(user),
    isAtLeastFinanceLead: isCurrentUserAtLeastLeadForFinance(user),
    organizations: user.organizations.map((organization) => organization.organizationId),
    onboardingTeamTypeIds: user.onboardingTeamTypes.map((teamType) => teamType.teamTypeId),
    onboardedTeamTypeIds: user.onboardedTeamTypes.map((teamType) => teamType.teamTypeId)
  };
};

export default authenticatedUserTransformer;

import { AuthenticatedUser, ContextUser, getPermissionsForRoleType, Permission, RoleEnum } from 'shared';
import { AuthUserQueryArgs, CurrentUserQueryArgs } from '../prisma-query-args/auth-user.query-args';
import {
  isAuthUserHeadOfFinance,
  isCurrentUserAtLeastLeadForFinance,
  isCurrentUserOnFinance
} from '../utils/reimbursement-requests.utils';
import { Prisma } from '@prisma/client';
import teamTransformer from './teams.transformer';
import { organizationTransformer } from './organizationTransformer';

const authenticatedUserTransformer = (
  user: Prisma.UserGetPayload<AuthUserQueryArgs>,
  organizationId?: String
): AuthenticatedUser => {
  const currentOrganization = user.organizations.find((organization) => organization.organizationId === organizationId);
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
    isFinance: isCurrentUserOnFinance(user),
    isHeadOfFinance: isAuthUserHeadOfFinance(user),
    isAtLeastFinanceLead: isCurrentUserAtLeastLeadForFinance(user),
    changeRequestsToReviewId: user.changeRequestsToReview.map((changeRequest) => changeRequest.crId),
    organizations: user.organizations.map((organization) => organization.organizationId),
    currentOrganization: currentOrganization ? organizationTransformer(currentOrganization) : undefined,
    onboardingTeamTypeIds: user.onboardingTeamTypes.map((teamType) => teamType.teamTypeId),
    onboardedTeamTypeIds: user.onboardedTeamTypes.map((teamType) => teamType.teamTypeId),
    teamsAsHead: user.teamsAsHead.map(teamTransformer),
    teamsAsLead: user.teamsAsLead.map(teamTransformer),
    permissions: user.roles
      .map((role) => getPermissionsForRoleType(role.roleType))
      .flat()
      .concat(user.additionalPermissions as Permission[])
  };
};

export const currentUserTransformer = (user: Prisma.UserGetPayload<CurrentUserQueryArgs>): ContextUser => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST,
    teamAsHeadId: user.teamsAsHead.length > 0 ? user.teamsAsHead[0].teamId : undefined,
    isFinance: isCurrentUserOnFinance(user),
    isAtLeastFinanceLead: isCurrentUserAtLeastLeadForFinance(user),
    onboardedTeamTypeIds: user.onboardedTeamTypes.map((teamType) => teamType.teamTypeId),
    onboardingTeamTypeIds: user.onboardingTeamTypes.map((teamType) => teamType.teamTypeId),
    teamsAsLead: user.teamsAsLead.map(teamTransformer)
  };
};

export default authenticatedUserTransformer;

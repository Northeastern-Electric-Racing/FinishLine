"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("shared");
var reimbursement_requests_utils_1 = require("../utils/reimbursement-requests.utils");
var teams_transformer_1 = require("./teams.transformer");
var organizationTransformer_1 = require("./organizationTransformer");
var authenticatedUserTransformer = function (user, organizationId) {
    var _a;
    var currentOrganization = user.organizations.find(function (organization) { return organization.organizationId === organizationId; });
    return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailId: user.emailId,
        role: user.roles.length > 0 ? user.roles[0].roleType : shared_1.RoleEnum.GUEST,
        defaultTheme: (_a = user.userSettings) === null || _a === void 0 ? void 0 : _a.defaultTheme,
        teamAsHeadId: user.teamsAsHead.length > 0 ? user.teamsAsHead[0].teamId : undefined,
        favoritedProjectsId: user.favoriteProjects.map(function (project) { return project.projectId; }),
        isFinance: (0, reimbursement_requests_utils_1.isAuthUserOnFinance)(user),
        isHeadOfFinance: (0, reimbursement_requests_utils_1.isAuthUserHeadOfFinance)(user),
        isAtLeastFinanceLead: (0, reimbursement_requests_utils_1.isAuthUserAtLeastLeadForFinance)(user),
        changeRequestsToReviewId: user.changeRequestsToReview.map(function (changeRequest) { return changeRequest.crId; }),
        organizations: user.organizations.map(function (organization) { return organization.organizationId; }),
        currentOrganization: currentOrganization ? (0, organizationTransformer_1.organizationTransformer)(currentOrganization) : undefined,
        onboardingTeamTypeIds: user.onboardingTeamTypes.map(function (teamType) { return teamType.teamTypeId; }),
        onboardedTeamTypeIds: user.onboardedTeamTypes.map(function (teamType) { return teamType.teamTypeId; }),
        teamsAsHead: user.teamsAsHead.map(teams_transformer_1.default),
        teamsAsLead: user.teamsAsLead.map(teams_transformer_1.default),
        permissions: user.roles
            .map(function (role) { return (0, shared_1.getPermissionsForRoleType)(role.roleType); })
            .flat()
            .concat(user.additionalPermissions)
    };
};
exports.default = authenticatedUserTransformer;

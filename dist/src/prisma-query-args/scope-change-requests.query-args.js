"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScopeChangeRequestQueryArgs = exports.getWbsProposedChangeQueryArgs = exports.getWorkPackageProposedChangesQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var links_query_args_1 = require("./links.query-args");
var description_bullets_query_args_1 = require("./description-bullets.query-args");
var proposed_solutions_query_args_1 = require("./proposed-solutions.query-args");
var teams_query_args_1 = require("./teams.query-args");
var getProjectProposedChangesQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            teams: (0, teams_query_args_1.getTeamQueryArgs)(organizationId),
            workPackageProposedChanges: (0, exports.getWorkPackageProposedChangesQueryArgs)(organizationId),
            car: {
                include: {
                    wbsElement: true
                }
            }
        }
    });
};
var getWorkPackageProposedChangesQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            blockedBy: true,
            wbsProposedChanges: {
                include: {
                    links: (0, links_query_args_1.getLinkQueryArgs)(organizationId),
                    lead: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    manager: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    proposedDescriptionBulletChanges: (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organizationId)
                }
            }
        }
    });
};
exports.getWorkPackageProposedChangesQueryArgs = getWorkPackageProposedChangesQueryArgs;
var getWbsProposedChangeQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            projectProposedChanges: getProjectProposedChangesQueryArgs(organizationId),
            workPackageProposedChanges: (0, exports.getWorkPackageProposedChangesQueryArgs)(organizationId),
            links: (0, links_query_args_1.getLinkQueryArgs)(organizationId),
            lead: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            manager: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            proposedDescriptionBulletChanges: (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organizationId)
        }
    });
};
exports.getWbsProposedChangeQueryArgs = getWbsProposedChangeQueryArgs;
var getScopeChangeRequestQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            why: true,
            proposedSolutions: (0, proposed_solutions_query_args_1.getProposedSolutionQueryArgs)(organizationId),
            wbsProposedChanges: (0, exports.getWbsProposedChangeQueryArgs)(organizationId),
            wbsOriginalData: (0, exports.getWbsProposedChangeQueryArgs)(organizationId)
        }
    });
};
exports.getScopeChangeRequestQueryArgs = getScopeChangeRequestQueryArgs;

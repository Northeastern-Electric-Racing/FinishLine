"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthUserQueryArgs = void 0;
var client_1 = require("@prisma/client");
var teams_query_args_1 = require("./teams.query-args");
var getAuthUserQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            userSettings: true,
            teamsAsHead: __assign({ where: {
                    organizationId: organizationId
                } }, (0, teams_query_args_1.getTeamQueryArgs)(organizationId)),
            organizations: true,
            teamsAsLead: __assign({ where: {
                    organizationId: organizationId
                } }, (0, teams_query_args_1.getTeamQueryArgs)(organizationId)),
            teamsAsMember: {
                where: {
                    organizationId: organizationId
                }
            },
            favoriteProjects: {
                where: {
                    wbsElement: {
                        organizationId: organizationId
                    }
                }
            },
            roles: {
                where: {
                    organizationId: organizationId
                }
            },
            changeRequestsToReview: {
                where: {
                    wbsElement: {
                        organizationId: organizationId
                    }
                }
            },
            onboardingTeamTypes: {
                where: {
                    organizationId: organizationId
                }
            },
            onboardedTeamTypes: {
                where: {
                    organizationId: organizationId
                }
            }
        }
    });
};
exports.getAuthUserQueryArgs = getAuthUserQueryArgs;

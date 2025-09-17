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
exports.getProjectManyQueryArgs = exports.getProjectQueryArgs = void 0;
var client_1 = require("@prisma/client");
var links_query_args_1 = require("./links.query-args");
var user_query_args_1 = require("./user.query-args");
var description_bullets_query_args_1 = require("./description-bullets.query-args");
var teams_query_args_1 = require("./teams.query-args");
var tasks_query_args_1 = require("./tasks.query-args");
var work_packages_query_args_1 = require("./work-packages.query-args");
var getProjectQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            wbsElement: {
                include: {
                    lead: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    manager: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    descriptionBullets: __assign({ where: { dateDeleted: null } }, (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organizationId)),
                    tasks: __assign({ where: { dateDeleted: null } }, (0, tasks_query_args_1.getTaskQueryArgs)(organizationId)),
                    links: __assign({ where: { dateDeleted: null } }, (0, links_query_args_1.getLinkQueryArgs)(organizationId)),
                    changes: {
                        where: { changeRequest: { dateDeleted: null } },
                        include: { implementer: (0, user_query_args_1.getUserQueryArgs)(organizationId), changeRequest: true }
                    },
                    organization: true
                }
            },
            teams: (0, teams_query_args_1.getTeamPreviewQueryArgs)(organizationId),
            workPackages: __assign({ where: {
                    wbsElement: {
                        dateDeleted: null
                    }
                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organizationId)),
            favoritedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getProjectQueryArgs = getProjectQueryArgs;
var getProjectManyQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            wbsElement: {
                include: {
                    lead: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    manager: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    tasks: __assign({ where: {
                            dateDeleted: null
                        } }, (0, tasks_query_args_1.getTaskQueryArgs)(organizationId)),
                    links: __assign({ where: {
                            dateDeleted: null
                        } }, (0, links_query_args_1.getLinkQueryArgs)(organizationId))
                }
            },
            teams: (0, teams_query_args_1.getTeamPreviewQueryArgs)(organizationId),
            workPackages: __assign({ where: {
                    wbsElement: {
                        dateDeleted: null
                    }
                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organizationId)),
            favoritedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getProjectManyQueryArgs = getProjectManyQueryArgs;

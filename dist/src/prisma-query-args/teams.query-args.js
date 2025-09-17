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
exports.getTeamPreviewQueryArgs = exports.getTeamQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var projects_query_args_1 = require("./projects.query-args");
var getTeamQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            members: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            head: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            leads: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            userArchived: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            teamType: true,
            projects: __assign({ where: {
                    wbsElement: {
                        dateDeleted: null
                    }
                } }, (0, projects_query_args_1.getProjectManyQueryArgs)(organizationId))
        }
    });
};
exports.getTeamQueryArgs = getTeamQueryArgs;
var getTeamPreviewQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            members: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            head: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            leads: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getTeamPreviewQueryArgs = getTeamPreviewQueryArgs;

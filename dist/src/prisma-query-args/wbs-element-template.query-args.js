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
exports.getProjectTemplateQueryArgs = exports.getWbsElementTemplateQueryArgs = exports.getWorkPackageTemplatePreviewQueryArgs = exports.getWorkPackageTemplateQueryArgs = void 0;
var client_1 = require("@prisma/client");
var description_bullets_query_args_1 = require("./description-bullets.query-args");
var user_query_args_1 = require("./user.query-args");
var teams_query_args_1 = require("./teams.query-args");
var getWorkPackageTemplateQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            blockedBy: (0, exports.getWorkPackageTemplatePreviewQueryArgs)(organizationId),
            wbsElementTemplate: (0, exports.getWbsElementTemplateQueryArgs)(organizationId)
        }
    });
};
exports.getWorkPackageTemplateQueryArgs = getWorkPackageTemplateQueryArgs;
var getWorkPackageTemplatePreviewQueryArgs = function (_organizationId) {
    return client_1.Prisma.validator()({
        include: {
            wbsElementTemplate: true
        }
    });
};
exports.getWorkPackageTemplatePreviewQueryArgs = getWorkPackageTemplatePreviewQueryArgs;
var getWbsElementTemplateQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            descriptionBullets: (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organizationId),
            userCreated: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            userDeleted: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getWbsElementTemplateQueryArgs = getWbsElementTemplateQueryArgs;
var getProjectTemplateQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            wbsElementTemplate: (0, exports.getWbsElementTemplateQueryArgs)(organizationId),
            workPackageTemplates: __assign({ where: { wbsElementTemplate: { dateDeleted: null } }, orderBy: { wbsElementTemplate: { dateCreated: 'asc' } } }, (0, exports.getWorkPackageTemplateQueryArgs)(organizationId)),
            teams: __assign({}, (0, teams_query_args_1.getTeamQueryArgs)(organizationId))
        }
    });
};
exports.getProjectTemplateQueryArgs = getProjectTemplateQueryArgs;

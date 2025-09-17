"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDesignReviewPreviewQueryArgs = exports.getDesignReviewQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var getDesignReviewQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            userCreated: (0, user_query_args_1.getUserWithSettingsQueryArgs)(organizationId),
            teamType: true,
            requiredMembers: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            optionalMembers: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            confirmedMembers: (0, user_query_args_1.getUserWithSettingsQueryArgs)(organizationId),
            deniedMembers: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            attendees: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            userDeleted: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            wbsElement: {
                include: {
                    workPackage: {
                        select: { project: { select: { wbsElement: { select: { name: true } } } } }
                    }
                }
            },
            notificationSlackThreads: true
        }
    });
};
exports.getDesignReviewQueryArgs = getDesignReviewQueryArgs;
var getDesignReviewPreviewQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            userCreated: (0, user_query_args_1.getUserWithSettingsQueryArgs)(organizationId)
        }
    });
};
exports.getDesignReviewPreviewQueryArgs = getDesignReviewPreviewQueryArgs;

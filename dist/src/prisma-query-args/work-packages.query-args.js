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
exports.getWorkPackageQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var description_bullets_query_args_1 = require("./description-bullets.query-args");
var design_reviews_query_args_1 = require("./design-reviews.query-args");
var getWorkPackageQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            project: {
                include: {
                    wbsElement: true,
                    teams: {
                        include: {
                            teamType: true
                        }
                    }
                }
            },
            wbsElement: {
                include: {
                    lead: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    manager: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    changes: {
                        where: { changeRequest: { dateDeleted: null } },
                        include: { implementer: (0, user_query_args_1.getUserQueryArgs)(organizationId), changeRequest: true },
                        orderBy: { dateImplemented: 'asc' }
                    },
                    blocking: { where: { wbsElement: { dateDeleted: null } }, include: { wbsElement: true } },
                    descriptionBullets: __assign({ where: { dateDeleted: null } }, (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organizationId)),
                    designReviews: __assign({ where: { dateDeleted: null } }, (0, design_reviews_query_args_1.getDesignReviewPreviewQueryArgs)(organizationId))
                }
            },
            blockedBy: { where: { dateDeleted: null } }
        }
    });
};
exports.getWorkPackageQueryArgs = getWorkPackageQueryArgs;

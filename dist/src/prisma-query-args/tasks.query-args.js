"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var getTaskQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            wbsElement: true,
            createdBy: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            deletedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            assignees: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getTaskQueryArgs = getTaskQueryArgs;

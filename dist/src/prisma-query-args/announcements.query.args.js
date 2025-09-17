"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnouncementQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var getAnnouncementQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            usersReceived: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getAnnouncementQueryArgs = getAnnouncementQueryArgs;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var getVendorQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            twoFactorContacts: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            addedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getVendorQueryArgs = getVendorQueryArgs;

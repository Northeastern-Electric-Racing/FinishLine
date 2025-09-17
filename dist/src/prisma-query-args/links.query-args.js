"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkQueryArgs = void 0;
var client_1 = require("@prisma/client");
var link_types_query_args_1 = require("./link-types.query-args");
var user_query_args_1 = require("./user.query-args");
var getLinkQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: { linkType: (0, link_types_query_args_1.getLinkTypeQueryArgs)(organizationId), creator: (0, user_query_args_1.getUserQueryArgs)(organizationId) }
    });
};
exports.getLinkQueryArgs = getLinkQueryArgs;

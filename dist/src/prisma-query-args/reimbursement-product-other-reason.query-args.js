"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReimbursementProductOtherReasonQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var index_code_query_args_1 = require("./index-code.query-args");
var account_code_query_args_1 = require("./account-code.query-args");
var getReimbursementProductOtherReasonQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            userCreated: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            indexCode: (0, index_code_query_args_1.getIndexCodeQueryArgs)(organizationId),
            accountCodes: (0, account_code_query_args_1.getAccountCodeQueryArgs)(organizationId)
        }
    });
};
exports.getReimbursementProductOtherReasonQueryArgs = getReimbursementProductOtherReasonQueryArgs;

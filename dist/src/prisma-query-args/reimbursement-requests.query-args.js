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
exports.getReimbursementRequestQueryArgs = void 0;
var client_1 = require("@prisma/client");
var reimbursement_statuses_query_args_1 = require("./reimbursement-statuses.query-args");
var vendor_query_args_1 = require("./vendor.query-args");
var user_query_args_1 = require("./user.query-args");
var receipt_query_args_1 = require("./receipt-query.args");
var reimbursement_products_query_args_1 = require("./reimbursement-products.query-args");
var index_code_query_args_1 = require("./index-code.query-args");
var account_code_query_args_1 = require("./account-code.query-args");
var reimbursement_comment_query_args_1 = require("./reimbursement-comment.query-args");
var getReimbursementRequestQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            recipient: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            vendor: (0, vendor_query_args_1.getVendorQueryArgs)(organizationId),
            indexCode: (0, index_code_query_args_1.getIndexCodeQueryArgs)(organizationId),
            accountCode: (0, account_code_query_args_1.getAccountCodeQueryArgs)(organizationId),
            receiptPictures: (0, receipt_query_args_1.getReceiptQueryArgs)(organizationId),
            reimbursementStatuses: (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organizationId),
            reimbursementProducts: __assign({ where: {
                    dateDeleted: null
                } }, (0, reimbursement_products_query_args_1.getReimbursementProductQueryArgs)(organizationId)),
            notificationSlackThreads: true,
            reimbursementComments: __assign({ where: {
                    dateDeleted: null
                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organizationId))
        }
    });
};
exports.getReimbursementRequestQueryArgs = getReimbursementRequestQueryArgs;

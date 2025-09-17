"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReimbursementProductQueryArgs = exports.getRefundSourceQueryArgs = exports.getReimbursementProductReasonQueryArgs = void 0;
var client_1 = require("@prisma/client");
var reimbursement_product_other_reason_query_args_1 = require("./reimbursement-product-other-reason.query-args");
var index_code_query_args_1 = require("./index-code.query-args");
var getReimbursementProductReasonQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            wbsElement: true,
            otherReason: (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organizationId)
        }
    });
};
exports.getReimbursementProductReasonQueryArgs = getReimbursementProductReasonQueryArgs;
var getRefundSourceQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            indexCode: (0, index_code_query_args_1.getIndexCodeQueryArgs)(organizationId)
        }
    });
};
exports.getRefundSourceQueryArgs = getRefundSourceQueryArgs;
var getReimbursementProductQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            refundSources: (0, exports.getRefundSourceQueryArgs)(organizationId),
            reimbursementProductReason: (0, exports.getReimbursementProductReasonQueryArgs)(organizationId)
        }
    });
};
exports.getReimbursementProductQueryArgs = getReimbursementProductQueryArgs;

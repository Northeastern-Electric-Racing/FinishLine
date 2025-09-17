"use strict";
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
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
exports.reimbursementRequestCommentTransformer = exports.otherProductReasonTransformer = exports.indexCodeTransformer = exports.reimbursementTransformer = exports.vendorTransformer = exports.accountCodeTransformer = exports.reimbursementProductTransformer = exports.reimbursementStatusTransformer = exports.reimbursementRequestTransformer = exports.receiptTransformer = void 0;
var utils_1 = require("../utils/utils");
var user_transformer_1 = require("./user.transformer");
var encryption_utils_1 = require("../utils/encryption.utils");
var receiptTransformer = function (receipt) {
    return { receiptId: receipt.receiptId, googleFileId: receipt.googleFileId, name: receipt.name };
};
exports.receiptTransformer = receiptTransformer;
var reimbursementRequestTransformer = function (reimbursementRequest) {
    var _a, _b, _c;
    return {
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
        identifier: reimbursementRequest.identifier,
        saboId: (_a = reimbursementRequest.saboId) !== null && _a !== void 0 ? _a : undefined,
        dateCreated: reimbursementRequest.dateCreated,
        dateOfExpense: (_b = reimbursementRequest.dateOfExpense) !== null && _b !== void 0 ? _b : undefined,
        reimbursementStatuses: reimbursementRequest.reimbursementStatuses.map(exports.reimbursementStatusTransformer),
        recipient: (0, user_transformer_1.userTransformer)(reimbursementRequest.recipient),
        vendor: (0, exports.vendorTransformer)(reimbursementRequest.vendor),
        indexCode: (0, exports.indexCodeTransformer)(reimbursementRequest.indexCode),
        totalCost: reimbursementRequest.totalCost,
        receiptPictures: reimbursementRequest.receiptPictures.filter(function (receipt) { return !receipt.dateDeleted; }).map(exports.receiptTransformer),
        reimbursementProducts: reimbursementRequest.reimbursementProducts.map(exports.reimbursementProductTransformer),
        dateDelivered: (_c = reimbursementRequest.dateDelivered) !== null && _c !== void 0 ? _c : undefined,
        accountCode: (0, exports.accountCodeTransformer)(reimbursementRequest.accountCode),
        comments: reimbursementRequest.reimbursementComments.map(exports.reimbursementRequestCommentTransformer)
    };
};
exports.reimbursementRequestTransformer = reimbursementRequestTransformer;
var reimbursementStatusTransformer = function (reimbursementStatus) {
    return {
        reimbursementStatusId: reimbursementStatus.reimbursementStatusId,
        type: reimbursementStatus.type,
        user: (0, user_transformer_1.userTransformer)(reimbursementStatus.user),
        dateCreated: reimbursementStatus.dateCreated
    };
};
exports.reimbursementStatusTransformer = reimbursementStatusTransformer;
var reimbursementProductTransformer = function (reimbursementProduct) {
    return {
        reimbursementProductId: reimbursementProduct.reimbursementProductId,
        name: reimbursementProduct.name,
        cost: reimbursementProduct.cost,
        reimbursementProductReason: reimbursementProductReasonTransformer(reimbursementProduct.reimbursementProductReason),
        refundSources: reimbursementProduct.refundSources.map(refundSourceTransformer)
    };
};
exports.reimbursementProductTransformer = reimbursementProductTransformer;
var refundSourceTransformer = function (source) {
    return {
        refundSourceId: source.refundSourceId,
        indexCode: (0, exports.indexCodeTransformer)(source.indexCode),
        amount: source.amount
    };
};
var reimbursementProductReasonTransformer = function (reason) {
    return reason.wbsElement
        ? { wbsName: reason.wbsElement.name, wbsNum: (0, utils_1.wbsNumOf)(reason.wbsElement) }
        : {
            otherProductReasonId: reason.otherReason.otherReimbursementProductReasonId,
            name: reason.otherReason.name,
            userCreated: (0, user_transformer_1.userTransformer)(reason.otherReason.userCreated),
            dateCreated: reason.otherReason.dateCreated,
            budget: reason.otherReason.budget,
            indexCode: (0, exports.indexCodeTransformer)(reason.otherReason.indexCode),
            accountCodes: reason.otherReason.accountCodes.map(exports.accountCodeTransformer)
        };
};
var accountCodeTransformer = function (accountCode) {
    var _a;
    return __assign(__assign({}, accountCode), { amount: (_a = accountCode.amount) !== null && _a !== void 0 ? _a : undefined, indexCodes: accountCode.indexCodes.map(exports.indexCodeTransformer) });
};
exports.accountCodeTransformer = accountCodeTransformer;
var vendorTransformer = function (vendor) {
    var _a;
    return __assign(__assign({}, vendor), { password: vendor.password ? (0, encryption_utils_1.decrypt)(vendor.password) : undefined, discountCode: vendor.discountCode ? vendor.discountCode : undefined, username: vendor.username ? vendor.username : undefined, twoFactorContacts: vendor.twoFactorContacts.map(user_transformer_1.userTransformer), notes: (_a = vendor.notes) !== null && _a !== void 0 ? _a : undefined, addedBy: (0, user_transformer_1.userTransformer)(vendor.addedBy) });
};
exports.vendorTransformer = vendorTransformer;
var reimbursementTransformer = function (reimbursement) {
    return {
        reimbursementId: reimbursement.reimbursementId,
        dateCreated: reimbursement.dateCreated,
        amount: reimbursement.amount,
        userSubmitted: (0, user_transformer_1.userTransformer)(reimbursement.userSubmitted)
    };
};
exports.reimbursementTransformer = reimbursementTransformer;
var indexCodeTransformer = function (indexCode) {
    return __assign(__assign({}, indexCode), { userCreated: (0, user_transformer_1.userTransformer)(indexCode.userCreated) });
};
exports.indexCodeTransformer = indexCodeTransformer;
var otherProductReasonTransformer = function (otherProductReason) {
    return {
        otherProductReasonId: otherProductReason.otherReimbursementProductReasonId,
        name: otherProductReason.name,
        userCreated: (0, user_transformer_1.userTransformer)(otherProductReason.userCreated),
        dateCreated: otherProductReason.dateCreated,
        budget: otherProductReason.budget,
        indexCode: (0, exports.indexCodeTransformer)(otherProductReason.indexCode),
        accountCodes: otherProductReason.accountCodes.map(exports.accountCodeTransformer)
    };
};
exports.otherProductReasonTransformer = otherProductReasonTransformer;
var reimbursementRequestCommentTransformer = function (reimbursementRequestComment) {
    return __assign(__assign({}, reimbursementRequestComment), { userCreated: (0, user_transformer_1.userTransformer)(reimbursementRequestComment.userCreated) });
};
exports.reimbursementRequestCommentTransformer = reimbursementRequestCommentTransformer;

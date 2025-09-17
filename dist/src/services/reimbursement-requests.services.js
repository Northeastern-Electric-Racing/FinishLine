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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var client_1 = require("@prisma/client");
var shared_1 = require("shared");
var prisma_1 = require("../prisma/prisma");
var reimbursement_requests_utils_1 = require("../utils/reimbursement-requests.utils");
var errors_utils_1 = require("../utils/errors.utils");
var google_integration_utils_1 = require("../utils/google-integration.utils");
var reimbursement_requests_transformer_1 = require("../transformers/reimbursement-requests.transformer");
var slack_utils_1 = require("../utils/slack.utils");
var users_utils_1 = require("../utils/users.utils");
var reimbursement_requests_query_args_1 = require("../prisma-query-args/reimbursement-requests.query-args");
var reimbursement_query_args_1 = require("../prisma-query-args/reimbursement.query-args");
var reimbursement_statuses_query_args_1 = require("../prisma-query-args/reimbursement-statuses.query-args");
var vendor_query_args_1 = require("../prisma-query-args/vendor.query-args");
var account_code_query_args_1 = require("../prisma-query-args/account-code.query-args");
var index_code_query_args_1 = require("../prisma-query-args/index-code.query-args");
var reimbursement_product_other_reason_query_args_1 = require("../prisma-query-args/reimbursement-product-other-reason.query-args");
var reimbursement_comment_query_args_1 = require("../prisma-query-args/reimbursement-comment.query-args");
var encryption_utils_1 = require("../utils/encryption.utils");
var ReimbursementRequestService = /** @class */ (function () {
    function ReimbursementRequestService() {
    }
    /**
     * Returns all reimbursement requests in the database that are created by the given user and for the currently selected organization.
     * @param recipient The user retrieving their reimbursement requests
     * @param organizationId The organization the user is currently in
     */
    ReimbursementRequestService.getUserReimbursementRequests = function (recipient, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var userReimbursementRequests;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findMany(__assign({ where: { dateDeleted: null, recipientId: recipient.userId, organizationId: organization.organizationId } }, (0, reimbursement_requests_query_args_1.getReimbursementRequestQueryArgs)(organization.organizationId)))];
                    case 1:
                        userReimbursementRequests = _a.sent();
                        return [2 /*return*/, userReimbursementRequests.map(reimbursement_requests_transformer_1.reimbursementRequestTransformer)];
                }
            });
        });
    };
    /**
     * Returns all reimbursement requests in the database that are created by any user in the given user's team and for the currently selected organization.
     * @param recipient The user retrieving their teams reimbursement requests
     * @param organizationId The organization the user is currently in
     */
    ReimbursementRequestService.getUsersTeamsReimbursementRequests = function (recipient, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teams, teamUserIds, teamsReimbursementRequests;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findMany({
                            where: {
                                organizationId: organization.organizationId,
                                OR: [
                                    {
                                        headId: recipient.userId
                                    },
                                    {
                                        leads: {
                                            some: {
                                                userId: recipient.userId
                                            }
                                        }
                                    },
                                    {
                                        members: {
                                            some: {
                                                userId: recipient.userId
                                            }
                                        }
                                    }
                                ]
                            },
                            include: {
                                members: true,
                                leads: true
                            }
                        })];
                    case 1:
                        teams = _a.sent();
                        teamUserIds = new Set();
                        teams.forEach(function (team) {
                            if (team.headId)
                                teamUserIds.add(team.headId);
                            team.leads.forEach(function (lead) { return teamUserIds.add(lead.userId); });
                            team.members.forEach(function (member) { return teamUserIds.add(member.userId); });
                        });
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findMany(__assign({ where: {
                                    dateDeleted: null,
                                    recipientId: { in: Array.from(teamUserIds) },
                                    organizationId: organization.organizationId
                                } }, (0, reimbursement_requests_query_args_1.getReimbursementRequestQueryArgs)(organization.organizationId)))];
                    case 2:
                        teamsReimbursementRequests = _a.sent();
                        return [2 /*return*/, teamsReimbursementRequests.map(reimbursement_requests_transformer_1.reimbursementRequestTransformer)];
                }
            });
        });
    };
    /**
     * Returns all reimbursements in the database that are created by the given user and for the currently selected organization.
     * @param user ther user retrieving the reimbursements
     * @param organizationId the organization the user is currently in
     * @returns all reimbursements for the given user
     */
    ReimbursementRequestService.getUserReimbursements = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var userReimbursements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement.findMany(__assign({ where: { userSubmittedId: user.userId, organizationId: organization.organizationId } }, (0, reimbursement_query_args_1.getReimbursementQueryArgs)(organization.organizationId)))];
                    case 1:
                        userReimbursements = _a.sent();
                        return [2 /*return*/, userReimbursements.map(reimbursement_requests_transformer_1.reimbursementTransformer)];
                }
            });
        });
    };
    /**
     * Returns all the reimbursements in the database
     * @param user The user retrieving all the reimbursements
     * @param organizationId The organization the user is currently in
     * @returns All the reimbursements in the database
     */
    ReimbursementRequestService.getAllReimbursements = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserHeadOrOnFinance)(user, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement.findMany(__assign({ where: {
                                    organizationId: organization.organizationId
                                } }, (0, reimbursement_query_args_1.getReimbursementQueryArgs)(organization.organizationId)))];
                    case 2:
                        reimbursements = _a.sent();
                        return [2 /*return*/, reimbursements.map(reimbursement_requests_transformer_1.reimbursementTransformer)];
                }
            });
        });
    };
    /**
     * Get all the vendors in the database.
     * @param organizationId The organization the user is currently in
     * @returns All the non-deleted vendors
     */
    ReimbursementRequestService.getAllVendors = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var vendors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.vendor.findMany(__assign({ where: { dateDeleted: null, organizationId: organization.organizationId } }, (0, vendor_query_args_1.getVendorQueryArgs)(organization.organizationId)))];
                    case 1:
                        vendors = _a.sent();
                        return [2 /*return*/, vendors.map(reimbursement_requests_transformer_1.vendorTransformer)];
                }
            });
        });
    };
    /**
     * Creates a reimbursement request in the database
     * @param recipient the user who is creating the reimbursement request
     * @param dateOfExpense the date that the expense occured
     * @param vendorId the id of the vendor that the expense was made for
     * @param indexCodeId the id of the index code to be reimbursed from
     * @param reimbursementProducts the products that the user bought
     * @param accountCodeId the id of the account code the user made
     * @param totalCost the total cost of the reimbursement with tax
     * @param organizationId the organization the user is currently in
     * @returns the created reimbursement request
     */
    ReimbursementRequestService.createReimbursementRequest = function (recipient, vendorId, indexCodeId, otherReimbursementProducts, wbsReimbursementProducts, acccountCodeId, totalCost, organization, dateOfExpense) {
        return __awaiter(this, void 0, void 0, function () {
            var vendor, indexCode, accountCode, validatedReimbursementProducts, numReimbursementRequests, createdReimbursementRequest, finalizedReimbursementRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(recipient.userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        if (_a.sent())
                            throw new errors_utils_1.AccessDeniedGuestException('Guests cannot create a reimbursement request');
                        if (!recipient.userSecureSettings)
                            throw new errors_utils_1.HttpException(500, 'User does not have their finance settings set up');
                        return [4 /*yield*/, ReimbursementRequestService.getSingleVendor(vendorId, organization)];
                    case 2:
                        vendor = _a.sent();
                        return [4 /*yield*/, ReimbursementRequestService.getSingleIndexCode(indexCodeId, organization)];
                    case 3:
                        indexCode = _a.sent();
                        return [4 /*yield*/, ReimbursementRequestService.getSingleAccountCode(acccountCodeId, organization)];
                    case 4:
                        accountCode = _a.sent();
                        if (!accountCode.allowed)
                            throw new errors_utils_1.HttpException(400, "The Account Code ".concat(accountCode.name, " is not allowed!"));
                        if (!accountCode.indexCodes.some(function (refundSource) { return refundSource.indexCodeId === indexCodeId; })) {
                            throw new errors_utils_1.HttpException(400, 'The submitted refund source is not allowed to be used with the submitted Account Code');
                        }
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateReimbursementProducts)(otherReimbursementProducts, wbsReimbursementProducts, organization.organizationId)];
                    case 5:
                        validatedReimbursementProducts = _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.count({
                                where: { organizationId: organization.organizationId }
                            })];
                    case 6:
                        numReimbursementRequests = _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.create({
                                data: {
                                    recipient: { connect: { userId: recipient.userId } },
                                    dateOfExpense: dateOfExpense !== null && dateOfExpense !== void 0 ? dateOfExpense : null,
                                    vendor: { connect: { vendorId: vendor.vendorId } },
                                    indexCode: { connect: { indexCodeId: indexCode.indexCodeId } },
                                    accountCode: { connect: { accountCodeId: accountCode.accountCodeId } },
                                    totalCost: totalCost,
                                    reimbursementStatuses: {
                                        create: {
                                            type: shared_1.ReimbursementStatusType.PENDING_LEADERSHIP_APPROVAL,
                                            userId: recipient.userId
                                        }
                                    },
                                    identifier: numReimbursementRequests + 1,
                                    organization: { connect: { organizationId: organization.organizationId } }
                                }
                            })];
                    case 7:
                        createdReimbursementRequest = _a.sent();
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.createReimbursementProducts)(validatedReimbursementProducts.validatedOtherReimbursementProducts, validatedReimbursementProducts.validatedWbsReimbursementProducts, createdReimbursementRequest.reimbursementRequestId)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendReimbursementRequestCreatedNotificationAndCreateMessageInfo)(createdReimbursementRequest.reimbursementRequestId, createdReimbursementRequest.identifier, recipient.userId, organization.organizationId)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique(__assign({ where: {
                                    reimbursementRequestId: createdReimbursementRequest.reimbursementRequestId
                                } }, (0, reimbursement_requests_query_args_1.getReimbursementRequestQueryArgs)(organization.organizationId)))];
                    case 10:
                        finalizedReimbursementRequest = _a.sent();
                        if (!finalizedReimbursementRequest)
                            throw new errors_utils_1.HttpException(500, 'Unable to retrieve created reimbursement request');
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementRequestTransformer)(finalizedReimbursementRequest)];
                }
            });
        });
    };
    /**
     * Function to reimburse a user for their expenses.
     *
     * @param amount the amount to be reimbursed
     * @param dateReceived the date the amount was received
     * @param submitter the person performing the reimbursement
     * @param organizationId the organization the user is currently in
     * @returns the created reimbursement
     */
    ReimbursementRequestService.reimburseUser = function (amount, dateReceived, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var dateCreated, newReimbursement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        if (_a.sent()) {
                            throw new errors_utils_1.AccessDeniedException('Guests cannot reimburse a user for their expenses.');
                        }
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateRefund)(submitter, amount, organization.organizationId)];
                    case 2:
                        _a.sent();
                        dateCreated = new Date(dateReceived.split('T')[0]);
                        dateCreated.setTime(dateCreated.getTime() + 12 * 60 * 60 * 1000);
                        return [4 /*yield*/, prisma_1.default.reimbursement.create(__assign({ data: {
                                    purchaserId: submitter.userId,
                                    amount: amount,
                                    dateCreated: dateReceived,
                                    userSubmittedId: submitter.userId,
                                    organizationId: organization.organizationId
                                } }, (0, reimbursement_query_args_1.getReimbursementQueryArgs)(organization.organizationId)))];
                    case 3:
                        newReimbursement = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementTransformer)(newReimbursement)];
                }
            });
        });
    };
    /**
     * Edits the given reimbursement Request
     *
     * @param requestId the id of the reimbursement request we are editing
     * @param dateOfExpense the updated date of expense
     * @param vendorId the updated vendor id
     * @param indexCodeId the updated index code id
     * @param accountCodeId the updated account code id
     * @param totalCost the updated total cost
     * @param reimbursementProducts the updated reimbursement products
     * @param saboId the updated saboId
     * @param receiptPictures the old receipts that haven't been deleted (new receipts must be separately uploaded)
     * @param submitter the person editing the reimbursement request
     * @param organizationId the organization the user is currently in
     * @returns the edited reimbursement request
     */
    ReimbursementRequestService.editReimbursementRequest = function (requestId, vendorId, indexCodeId, accountCodeId, totalCost, otherReimbursementProducts, wbsReimbursementProducts, receiptPictures, submitter, organization, dateOfExpense) {
        return __awaiter(this, void 0, void 0, function () {
            var oldReimbursementRequest, vendor, accountCode, updatedReimbursementRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: requestId },
                            include: {
                                reimbursementProducts: true,
                                receiptPictures: true,
                                accountCode: true,
                                reimbursementStatuses: true
                            }
                        })];
                    case 1:
                        oldReimbursementRequest = _a.sent();
                        if (!oldReimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', requestId);
                        if (oldReimbursementRequest.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Request', requestId);
                        if (oldReimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserEditRRPermissions)(submitter, oldReimbursementRequest, organization.organizationId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, ReimbursementRequestService.getSingleVendor(vendorId, organization)];
                    case 3:
                        vendor = _a.sent();
                        return [4 /*yield*/, ReimbursementRequestService.getSingleAccountCode(accountCodeId, organization)];
                    case 4:
                        accountCode = _a.sent();
                        if (!accountCode.allowed)
                            throw new errors_utils_1.HttpException(400, 'Account Code Not Allowed');
                        if (!accountCode.indexCodes.some(function (refundSource) { return refundSource.indexCodeId === indexCodeId; })) {
                            throw new errors_utils_1.HttpException(400, 'The submitted refund source is not allowed to be used with the submitted Account Code');
                        }
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.updateReimbursementProducts)(oldReimbursementRequest.reimbursementProducts, otherReimbursementProducts, wbsReimbursementProducts, oldReimbursementRequest.reimbursementRequestId, organization.organizationId)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.update({
                                where: { reimbursementRequestId: oldReimbursementRequest.reimbursementRequestId },
                                data: {
                                    dateOfExpense: dateOfExpense !== null && dateOfExpense !== void 0 ? dateOfExpense : null,
                                    indexCodeId: indexCodeId,
                                    totalCost: totalCost,
                                    accountCodeId: accountCode.accountCodeId,
                                    vendorId: vendor.vendorId
                                }
                            })];
                    case 6:
                        updatedReimbursementRequest = _a.sent();
                        //set any deleted receipts with a dateDeleted
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.removeDeletedReceiptPictures)(receiptPictures, oldReimbursementRequest.receiptPictures || [], submitter)];
                    case 7:
                        //set any deleted receipts with a dateDeleted
                        _a.sent();
                        return [2 /*return*/, updatedReimbursementRequest];
                }
            });
        });
    };
    /**
     * Edits the given reimbursement
     * @param reimbursementId The id of the reimbursement to be edited
     * @param editor The user editing the reimbursement
     * @param amount The new amount of the reimbursement
     * @param dateCreated The new date the reimbursement was created
     * @param organizationId The organization the user is currently in
     * @returns The updated reimbursement
     */
    ReimbursementRequestService.editReimbursement = function (reimbursementId, editor, amount, dateCreated, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var request, difference, updatedReimbursement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement.findUnique({
                            where: { reimbursementId: reimbursementId }
                        })];
                    case 1:
                        request = _a.sent();
                        if (!request)
                            throw new errors_utils_1.NotFoundException('Reimbursement', reimbursementId);
                        if (request.userSubmittedId !== editor.userId)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to edit this refund, only the submitter can edit their refund');
                        if (request.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement');
                        difference = amount - request.amount;
                        if (!(difference > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateRefund)(editor, difference, organization.organizationId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, prisma_1.default.reimbursement.update({
                            where: { reimbursementId: reimbursementId },
                            data: { dateCreated: dateCreated, amount: amount }
                        })];
                    case 4:
                        updatedReimbursement = _a.sent();
                        return [2 /*return*/, updatedReimbursement];
                }
            });
        });
    };
    /**
     * Soft-deletes the given reimbursement request
     *
     * @param requestId the reimbursement request to be deleted
     * @param submitter the user deleting the reimbursement request
     * @param organizationId the organization the user is currently in
     */
    ReimbursementRequestService.deleteReimbursementRequest = function (requestId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var request, _a, deletedRequest;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: requestId },
                            include: {
                                reimbursementStatuses: true
                            }
                        })];
                    case 1:
                        request = _b.sent();
                        if (!request)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', requestId);
                        if (request.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        if (request.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Request', requestId);
                        if (request.reimbursementStatuses.some(function (reimbursementStatus) { return reimbursementStatus.type === client_1.Reimbursement_Status_Type.SABO_SUBMITTED; }))
                            throw new errors_utils_1.AccessDeniedException('You cannot delete this reimbursement request. It has already been approved');
                        _a = request.recipientId !== submitter.userId;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserLeadOrHeadOfFinanceTeam)(submitter, organization.organizationId)];
                    case 2:
                        _a = !(_b.sent());
                        _b.label = 3;
                    case 3:
                        if (_a)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to delete this reimbursement request, reimbursement requests can only be deleted by their creator or finance leads and above');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.update({
                                where: { reimbursementRequestId: requestId },
                                data: { dateDeleted: new Date() }
                            })];
                    case 4:
                        deletedRequest = _b.sent();
                        return [2 /*return*/, deletedRequest];
                }
            });
        });
    };
    /**
     * Returns all reimbursement requests that do not have an advisor approved reimbursement status.
     * @param requester the user requesting the reimbursement requests
     * @param organizationId the organization the user is currently in
     * @returns reimbursement requests with no advisor approved reimbursement status
     */
    ReimbursementRequestService.getPendingAdvisorList = function (requester, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var requestsPendingAdvisors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(requester, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findMany(__assign({ where: {
                                    saboId: { not: null },
                                    reimbursementStatuses: {
                                        some: {
                                            type: client_1.Reimbursement_Status_Type.SABO_SUBMITTED
                                        },
                                        none: {
                                            type: client_1.Reimbursement_Status_Type.ADVISOR_APPROVED
                                        }
                                    },
                                    accountCode: { organizationId: organization.organizationId }
                                } }, (0, reimbursement_requests_query_args_1.getReimbursementRequestQueryArgs)(organization.organizationId)))];
                    case 2:
                        requestsPendingAdvisors = _a.sent();
                        return [2 /*return*/, requestsPendingAdvisors.map(reimbursement_requests_transformer_1.reimbursementRequestTransformer)];
                }
            });
        });
    };
    /**
     * sends the pending advisor reimbursements to the advisor
     * @param sender the person sending the pending advisor list
     * @param saboNumbers the sabo numbers of the reimbursement requests to send
     * @param organizationId the organization the user is currently in
     */
    ReimbursementRequestService.sendPendingAdvisorList = function (sender, saboNumbers, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var organization, reimbursementRequests, saboNumbersNotFound, deletedReimbursementRequests, saboNumbersDeleted, reimbursementRequestsNotInOrganization, mailOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.organization.findUnique({
                            where: { organizationId: organizationId },
                            include: { advisor: true }
                        })];
                    case 1:
                        organization = _a.sent();
                        if (!organization)
                            throw new errors_utils_1.NotFoundException('Organization', organizationId);
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(sender, organizationId)];
                    case 2:
                        _a.sent();
                        if (saboNumbers.length === 0)
                            throw new errors_utils_1.HttpException(400, 'Need to send at least one Sabo #!');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findMany({
                                where: {
                                    saboId: {
                                        in: saboNumbers
                                    }
                                }
                            })];
                    case 3:
                        reimbursementRequests = _a.sent();
                        if (reimbursementRequests.length < saboNumbers.length) {
                            saboNumbersNotFound = saboNumbers.filter(function (saboNumber) {
                                return !reimbursementRequests.some(function (reimbursementRequest) { return reimbursementRequest.saboId === saboNumber; });
                            });
                            throw new errors_utils_1.HttpException(400, "The following sabo numbers do not exist: ".concat(saboNumbersNotFound.join(', ')));
                        }
                        deletedReimbursementRequests = reimbursementRequests.filter(function (reimbursementRequest) { return reimbursementRequest.dateDeleted; });
                        if (deletedReimbursementRequests.length > 0) {
                            saboNumbersDeleted = deletedReimbursementRequests.map(function (reimbursementRequest) { return reimbursementRequest.saboId; });
                            throw new errors_utils_1.HttpException(400, "The following reimbursement requests with these sabo numbers have been deleted: ".concat(saboNumbersDeleted.join(', ')));
                        }
                        reimbursementRequestsNotInOrganization = reimbursementRequests.filter(function (reimbursementRequest) { return reimbursementRequest.organizationId !== organization.organizationId; });
                        if (reimbursementRequestsNotInOrganization.length > 0)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        mailOptions = {
                            subject: 'Reimbursement Requests To Be Approved By Advisor',
                            text: "The following reimbursement requests need to be approved by you: ".concat(saboNumbers.join(', '))
                        };
                        if (!organization.advisor)
                            throw new errors_utils_1.HttpException(400, 'Organization does not have an advisor');
                        return [4 /*yield*/, (0, google_integration_utils_1.sendMailToAdvisor)(mailOptions.subject, mailOptions.text, organization.advisor)];
                    case 4:
                        _a.sent();
                        reimbursementRequests.forEach(function (reimbursementRequest) {
                            prisma_1.default.reimbursement_Status.create({
                                data: {
                                    type: client_1.Reimbursement_Status_Type.ADVISOR_APPROVED,
                                    userId: sender.userId,
                                    reimbursementRequestId: reimbursementRequest.reimbursementRequestId
                                }
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the given reimbursement request with the given sabo number
     *
     * @param reimbursementRequestId The id of the reimbursement request to add the sabo number to
     * @param saboNumber the sabo number you are adding to the reimbursement request
     * @param submitter the person adding the sabo number
     * @param organizationId the organization the user is currently in
     * @returns the reimbursement request with the sabo number
     */
    ReimbursementRequestService.setSaboNumber = function (reimbursementRequestId, saboNumber, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, reimbursementRequestWithSaboNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                                where: { reimbursementRequestId: reimbursementRequestId }
                            })];
                    case 2:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.update({
                                where: { reimbursementRequestId: reimbursementRequestId },
                                data: {
                                    saboId: saboNumber
                                }
                            })];
                    case 3:
                        reimbursementRequestWithSaboNumber = _a.sent();
                        return [2 /*return*/, reimbursementRequestWithSaboNumber];
                }
            });
        });
    };
    /**
     * Function to create a vendor in our database
     * @param submitter user creating the vendor
     * @param name vendor name
     * @param organization current organziation
     * @param username vendor username
     * @param password vendor password
     * @param notes vendor notes
     * @param addedByUserId userId that added the vendor
     * @param twoFactorContacts two-factor contact ids
     * @param discountCode vendor discount code
     * @returns
     */
    ReimbursementRequestService.createVendor = function (submitter, name, organization, taxExempt, twoFactorContacts, notes, username, password, discountCode) {
        return __awaiter(this, void 0, void 0, function () {
            var isAuthorized, _a, existingVendor, twoFactorContactUsers, vendor;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserLeadOrHeadOfFinanceTeam)(submitter, organization.organizationId)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        isAuthorized = _a;
                        if (!isAuthorized)
                            throw new errors_utils_1.AccessDeniedException('Only admins, finance leads, and finance heads can create vendors.');
                        return [4 /*yield*/, prisma_1.default.vendor.findUnique(__assign({ where: { uniqueVendor: { name: name, organizationId: organization.organizationId } } }, (0, vendor_query_args_1.getVendorQueryArgs)(organization.organizationId)))];
                    case 4:
                        existingVendor = _b.sent();
                        if (!(existingVendor && existingVendor.dateDeleted)) return [3 /*break*/, 6];
                        return [4 /*yield*/, prisma_1.default.vendor.update({
                                where: { vendorId: existingVendor.vendorId },
                                data: { dateDeleted: null }
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, existingVendor];
                    case 6:
                        if (existingVendor)
                            throw new errors_utils_1.HttpException(400, 'This vendor already exists');
                        _b.label = 7;
                    case 7: return [4 /*yield*/, (0, users_utils_1.getUsers)(twoFactorContacts)];
                    case 8:
                        twoFactorContactUsers = _b.sent();
                        return [4 /*yield*/, prisma_1.default.vendor.create(__assign({ data: {
                                    name: name,
                                    organizationId: organization.organizationId,
                                    username: username,
                                    password: password ? (0, encryption_utils_1.encrypt)(password) : undefined,
                                    taxExempt: taxExempt,
                                    discountCode: discountCode,
                                    twoFactorContacts: { connect: twoFactorContactUsers.map(function (user) { return ({ userId: user.userId }); }) },
                                    notes: notes,
                                    addedByUserId: submitter.userId
                                } }, (0, vendor_query_args_1.getVendorQueryArgs)(organization.organizationId)))];
                    case 9:
                        vendor = _b.sent();
                        return [2 /*return*/, vendor];
                }
            });
        });
    };
    /**
     * Service function to create an account code in our database
     * @param submitter user who is creating the Account Code
     * @param name The name of the Account Code
     * @param code the Account Code's SABO code
     * @param allowed whether or not this Account Code is allowed
     * @param indexCodeIds an array of index code ids representing allowed refund sources
     * @param organizationId the organization the user is currently in
     * @param amount the monetary amount in cents for the Account Code
     * @returns the created Account Code
     */
    ReimbursementRequestService.createAccountCode = function (submitter, name, code, allowed, indexCodeIds, organization, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var existingAccount, updatedExistingAccount, expense;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('create Account Codes');
                        return [4 /*yield*/, prisma_1.default.account_Code.findUnique({
                                where: { uniqueExpenseType: { name: name, organizationId: organization.organizationId } }
                            })];
                    case 2:
                        existingAccount = _a.sent();
                        if (!(existingAccount && existingAccount.dateDeleted)) return [3 /*break*/, 4];
                        return [4 /*yield*/, prisma_1.default.account_Code.update(__assign({ where: { accountCodeId: existingAccount.accountCodeId }, data: { dateDeleted: null } }, (0, account_code_query_args_1.getAccountCodeQueryArgs)(organization.organizationId)))];
                    case 3:
                        updatedExistingAccount = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.accountCodeTransformer)(updatedExistingAccount)];
                    case 4:
                        if (existingAccount)
                            throw new errors_utils_1.HttpException(400, 'This Account Code already exists');
                        _a.label = 5;
                    case 5: return [4 /*yield*/, prisma_1.default.account_Code.create(__assign({ data: {
                                name: name,
                                allowed: allowed,
                                code: code,
                                amount: amount,
                                indexCodes: { connect: indexCodeIds.map(function (id) { return ({ indexCodeId: id }); }) },
                                organizationId: organization.organizationId
                            } }, (0, account_code_query_args_1.getAccountCodeQueryArgs)(organization.organizationId)))];
                    case 6:
                        expense = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.accountCodeTransformer)(expense)];
                }
            });
        });
    };
    /**
     * Edits an Account Code
     * @param accountCodeId the requested account code to be edited
     * @param code the new Account Code code number
     * @param name the new Account Code code name
     * @param allowed the new Account Code allowed value
     * @param submitter the person editing account code code number
     * @param indexCodeIds the new allowed refund sources
     * @param orgainzationId the organization the user is currently in
     * @param amount the monetary amount in dollars for the Account Code
     * @returns the updated account code
     */
    ReimbursementRequestService.editAccountCode = function (accountCodeId, code, name, allowed, submitter, indexCodeIds, organization, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCode, accountCodeUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isHead)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('Only the head or admin can update account code number and name');
                        return [4 /*yield*/, ReimbursementRequestService.getSingleAccountCode(accountCodeId, organization)];
                    case 2:
                        accountCode = _a.sent();
                        return [4 /*yield*/, prisma_1.default.account_Code.update(__assign({ where: { accountCodeId: accountCode.accountCodeId }, data: {
                                    name: name,
                                    code: code,
                                    allowed: allowed,
                                    amount: amount !== null && amount !== void 0 ? amount : null,
                                    indexCodes: { set: indexCodeIds.map(function (id) { return ({ indexCodeId: id }); }) }
                                } }, (0, account_code_query_args_1.getAccountCodeQueryArgs)(organization.organizationId)))];
                    case 3:
                        accountCodeUpdated = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.accountCodeTransformer)(accountCodeUpdated)];
                }
            });
        });
    };
    /**
     * Deletes the Account Code with the given id
     *
     * @param accountCodeId the requested account code to be deleted
     * @param submitter the user deleting the account code
     * @param organizationId the organization the user is currently in
     * @returns the 'deleted' account code
     */
    ReimbursementRequestService.deleteAccountCode = function (accountCodeId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCode, deletedAccountCode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserHeadOrOnFinance)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ReimbursementRequestService.getSingleAccountCode(accountCodeId, organization)];
                    case 2:
                        accountCode = _a.sent();
                        return [4 /*yield*/, prisma_1.default.account_Code.update(__assign({ where: { accountCodeId: accountCode.accountCodeId }, data: { dateDeleted: new Date() } }, (0, account_code_query_args_1.getAccountCodeQueryArgs)(organization.organizationId)))];
                    case 3:
                        deletedAccountCode = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.accountCodeTransformer)(deletedAccountCode)];
                }
            });
        });
    };
    /**
     * Service function to upload a picture to the receipts folder in the NER google drive
     * @param reimbursementRequestId id for the reimbursement request we're tying the receipt to
     * @param file The file data for the image
     * @param submitter user who is uploading the receipt
     * @param organizationId the organization the user is currently in
     * @returns the google drive id for the file
     */
    ReimbursementRequestService.uploadReceipt = function (reimbursementRequestId, file, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, numReceipts, _a, imageData, comment, receipt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        if (_b.sent())
                            throw new errors_utils_1.AccessDeniedGuestException('Guests cannot upload receipts');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                                where: { reimbursementRequestId: reimbursementRequestId }
                            })];
                    case 2:
                        reimbursementRequest = _b.sent();
                        return [4 /*yield*/, prisma_1.default.receipt.count({
                                where: { reimbursementRequest: { organizationId: organization.organizationId } }
                            })];
                    case 3:
                        numReceipts = _b.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        _a = reimbursementRequest.recipientId !== submitter.userId;
                        if (!_a) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserLeadOrHeadOfFinanceTeam)(submitter, organization.organizationId)];
                    case 4:
                        _a = !(_b.sent());
                        _b.label = 5;
                    case 5:
                        if (_a) {
                            throw new errors_utils_1.AccessDeniedException('You do not have access to upload a receipt for this reimbursement request, only the creator or a finance lead can edit a reimbursement request');
                        }
                        file.filename = 'receipt' + numReceipts;
                        return [4 /*yield*/, (0, google_integration_utils_1.uploadFile)(file)];
                    case 6:
                        imageData = _b.sent();
                        if (!(imageData === null || imageData === void 0 ? void 0 : imageData.name)) {
                            throw new errors_utils_1.HttpException(500, 'Image Name not found');
                        }
                        comment = "".concat(submitter.firstName, "  ").concat(submitter.lastName, " Uploaded Receipt");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, prisma_1.default.receipt.create({
                                data: {
                                    googleFileId: imageData.id,
                                    name: imageData.name,
                                    reimbursementRequestId: reimbursementRequestId,
                                    createdByUserId: submitter.userId
                                }
                            })];
                    case 8:
                        receipt = _b.sent();
                        return [2 /*return*/, receipt];
                }
            });
        });
    };
    /**
     * Gets all the account codes for the given organization
     * @param organizationId The organization the user is currently in
     * @returns The account codes for the given organization
     */
    ReimbursementRequestService.getAllAccountCodes = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCodes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.account_Code.findMany(__assign({ where: {
                                dateDeleted: null,
                                organizationId: organization.organizationId
                            } }, (0, account_code_query_args_1.getAccountCodeQueryArgs)(organization.organizationId)))];
                    case 1:
                        accountCodes = _a.sent();
                        return [2 /*return*/, accountCodes.map(reimbursement_requests_transformer_1.accountCodeTransformer)];
                }
            });
        });
    };
    /**
     * Gets all the reimbursement requests from the database that have no dateDeleted and are in the organization the user is currently in
     * @param user the user getting the reimbursement requests
     * @param organizationId the organization the user is currently in
     * @returns an array of the prisma version of the reimbursement requests transformed to the shared version
     */
    ReimbursementRequestService.getAllReimbursementRequests = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequests;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserHeadOrOnFinance)(user, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findMany(__assign({ where: { dateDeleted: null, accountCode: { organizationId: organization.organizationId } } }, (0, reimbursement_requests_query_args_1.getReimbursementRequestQueryArgs)(organization.organizationId)))];
                    case 2:
                        reimbursementRequests = _a.sent();
                        return [2 /*return*/, reimbursementRequests.map(reimbursement_requests_transformer_1.reimbursementRequestTransformer)];
                }
            });
        });
    };
    /**
     * Service function to mark a reimbursement request as delivered
     * @param submitter The User marking the request as delivered
     * @param requestId The ID of the reimbursement request to be marked as delivered
     * @param organizationId The organization the user is currently in
     * @param dateDelivered The date the reimbursed items were delivered
     * @throws NotFoundException if the id is invalid or not there
     * @throws AccessDeniedException if the creator of the request is not the submitter
     * @returns the updated reimbursement request
     */
    ReimbursementRequestService.markReimbursementRequestAsDelivered = function (submitter, reimbursementRequestId, organization, dateDelivered) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, comment, reimbursementRequestDelivered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: reimbursementRequestId }
                        })];
                    case 1:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDelivered)
                            throw new errors_utils_1.AccessDeniedException('Can only be marked as delivered once');
                        if (submitter.userId !== reimbursementRequest.recipientId)
                            throw new errors_utils_1.AccessDeniedException('Only the creator of the reimbursement request can mark as delivered');
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        if (reimbursementRequest.dateOfExpense && (0, shared_1.startOfDay)(dateDelivered) < (0, shared_1.startOfDay)(reimbursementRequest.dateOfExpense))
                            throw new errors_utils_1.HttpException(400, 'Items cannot be delivered before the expense date.');
                        if ((0, shared_1.startOfDay)(dateDelivered) > (0, shared_1.startOfDay)(new Date()))
                            throw new errors_utils_1.HttpException(400, 'Delivery date cannot be in the future.');
                        comment = "".concat(submitter.firstName, "  ").concat(submitter.lastName, " Marked As Delivered");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.update({
                                where: { reimbursementRequestId: reimbursementRequestId },
                                data: { dateDelivered: dateDelivered }
                            })];
                    case 3:
                        reimbursementRequestDelivered = _a.sent();
                        return [2 /*return*/, reimbursementRequestDelivered];
                }
            });
        });
    };
    /**
     * Adds a reimbursement status with type reimbursed to the given reimbursement request
     *
     * @param reimbursementRequestId the id of the reimbursement request to mark reimbursed
     * @param submitter the user who is marking the reimbursement request as reimbursed
     * @param organizationId the organization the user is currently in
     * @throws AccessDeniedException if the submitter of the request is not on the finance team
     * @throws HttpException if the finance team does not exist
     * @throws NotFoundException if the id is invalid or not there
     * @throws HttpException if the reimbursement request is already marked as reimbursed or has been denied
     * @returns the created reimbursment status
     */
    ReimbursementRequestService.markReimbursementRequestAsReimbursed = function (reimbursementRequestId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, comment, reimbursementStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                                where: { reimbursementRequestId: reimbursementRequestId },
                                include: {
                                    reimbursementStatuses: true
                                }
                            })];
                    case 2:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.REIMBURSED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been marked as reimbursed');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.DENIED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been denied');
                        }
                        comment = "".concat(submitter.firstName, "  ").concat(submitter.lastName, " Marked As Reimbursed");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Status.create(__assign({ data: {
                                    type: shared_1.ReimbursementStatusType.REIMBURSED,
                                    userId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequest.reimbursementRequestId
                                } }, (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organization.organizationId)))];
                    case 4:
                        reimbursementStatus = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementStatusTransformer)(reimbursementStatus)];
                }
            });
        });
    };
    /**
     * Gets a single reimbursement request for the given id
     * @param user the user getting the reimbursement request
     * @param reimbursementRequestId the id of thereimbursement request to get
     * @param organizationId the organization the user is currently in
     * @returns the reimbursement request with the given id
     */
    ReimbursementRequestService.getSingleReimbursementRequest = function (user, reimbursementRequestId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique(__assign({ where: { reimbursementRequestId: reimbursementRequestId } }, (0, reimbursement_requests_query_args_1.getReimbursementRequestQueryArgs)(organization.organizationId)))];
                    case 1:
                        reimbursementRequest = _b.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(user, organization.organizationId)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        if (user.userId !== reimbursementRequest.recipientId)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to this reimbursement request');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementRequestTransformer)(reimbursementRequest)];
                }
            });
        });
    };
    /**
     * Adds a reimbursement status with type pending finance to the given reimbursement request
     *
     * @param reimbursementRequestId The id of the reimbursement request to approve
     * @param submitter The person approving the reimbursement request
     * @param organizationId The organization the user is currently in
     * @returns The Pending Finance reimbursement status
     */
    ReimbursementRequestService.leadershipApproveReimbursementRequest = function (reimbursementRequestId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, comment, reimbursementStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isHead)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('Only a head or admin can approve reimbursement requests');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                                where: { reimbursementRequestId: reimbursementRequestId },
                                include: {
                                    reimbursementStatuses: true,
                                    notificationSlackThreads: true
                                }
                            })];
                    case 2:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        if (reimbursementRequest.reimbursementStatuses.some(function (reimbursementStatus) { return reimbursementStatus.type === client_1.Reimbursement_Status_Type.PENDING_FINANCE; }))
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been approved by leadership');
                        comment = "".concat(submitter.firstName, "  ").concat(submitter.lastName, " Leadership Approved");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Status.create(__assign({ data: {
                                    type: shared_1.ReimbursementStatusType.LEADERSHIP_APPROVED,
                                    userId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequest.reimbursementRequestId
                                } }, (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organization.organizationId)))];
                    case 4:
                        reimbursementStatus = _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendReimbursementRequestLeadershipApprovedNotification)(reimbursementRequest.notificationSlackThreads)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementStatusTransformer)(reimbursementStatus)];
                }
            });
        });
    };
    /**
     * Adds a reimbursement status with type sabo submitted to the given reimbursement request
     *
     * @param reimbursementRequestId the id of the reimbursement request to approve
     * @param submitter the user who is approving the reimbursement request
     * @param organizationId the organization the user is currently in
     * @returns the created reimbursment status
     */
    ReimbursementRequestService.approveReimbursementRequest = function (reimbursementRequestId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, comment, reimbursementStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                                where: { reimbursementRequestId: reimbursementRequestId },
                                include: {
                                    reimbursementStatuses: true,
                                    notificationSlackThreads: true
                                }
                            })];
                    case 2:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        if (!reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.PENDING_FINANCE; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has not been approved by leadership');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.SABO_SUBMITTED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been approved');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.DENIED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been denied');
                        }
                        comment = "".concat(submitter.firstName, "  ").concat(submitter.lastName, " Submitted To SABO");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Status.create(__assign({ data: {
                                    type: shared_1.ReimbursementStatusType.SABO_SUBMITTED,
                                    userId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequest.reimbursementRequestId
                                } }, (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organization.organizationId)))];
                    case 4:
                        reimbursementStatus = _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendSubmittedToSaboNotification)(reimbursementRequest.notificationSlackThreads)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementStatusTransformer)(reimbursementStatus)];
                }
            });
        });
    };
    /**
     * Adds a reimbursement status with type denied to the given reimbursement request
     *
     * @param reimbursementRequestId the id of the reimbursement request to deny
     * @param submitter the user who is denying the reimbursement request
     * @param organization the organization the user is currently in
     * @returns the created reimbursment status
     */
    ReimbursementRequestService.denyReimbursementRequest = function (reimbursementRequestId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, comment, reimbursementStatus, recipientSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: reimbursementRequestId },
                            include: {
                                reimbursementStatuses: true
                            }
                        })];
                    case 1:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.DENIED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been denied');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.REIMBURSED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been reimbursed');
                        }
                        if (!(submitter.userId !== reimbursementRequest.recipientId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(submitter, organization.organizationId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        comment = "".concat(submitter.firstName, "  ").concat(submitter.lastName, " Denied This Request");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Status.create(__assign({ data: {
                                    type: shared_1.ReimbursementStatusType.DENIED,
                                    userId: submitter.userId,
                                    reimbursementRequestId: reimbursementRequest.reimbursementRequestId
                                } }, (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organization.organizationId)))];
                    case 5:
                        reimbursementStatus = _a.sent();
                        return [4 /*yield*/, prisma_1.default.user_Settings.findUnique({
                                where: { userId: reimbursementRequest.recipientId }
                            })];
                    case 6:
                        recipientSettings = _a.sent();
                        if (!recipientSettings)
                            throw new errors_utils_1.HttpException(400, 'Reimbursement Request successfully updated, however no slack message was sent as recipient is missing their settings!');
                        return [4 /*yield*/, (0, slack_utils_1.sendReimbursementRequestDeniedNotification)(recipientSettings.slackId, reimbursementRequestId)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementStatusTransformer)(reimbursementStatus)];
                }
            });
        });
    };
    /**
     * Downloads the receipt image file with the given google file id
     *
     * @param fileId the google file id of the receipt image
     * @param submitter the user who is downloading the receipt image
     * @param organizationId the organization the user is currently in
     * @returns a buffer of the image data and the image type
     */
    ReimbursementRequestService.downloadReceiptImage = function (fileId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var fileData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, google_integration_utils_1.downloadFile)(fileId)];
                    case 2:
                        fileData = _a.sent();
                        if (!fileData)
                            throw new errors_utils_1.NotFoundException('Image File', fileId);
                        return [2 /*return*/, fileData];
                }
            });
        });
    };
    /**
     * Edits the vendor name
     *
     * @param name the new vendor name
     * @param vendorId the requested vendor to be edited
     * @param submitter the user editing the vendor name
     * @param organizationId the organization the user is currently in
     * @returns the updated vendor
     */
    ReimbursementRequestService.editVendor = function (name, vendorId, username, password, discountCode, taxExempt, twoFactorContacts, notes, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var users, existingVendor, existingContactIds, newContactIds, vendor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserHeadOrOnFinance)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(twoFactorContacts)];
                    case 2:
                        users = _a.sent();
                        return [4 /*yield*/, prisma_1.default.vendor.findUnique({
                                where: { vendorId: vendorId },
                                select: { twoFactorContacts: { select: { userId: true } } }
                            })];
                    case 3:
                        existingVendor = _a.sent();
                        if (!existingVendor) {
                            throw new errors_utils_1.NotFoundException('Vendor', vendorId);
                        }
                        existingContactIds = (existingVendor === null || existingVendor === void 0 ? void 0 : existingVendor.twoFactorContacts.map(function (contact) { return ({ userId: contact.userId }); })) || [];
                        newContactIds = users.map(function (user) { return ({ userId: user.userId }); });
                        return [4 /*yield*/, prisma_1.default.vendor.update(__assign({ where: { vendorId: vendorId }, data: {
                                    name: name,
                                    organizationId: organization.organizationId,
                                    username: username,
                                    password: password ? (0, encryption_utils_1.encrypt)(password) : undefined,
                                    taxExempt: taxExempt,
                                    discountCode: discountCode,
                                    twoFactorContacts: {
                                        disconnect: existingContactIds,
                                        connect: newContactIds
                                    },
                                    notes: notes
                                } }, (0, vendor_query_args_1.getVendorQueryArgs)(organization.organizationId)))];
                    case 4:
                        vendor = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.vendorTransformer)(vendor)];
                }
            });
        });
    };
    /**
     * Deletes the vendor
     *
     * @param vendorId the requested vendor to be deleted
     * @param submitter the user deleting the vendor
     * @param organizationId the organization the user is currently in
     * @returns the 'deleted' vendor
     */
    ReimbursementRequestService.deleteVendor = function (vendorId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var vendor, deletedVendor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserHeadOrOnFinance)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ReimbursementRequestService.getSingleVendor(vendorId, organization)];
                    case 2:
                        vendor = _a.sent();
                        return [4 /*yield*/, prisma_1.default.vendor.update(__assign({ where: { vendorId: vendor.vendorId }, data: { dateDeleted: new Date() } }, (0, vendor_query_args_1.getVendorQueryArgs)(organization.organizationId)))];
                    case 3:
                        deletedVendor = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.vendorTransformer)(deletedVendor)];
                }
            });
        });
    };
    /**
     * Gets the vendor with the given id
     * @param vendorId The id of the vendor to get
     * @param organizationId The organization the user is currently in
     * @returns The vendor with the given id
     */
    ReimbursementRequestService.getSingleVendor = function (vendorId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var vendor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.vendor.findUnique(__assign({ where: { vendorId: vendorId } }, (0, vendor_query_args_1.getVendorQueryArgs)(organization.organizationId)))];
                    case 1:
                        vendor = _a.sent();
                        if (!vendor)
                            throw new errors_utils_1.NotFoundException('Vendor', vendorId);
                        if (vendor.dateDeleted)
                            throw new errors_utils_1.DeletedException('Vendor', vendorId);
                        if (vendor.organizationId !== organization.organizationId)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to this vendor');
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.vendorTransformer)(vendor)];
                }
            });
        });
    };
    /**
     * Gets the account code with the given id
     * @param accountCodeId The id of the account code to get
     * @param organizationId The organization the user is currently in
     * @returns The account code with the given id
     */
    ReimbursementRequestService.getSingleAccountCode = function (accountCodeId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var accountCode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.account_Code.findUnique(__assign({ where: { accountCodeId: accountCodeId } }, (0, account_code_query_args_1.getAccountCodeQueryArgs)(organization.organizationId)))];
                    case 1:
                        accountCode = _a.sent();
                        if (!accountCode)
                            throw new errors_utils_1.NotFoundException('Account Code', accountCodeId);
                        if (accountCode.dateDeleted)
                            throw new errors_utils_1.DeletedException('Account Code', accountCode.name);
                        if (accountCode.organizationId !== organization.organizationId)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to this Account Code');
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.accountCodeTransformer)(accountCode)];
                }
            });
        });
    };
    ReimbursementRequestService.markPendingFinance = function (user, reimbursementRequestId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, comment, updatedReimbursementStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: reimbursementRequestId },
                            include: {
                                reimbursementStatuses: true,
                                notificationSlackThreads: true,
                                receiptPictures: true
                            }
                        })];
                    case 1:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserEditRRPermissions)(user, reimbursementRequest, organization.organizationId)];
                    case 2:
                        _a.sent();
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.SABO_SUBMITTED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been submitted to sabo!');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.DENIED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been denied');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.REIMBURSED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been reimbursed');
                        }
                        if (reimbursementRequest.receiptPictures.length === 0) {
                            throw new errors_utils_1.HttpException(400, 'At least one receipt picture is required to mark a reimbursement request as pending finance');
                        }
                        if (!reimbursementRequest.dateOfExpense) {
                            throw new errors_utils_1.HttpException(400, 'Date of expense is required to mark a reimbursement request as pending finance');
                        }
                        comment = "".concat(user.firstName, "  ").concat(user.lastName, " Marked Pending Finance");
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: user.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.reimbursement_Status.create(__assign({ data: {
                                    reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
                                    type: shared_1.ReimbursementStatusType.PENDING_FINANCE,
                                    userId: user.userId
                                } }, (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organization.organizationId)))];
                    case 4:
                        updatedReimbursementStatus = _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendReimbursementRequestPendingFinanceNotification)(reimbursementRequest.notificationSlackThreads)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementStatusTransformer)(updatedReimbursementStatus)];
                }
            });
        });
    };
    ReimbursementRequestService.financeRequestReimbursementRequestChanges = function (user, reimbursementRequestId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, pendingFinanceStatus, deletedStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: reimbursementRequestId },
                            include: {
                                reimbursementStatuses: true,
                                notificationSlackThreads: true
                            }
                        })];
                    case 1:
                        reimbursementRequest = _a.sent();
                        if (!reimbursementRequest)
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        if (reimbursementRequest.dateDeleted) {
                            throw new errors_utils_1.DeletedException('Reimbursement Request', reimbursementRequestId);
                        }
                        if (reimbursementRequest.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Reimbursement Request');
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserEditRRPermissions)(user, reimbursementRequest, organization.organizationId)];
                    case 2:
                        _a.sent();
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.SABO_SUBMITTED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been submitted to sabo!');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.DENIED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been denied');
                        }
                        if (reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.REIMBURSED; })) {
                            throw new errors_utils_1.HttpException(400, 'This reimbursement request has already been reimbursed');
                        }
                        pendingFinanceStatus = reimbursementRequest.reimbursementStatuses.find(function (status) { return status.type === shared_1.ReimbursementStatusType.PENDING_FINANCE; });
                        if (!pendingFinanceStatus)
                            throw new errors_utils_1.HttpException(400, 'Reimbursement Request Must Be Pending Finance');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Status.delete(__assign({ where: {
                                    reimbursementStatusId: pendingFinanceStatus.reimbursementStatusId
                                } }, (0, reimbursement_statuses_query_args_1.getReimbursementStatusQueryArgs)(organization.organizationId)))];
                    case 3:
                        deletedStatus = _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendReimbursementRequestChangesRequestedNotification)(reimbursementRequest.notificationSlackThreads)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementStatusTransformer)(deletedStatus)];
                }
            });
        });
    };
    /**
     * Creates an index code with the given name and current user.
     * @param name name of the index code
     * @param code code of the index code
     * @param user the user creating the index code
     * @param organization the organization the user is
     * @returns transformed created index code
     */
    ReimbursementRequestService.createIndexCode = function (name, code, user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var indexCode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.index_Code.create(__assign({ data: {
                                userCreated: { connect: { userId: user.userId } },
                                name: name,
                                code: code,
                                organization: { connect: { organizationId: organization.organizationId } }
                            } }, (0, index_code_query_args_1.getIndexCodeQueryArgs)(organization.organizationId)))];
                    case 1:
                        indexCode = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.indexCodeTransformer)(indexCode)];
                }
            });
        });
    };
    /**
     * Gets the index code with the given id
     * @param indexCodeId The id of the index code to get
     * @param organizationId The organization the user is currently in
     * @returns The index code with the given id
     */
    ReimbursementRequestService.getSingleIndexCode = function (indexCodeId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var indexCode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.index_Code.findUnique(__assign({ where: { indexCodeId: indexCodeId } }, (0, index_code_query_args_1.getIndexCodeQueryArgs)(organization.organizationId)))];
                    case 1:
                        indexCode = _a.sent();
                        if (!indexCode)
                            throw new errors_utils_1.NotFoundException('Index Code', indexCodeId);
                        if (indexCode.dateDeleted)
                            throw new errors_utils_1.DeletedException('Index Code', indexCodeId);
                        if (indexCode.organizationId !== organization.organizationId)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to this index code');
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.indexCodeTransformer)(indexCode)];
                }
            });
        });
    };
    /**
     * Gets all index codes in the database
     * @param organizationId the organization id of the current user
     * @returns All of the index codes
     */
    ReimbursementRequestService.getAllIndexCodes = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var indexCodes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.index_Code.findMany(__assign({ where: { dateDeleted: null, organizationId: organization.organizationId } }, (0, index_code_query_args_1.getIndexCodeQueryArgs)(organization.organizationId)))];
                    case 1:
                        indexCodes = _a.sent();
                        return [2 /*return*/, indexCodes.map(reimbursement_requests_transformer_1.indexCodeTransformer)];
                }
            });
        });
    };
    /**
     * Deletes the index code
     *
     * @param indexCodeid the requested index code to be deleted
     * @param submitter the user deleting the index code
     * @param organizationId the organization the user is currently in
     * @returns the 'deleted' index code
     */
    ReimbursementRequestService.deleteIndexCode = function (indexCodeId, user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var indexCode, _a, deletedIndexCode;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ReimbursementRequestService.getSingleIndexCode(indexCodeId, organization)];
                    case 1:
                        indexCode = _b.sent();
                        _a = indexCode.userCreated.userId !== user.userId;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserLeadOrHeadOfFinanceTeam)(user, organization.organizationId)];
                    case 2:
                        _a = !(_b.sent());
                        _b.label = 3;
                    case 3:
                        if (_a)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to delete this index code, index codes can only be deleted by their creator or finance leads and above');
                        return [4 /*yield*/, prisma_1.default.index_Code.update(__assign({ where: { indexCodeId: indexCode.indexCodeId }, data: { dateDeleted: new Date() } }, (0, index_code_query_args_1.getIndexCodeQueryArgs)(organization.organizationId)))];
                    case 4:
                        deletedIndexCode = _b.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.indexCodeTransformer)(deletedIndexCode)];
                }
            });
        });
    };
    /**
     * Creates an other reimbursement product reason with the given name, budget and current user.
     * @param name name of the other reimbursement product reason
     * @param budget budget of other reimbursement product reason in cents
     * @param indexCodeId index code id of the index code the other reimbursement product reason falls under
     * @param user the user creating the other reimbursement product reason
     * @returns transformed created other reimbursement product reason
     */
    ReimbursementRequestService.createOtherReasonReimbursementProduct = function (name, budget, indexCodeId, accountCodeIds, user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var indexCode, otherReimbursementProductReason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ReimbursementRequestService.getSingleIndexCode(indexCodeId, organization)];
                    case 1:
                        indexCode = _a.sent();
                        if (!indexCode)
                            throw new errors_utils_1.NotFoundException('Index Code', indexCodeId);
                        return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.create(__assign({ data: {
                                    name: name,
                                    budget: budget,
                                    userCreated: { connect: { userId: user.userId } },
                                    indexCode: { connect: { indexCodeId: indexCode.indexCodeId } },
                                    accountCodes: { connect: accountCodeIds.map(function (accountCodeId) { return ({ accountCodeId: accountCodeId }); }) }
                                } }, (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organization.organizationId)))];
                    case 2:
                        otherReimbursementProductReason = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.otherProductReasonTransformer)(otherReimbursementProductReason)];
                }
            });
        });
    };
    /**
     * Gets the other reimursement product reason with the given id
     * @param otherReimbursementProductReasonId The id of the other reimursement product reason to get
     * @param organizationId The organization the user is currently in
     * @returns The other reimursement product reason with the given id
     */
    ReimbursementRequestService.getSingleOtherReimbursementProductReason = function (otherReimbursementProductReasonId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var otherProductReason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.findUnique(__assign({ where: { otherReimbursementProductReasonId: otherReimbursementProductReasonId } }, (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organization.organizationId)))];
                    case 1:
                        otherProductReason = _a.sent();
                        if (!otherProductReason)
                            throw new errors_utils_1.NotFoundException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);
                        if (otherProductReason.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.otherProductReasonTransformer)(otherProductReason)];
                }
            });
        });
    };
    /**
     * Gets all other reimbursement product reasons in the database
     * @param organizationId the organization id of the current user
     * @returns All of the other reimbursement product reasons
     */
    ReimbursementRequestService.getAllOtherReimbursementProductReasons = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var otherReimbursementProductReasons;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.findMany(__assign({ where: { dateDeleted: null } }, (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organization.organizationId)))];
                    case 1:
                        otherReimbursementProductReasons = _a.sent();
                        return [2 /*return*/, otherReimbursementProductReasons.map(reimbursement_requests_transformer_1.otherProductReasonTransformer)];
                }
            });
        });
    };
    /**
     * Deletes the other reimursement product reason
     *
     * @param otherProductReasonId the requested other reimursement product reason to be deleted
     * @param user the user deleting the other reimursement product reason
     * @param organizationId the organization the user is currently in
     * @returns the 'deleted' other reimursement product reason
     */
    ReimbursementRequestService.deleteOtherReimbursementProductReason = function (otherProductReasonId, user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var otherProductReason, _a, deletedOtherProductReason;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ReimbursementRequestService.getSingleOtherReimbursementProductReason(otherProductReasonId, organization)];
                    case 1:
                        otherProductReason = _b.sent();
                        _a = otherProductReason.userCreated.userId !== user.userId;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, reimbursement_requests_utils_1.isUserLeadOrHeadOfFinanceTeam)(user, organization.organizationId)];
                    case 2:
                        _a = !(_b.sent());
                        _b.label = 3;
                    case 3:
                        if (_a)
                            throw new errors_utils_1.AccessDeniedException('You do not have access to delete this other reimbursement product reason, other reimbursement product reasons can only be deleted by their creator or finance leads and above');
                        return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.update(__assign({ where: { otherReimbursementProductReasonId: otherProductReason.otherProductReasonId }, data: { dateDeleted: new Date() } }, (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organization.organizationId)))];
                    case 4:
                        deletedOtherProductReason = _b.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.otherProductReasonTransformer)(deletedOtherProductReason)];
                }
            });
        });
    };
    /**
     * Creates a new comment for a reimbursement request
     *
     * @param currentUser The user creating the comment
     * @param organization The organization context for the request
     * @param comment The comment text content
     * @param reimbursementRequestId The ID of the reimbursement request to comment on
     * @returns The newly created reimbursement request comment
     * @throws NotFoundException if the reimbursement request doesn't exist in the organization
     */
    ReimbursementRequestService.createReimbursementRequestComment = function (currentUser, organization, comment, reimbursementRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequest, createdComment, tagRegex, taggedNames, splitTaggedNames, tags, _i, splitTaggedNames_1, taggedName, firstName, lastName, taggedUser, replacementIndex, stakeholders, restOfTags;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request.findUnique({
                            where: { reimbursementRequestId: reimbursementRequestId, organizationId: organization.organizationId, dateDeleted: null },
                            include: { notificationSlackThreads: true }
                        })];
                    case 1:
                        reimbursementRequest = _b.sent();
                        if (!reimbursementRequest) {
                            throw new errors_utils_1.NotFoundException('Reimbursement Request', reimbursementRequestId);
                        }
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.create(__assign({ data: {
                                    userCreatedId: currentUser.userId,
                                    reimbursementRequestId: reimbursementRequestId,
                                    comment: comment
                                } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 2:
                        createdComment = _b.sent();
                        tagRegex = /@([A-Z][a-z'-]+(?:[A-Z][a-z'-]+)?)/gu;
                        taggedNames = __spreadArray([], comment.matchAll(tagRegex), true).map(function (match) { return match[1]; });
                        splitTaggedNames = taggedNames.map(function (name) {
                            var match = name.match(/([A-Z][a-z'-]+)([A-Z][a-z'-]+)/);
                            if (match) {
                                return {
                                    firstName: match[1],
                                    lastName: match[2]
                                };
                            }
                            // possible for user to have one name
                            return {
                                firstName: name,
                                lastName: ''
                            };
                        });
                        tags = [];
                        _i = 0, splitTaggedNames_1 = splitTaggedNames;
                        _b.label = 3;
                    case 3:
                        if (!(_i < splitTaggedNames_1.length)) return [3 /*break*/, 6];
                        taggedName = splitTaggedNames_1[_i];
                        firstName = taggedName.firstName, lastName = taggedName.lastName;
                        return [4 /*yield*/, prisma_1.default.user.findFirst({
                                where: {
                                    firstName: { equals: firstName, mode: 'insensitive' },
                                    lastName: { equals: lastName, mode: 'insensitive' },
                                    organizations: {
                                        some: {
                                            organizationId: organization.organizationId
                                        }
                                    }
                                },
                                include: { userSettings: true }
                            })];
                    case 4:
                        taggedUser = _b.sent();
                        tags.push(((_a = taggedUser === null || taggedUser === void 0 ? void 0 : taggedUser.userSettings) === null || _a === void 0 ? void 0 : _a.slackId) ? "<@".concat(taggedUser.userSettings.slackId, ">") : "".concat(firstName, " ").concat(lastName));
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        replacementIndex = 0;
                        // replace the @FirstLast tags with the slack tags
                        comment = comment.replace(tagRegex, function (_match, _group) {
                            var replacement = tags[replacementIndex];
                            replacementIndex++;
                            return replacement;
                        });
                        if (!(tags.length < 2)) return [3 /*break*/, 8];
                        return [4 /*yield*/, prisma_1.default.user.findMany({
                                where: {
                                    organizations: {
                                        some: {
                                            organizationId: organization.organizationId
                                        }
                                    },
                                    userSettings: { slackId: { not: '' } },
                                    OR: [
                                        { reimbursementRequestComments: { some: { reimbursementRequestId: reimbursementRequestId } } },
                                        { reimbursementRequests: { some: { reimbursementRequestId: reimbursementRequestId } } }
                                    ]
                                },
                                include: { userSettings: true }
                            })];
                    case 7:
                        stakeholders = _b.sent();
                        tags.push.apply(tags, stakeholders.map(function (user) {
                            var _a;
                            return ((_a = user.userSettings) === null || _a === void 0 ? void 0 : _a.slackId) && !tags.includes("<@".concat(user.userSettings.slackId, ">"))
                                ? "<@".concat(user.userSettings.slackId, ">")
                                : '';
                        }));
                        restOfTags = tags.slice(1);
                        comment += " ".concat(__spreadArray([], new Set(restOfTags), true).join(' '));
                        _b.label = 8;
                    case 8: return [4 /*yield*/, (0, slack_utils_1.sendThreadResponse)(reimbursementRequest.notificationSlackThreads, comment)];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementRequestCommentTransformer)(createdComment)];
                }
            });
        });
    };
    /**
     * Updates the comment for an existing new comment on a reimbursement request
     *
     * @param editer The user updating the comment
     * @param organization The organization context for the request
     * @param comment The comment text content
     * @param commentId The ID of the reimbursement request comment
     * @returns The updated reimbursement request comment
     * @throws NotFoundException if the comment doesn't exist
     * @throws HttpException if the comment is the same as the current comment
     */
    ReimbursementRequestService.editReimbursementRequestComment = function (editer, organization, comment, commentId) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequestComment, editedComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.findUnique({
                            where: { reimbursementRequestCommentId: commentId, dateDeleted: null }
                        })];
                    case 1:
                        reimbursementRequestComment = _a.sent();
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(editer.userId, organization.organizationId, shared_1.notGuest)];
                    case 2:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedException('Only members of an organization can edit comments');
                        }
                        if (!reimbursementRequestComment) {
                            throw new errors_utils_1.NotFoundException('Reimbursement Request Comment', commentId);
                        }
                        if (reimbursementRequestComment.comment === comment) {
                            throw new errors_utils_1.HttpException(400, 'New comment matches existing content');
                        }
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.update(__assign({ where: { reimbursementRequestCommentId: commentId }, data: { comment: comment } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 3:
                        editedComment = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementRequestCommentTransformer)(editedComment)];
                }
            });
        });
    };
    /**
     * Deletes the comment for an existing comment on a reimbursement request
     *
     * @param deleter the user deleting the comment
     * @param organization The organization context for the request
     * @param commentId The ID of the reimbursement request comment
     * @returns The deleted reimbursement request comment
     * @throws NotFoundException if the comment doesn't exist
     */
    ReimbursementRequestService.deleteReimbursementRequestComment = function (deleter, organization, commentId) {
        return __awaiter(this, void 0, void 0, function () {
            var reimbursementRequestComment, deletedComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.findUnique({
                            where: { reimbursementRequestCommentId: commentId, dateDeleted: null }
                        })];
                    case 1:
                        reimbursementRequestComment = _a.sent();
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(deleter.userId, organization.organizationId, shared_1.notGuest)];
                    case 2:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedException('Only members of an organization can delete comments');
                        }
                        if (!reimbursementRequestComment) {
                            throw new errors_utils_1.NotFoundException('Reimbursement Request Comment', commentId);
                        }
                        return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.update(__assign({ where: { reimbursementRequestCommentId: commentId }, data: { dateDeleted: new Date(), userDeletedId: deleter.userId } }, (0, reimbursement_comment_query_args_1.getReimbursementRequestCommentQueryArgs)(organization.organizationId)))];
                    case 3:
                        deletedComment = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.reimbursementRequestCommentTransformer)(deletedComment)];
                }
            });
        });
    };
    /**
     *
     * Edits the other reimbursement product reason
     * @param otherReimbursementProductReasonId id of the other reimbursement product reason being edited
     * @param org the organization the user is currently in
     * @param editor the user editing the reason
     * @param name the updated name of the other reimbursement product reason
     * @param budget the updated budget of the other reimbursement product reason
     * @param indexCodeId the updated index code of the other reimbursement product reason
     * @param accountCodeIds the updated account codes of the other reimbursement product reason
     * @returns the other reimbursement product reason with the given id
     */
    ReimbursementRequestService.editOtherReimbursementProductReason = function (otherReimbursementProductReasonId, org, editor, name, budget, indexCodeId, accountCodeIds) {
        return __awaiter(this, void 0, void 0, function () {
            var otherProductReason, indexCode, editedReason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(editor.userId, org.organizationId, shared_1.isHead)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedException('Only heads can edit other reimbursement product reasons.');
                        }
                        return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.findUnique(__assign({ where: { otherReimbursementProductReasonId: otherReimbursementProductReasonId } }, (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(org.organizationId)))];
                    case 2:
                        otherProductReason = _a.sent();
                        if (!otherProductReason)
                            throw new errors_utils_1.NotFoundException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);
                        if (otherProductReason.dateDeleted)
                            throw new errors_utils_1.DeletedException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);
                        return [4 /*yield*/, prisma_1.default.index_Code.findUnique({
                                where: { indexCodeId: indexCodeId }
                            })];
                    case 3:
                        indexCode = _a.sent();
                        if (!indexCode)
                            throw new errors_utils_1.NotFoundException('Index Code', indexCodeId);
                        if (indexCode.dateDeleted)
                            throw new errors_utils_1.DeletedException('Index Code', indexCodeId);
                        return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.update(__assign({ where: { otherReimbursementProductReasonId: otherReimbursementProductReasonId }, data: {
                                    budget: budget,
                                    indexCodeId: indexCodeId,
                                    name: name,
                                    accountCodes: { set: accountCodeIds.map(function (accountCodeId) { return ({ accountCodeId: accountCodeId }); }) }
                                } }, (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(org.organizationId)))];
                    case 4:
                        editedReason = _a.sent();
                        return [2 /*return*/, (0, reimbursement_requests_transformer_1.otherProductReasonTransformer)(editedReason)];
                }
            });
        });
    };
    return ReimbursementRequestService;
}());
exports.default = ReimbursementRequestService;

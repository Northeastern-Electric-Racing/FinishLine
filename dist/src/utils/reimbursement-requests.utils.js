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
exports.validateRefund = exports.validateUserEditRRPermissions = exports.isUserHeadOrOnFinance = exports.isAuthUserHeadOfFinance = exports.isAuthUserAtLeastLeadForFinance = exports.isAuthUserOnFinance = exports.isUserLeadOrHeadOfFinanceTeam = exports.isUserOnFinanceTeam = exports.validateUserIsPartOfFinanceTeamOrHead = exports.createReimbursementProducts = exports.updateReimbursementProducts = exports.validateReimbursementProducts = exports.removeDeletedReceiptPictures = void 0;
var shared_1 = require("shared");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
var teams_utils_1 = require("./teams.utils");
var users_utils_1 = require("./users.utils");
/**
 * This function removes any deleted receipts and adds any new receipts
 * @param receipts the new list of receipts to compare against the old ones
 * @param currentReceipts the current list of receipts on the request that's being edited
 */
var removeDeletedReceiptPictures = function (newReceipts, currentReceipts, submitter) { return __awaiter(void 0, void 0, void 0, function () {
    var deletedReceipts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (currentReceipts.length === 0)
                    return [2 /*return*/];
                deletedReceipts = currentReceipts.filter(function (currentReceipt) { return !newReceipts.find(function (receipt) { return receipt.googleFileId === currentReceipt.googleFileId; }); });
                //mark any deleted receipts as deleted in the database
                return [4 /*yield*/, prisma_1.default.receipt.updateMany({
                        where: { receiptId: { in: deletedReceipts.map(function (receipt) { return receipt.receiptId; }) } },
                        data: {
                            dateDeleted: new Date(),
                            deletedByUserId: submitter.userId
                        }
                    })];
            case 1:
                //mark any deleted receipts as deleted in the database
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.removeDeletedReceiptPictures = removeDeletedReceiptPictures;
/**
 * Validates that the wbs elements exist and are not deleted for each reimbursement product
 * @param ortherReimbursementCreateArgs Reimbursement products with an other reason for the product
 * @param wbsReimbursementProductsCreateArgs Reimbursement products with a wbs element reason for the product
 * @param organizationId the organization id that the reimbursement request belongs to
 * @returns the reimbursement products with the wbs element id added
 * @throws if any of the wbs elements are deleted or dont exist
 */
var validateReimbursementProducts = function (otherReimbursementProductCreateArgs, wbsReimbursementProductsCreateArgs, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var validatedWbsReimbursementProductsPromises, validatedOtherReimbursementProducts, validatedWbsReimbursementProducts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (otherReimbursementProductCreateArgs.length + wbsReimbursementProductsCreateArgs.length === 0) {
                    throw new errors_utils_1.HttpException(400, 'You must have at least one product to reimburse');
                }
                validatedWbsReimbursementProductsPromises = wbsReimbursementProductsCreateArgs.map(function (product) { return __awaiter(void 0, void 0, void 0, function () {
                    var wbsNum, wbsElement;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                wbsNum = product.reason;
                                return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                                        where: {
                                            wbsNumber: __assign({ organizationId: organizationId }, wbsNum)
                                        }
                                    })];
                            case 1:
                                wbsElement = _a.sent();
                                if (!wbsElement)
                                    throw new errors_utils_1.NotFoundException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                                if (wbsElement.dateDeleted)
                                    throw new errors_utils_1.DeletedException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                                return [2 /*return*/, __assign(__assign({}, product), { wbsElementId: wbsElement.wbsElementId, wbsNum: wbsNum })];
                        }
                    });
                }); });
                validatedOtherReimbursementProducts = otherReimbursementProductCreateArgs.map(function (product) {
                    return __assign(__assign({}, product), { reason: product.reason });
                });
                return [4 /*yield*/, Promise.all(validatedWbsReimbursementProductsPromises)];
            case 1:
                validatedWbsReimbursementProducts = _a.sent();
                return [2 /*return*/, { validatedOtherReimbursementProducts: validatedOtherReimbursementProducts, validatedWbsReimbursementProducts: validatedWbsReimbursementProducts }];
        }
    });
}); };
exports.validateReimbursementProducts = validateReimbursementProducts;
/**
 * This function updates any current reimbursement products associated with a reimbursement request, creates any new reimbursement products, and deletes any deleted reimbursement products
 * @param currentReimbursementProducts the current reimbursement products of a reimbursement request
 * @param updatedReimbursementProducts the new reimbursement products to compare
 * @param reimbursementRequestId the reimbursement request that is being changed id
 * @param organizationId the organization id that the reimbursement request belongs to
 */
var updateReimbursementProducts = function (currentReimbursementProducts, updatedOtherReimbursementProducts, updatedWbsReimbursementProducts, reimbursementRequestId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var updatedOtherExistingProducts, updatedWbsExistingProducts, updatedExistingProducts, updatedExistingProductIds, newOtherProducts, newWbsProducts, deletedProducts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (updatedOtherReimbursementProducts.length + updatedWbsReimbursementProducts.length === 0) {
                    throw new errors_utils_1.HttpException(400, 'A reimbursement request must have at least one reimbursement product!');
                }
                updatedOtherExistingProducts = updatedOtherReimbursementProducts.filter(function (product) { return product.id; });
                updatedWbsExistingProducts = updatedWbsReimbursementProducts.filter(function (product) { return product.id; });
                updatedExistingProducts = updatedOtherExistingProducts.concat(updatedWbsExistingProducts);
                validateUpdatedProductsExistInDatabase(currentReimbursementProducts, updatedExistingProducts);
                updatedExistingProductIds = updatedExistingProducts.map(function (product) { return product.id; });
                newOtherProducts = updatedOtherReimbursementProducts.filter(function (product) { return !product.id; });
                newWbsProducts = updatedWbsReimbursementProducts.filter(function (product) { return !product.id; });
                deletedProducts = currentReimbursementProducts.filter(function (product) { return !updatedExistingProductIds.includes(product.reimbursementProductId); });
                return [4 /*yield*/, updateDeletedProducts(deletedProducts)];
            case 1:
                _a.sent();
                return [4 /*yield*/, createNewProducts(newOtherProducts, newWbsProducts, reimbursementRequestId, organizationId)];
            case 2:
                _a.sent();
                return [4 /*yield*/, updateExistingProducts(updatedExistingProducts)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.updateReimbursementProducts = updateReimbursementProducts;
/**
 * updates the existing products in the database
 *
 * @param products the products to update
 */
var updateExistingProducts = function (products) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, products_1, product;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, products_1 = products;
                _a.label = 1;
            case 1:
                if (!(_i < products_1.length)) return [3 /*break*/, 4];
                product = products_1[_i];
                return [4 /*yield*/, prisma_1.default.reimbursement_Product.update({
                        where: { reimbursementProductId: product.id },
                        data: {
                            name: product.name,
                            cost: product.cost
                        }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * validates that the products that should be updated in the database exist
 * @param currentReimbursementProducts The products that do exist in the database
 * @param updatedExistingProducts The products that are being updated that already have Ids
 */
var validateUpdatedProductsExistInDatabase = function (currentReimbursementProducts, updatedExistingProducts) {
    //Check to make sure that the updated products actually exist in the database
    var prismaProductIds = currentReimbursementProducts.map(function (product) { return product.reimbursementProductId; });
    var missingProductIds = updatedExistingProducts.filter(function (product) { return !prismaProductIds.includes(product.id); });
    if (missingProductIds.length > 0) {
        throw new errors_utils_1.HttpException(400, "The following products do not exist: ".concat(missingProductIds.map(function (product) { return product.name; }).join(', ')));
    }
};
/**
 * Soft deletes the given products in the database
 *
 * @param products the products to delete
 */
var updateDeletedProducts = function (products) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            //update the deleted reimbursement products by setting their date deleted to now
            return [4 /*yield*/, prisma_1.default.reimbursement_Product.updateMany({
                    where: { reimbursementProductId: { in: products.map(function (product) { return product.reimbursementProductId; }) } },
                    data: {
                        dateDeleted: new Date()
                    }
                })];
            case 1:
                //update the deleted reimbursement products by setting their date deleted to now
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Validates and Creates the new products in the database
 * @param otherProducts the other reimbursement products to create
 * @param wbsProducts the wbs reimbursement products to create
 * @param reimbursementRequestId the id of the reimbursement request to associate the products with
 * @param organizationId the organization id that the reimbursement request belongs to
 */
var createNewProducts = function (otherProducts, wbsProducts, reimbursementRequestId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var validatedReimbursementProducts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(otherProducts.length + wbsProducts.length !== 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, exports.validateReimbursementProducts)(otherProducts, wbsProducts, organizationId)];
            case 1:
                validatedReimbursementProducts = _a.sent();
                return [4 /*yield*/, (0, exports.createReimbursementProducts)(validatedReimbursementProducts.validatedOtherReimbursementProducts, validatedReimbursementProducts.validatedWbsReimbursementProducts, reimbursementRequestId)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Takes in validated reimbursement products and create them in the database
 * @param validatedOtherReimbursementProducts the other reimbursement products to create
 * @param validatedWbsReimbursementProducts the wbs reimbursement products to create
 * @param reimbursementRequestId id of the reimbursement request to associate the reimbursement products with
 */
var createReimbursementProducts = function (validatedOtherReimbursementProducts, validatedWbsReimbursementProducts, reimbursementRequestId) { return __awaiter(void 0, void 0, void 0, function () {
    var otherReimbursementProductPromises, wbsReimbursementProductPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                otherReimbursementProductPromises = validatedOtherReimbursementProducts.map(function (product) { return __awaiter(void 0, void 0, void 0, function () {
                    var reimbursementProductReason, refundSources;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Product_Reason.create({
                                    data: {
                                        otherReason: { connect: { otherReimbursementProductReasonId: product.reason.otherProductReasonId } }
                                    }
                                })];
                            case 1:
                                reimbursementProductReason = _a.sent();
                                refundSources = product.refundSources.map(function (rs) { return ({
                                    indexCode: { connect: { indexCodeId: rs.indexCode.indexCodeId } },
                                    amount: rs.amount
                                }); });
                                return [4 /*yield*/, prisma_1.default.reimbursement_Product.create({
                                        data: {
                                            name: product.name,
                                            cost: product.cost,
                                            reimbursementRequestId: reimbursementRequestId,
                                            refundSources: {
                                                create: refundSources
                                            },
                                            reimbursementProductReasonId: reimbursementProductReason.reimbursementProductReasonId
                                        }
                                    })];
                            case 2: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); });
                wbsReimbursementProductPromises = validatedWbsReimbursementProducts.map(function (product) { return __awaiter(void 0, void 0, void 0, function () {
                    var reimbursementProductReason, refundSources;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Product_Reason.create({
                                    data: {
                                        wbsElement: {
                                            connect: {
                                                wbsElementId: product.wbsElementId
                                            }
                                        }
                                    }
                                })];
                            case 1:
                                reimbursementProductReason = _a.sent();
                                refundSources = product.refundSources.map(function (rs) { return ({
                                    indexCode: { connect: { indexCodeId: rs.indexCode.indexCodeId } },
                                    amount: rs.amount
                                }); });
                                return [4 /*yield*/, prisma_1.default.reimbursement_Product.create({
                                        data: {
                                            name: product.name,
                                            cost: product.cost,
                                            reimbursementRequestId: reimbursementRequestId,
                                            refundSources: {
                                                create: refundSources
                                            },
                                            reimbursementProductReasonId: reimbursementProductReason.reimbursementProductReasonId
                                        }
                                    })];
                            case 2: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], otherReimbursementProductPromises, true), wbsReimbursementProductPromises, true))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createReimbursementProducts = createReimbursementProducts;
/**
 * Validates that the given user is on the finance team.
 *
 * @param user The user to validate.
 * @param organizationId The organization to check if the user is on the finance team.
 * @throws {AccessDeniedException} Fails validation when user is not on the
 * finance team.
 */
var validateUserIsPartOfFinanceTeamOrHead = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var isUserAuthorized, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, exports.isUserOnFinanceTeam)(user, organizationId)];
            case 1:
                _a = (_b.sent());
                if (_a) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organizationId, shared_1.isHead)];
            case 2:
                _a = (_b.sent());
                _b.label = 3;
            case 3:
                isUserAuthorized = _a;
                if (!isUserAuthorized) {
                    throw new errors_utils_1.AccessDeniedException("You are not a member of the finance team!");
                }
                return [2 /*return*/];
        }
    });
}); };
exports.validateUserIsPartOfFinanceTeamOrHead = validateUserIsPartOfFinanceTeamOrHead;
var getFinanceTeam = function (organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var financeTeam;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.team.findFirst({
                    where: { financeTeam: true, organizationId: organizationId },
                    include: { head: true, leads: true, members: true }
                })];
            case 1:
                financeTeam = _a.sent();
                if (!financeTeam)
                    throw new errors_utils_1.HttpException(500, 'Finance team does not exist!');
                return [2 /*return*/, financeTeam];
        }
    });
}); };
/**
 * Determines if a user is part of the finance team.
 *
 * To be used for Prisma input validation of a plain User, as opposed to
 * <code>isAuthUserOnFinance</code>, which uses the additional fields
 * produced by authUserQueryArgs that are not in the User type by default.
 *
 * @param user the user to authenticate
 * @param organizationId the organization id to check if the user is on the finance team
 * @returns whether the user is on the finance team
 * @throws {HttpException} if finance team not found in database
 */
var isUserOnFinanceTeam = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = teams_utils_1.isUserOnTeam;
                return [4 /*yield*/, getFinanceTeam(organizationId)];
            case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent(), user])];
        }
    });
}); };
exports.isUserOnFinanceTeam = isUserOnFinanceTeam;
/**
 * Determines if a user is lead or head of the finance team.
 *
 * To be used for Prisma input validation of a plain User, as opposed to
 * <code>isAuthUserAtLeastLeadForFinance</code>, which uses the additional fields
 * produced by authUserQueryArgs that are not in the User type by default.
 *
 * @param user the user to authenticate
 * @returns whether the user is lead or head of the finance team
 * @throws {HttpException} if finance team not found in database
 */
var isUserLeadOrHeadOfFinanceTeam = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var financeTeam;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getFinanceTeam(organizationId)];
            case 1:
                financeTeam = _a.sent();
                return [2 /*return*/, user.userId === financeTeam.headId || financeTeam.leads.map(function (u) { return u.userId; }).includes(user.userId)];
        }
    });
}); };
exports.isUserLeadOrHeadOfFinanceTeam = isUserLeadOrHeadOfFinanceTeam;
var isAuthUserOnFinance = function (user) {
    return (user.teamsAsHead.some(function (team) { return team.financeTeam; }) ||
        user.teamsAsLead.some(function (team) { return team.financeTeam; }) ||
        user.teamsAsMember.some(function (team) { return team.financeTeam; }));
};
exports.isAuthUserOnFinance = isAuthUserOnFinance;
/**
 * Determines if the user is a finance lead or head.
 * @param user the user to check
 * @returns Whether they are a finance lead.
 */
var isAuthUserAtLeastLeadForFinance = function (user) {
    return user.teamsAsHead.some(function (team) { return team.financeTeam; }) || user.teamsAsLead.some(function (team) { return team.financeTeam; });
};
exports.isAuthUserAtLeastLeadForFinance = isAuthUserAtLeastLeadForFinance;
var isAuthUserHeadOfFinance = function (user) {
    return user.teamsAsHead.some(function (team) { return team.financeTeam; });
};
exports.isAuthUserHeadOfFinance = isAuthUserHeadOfFinance;
var isUserHeadOrOnFinance = function (submitter, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.validateUserIsPartOfFinanceTeamOrHead)(submitter, organizationId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.isUserHeadOrOnFinance = isUserHeadOrOnFinance;
// const isTeamIdInList = (teamId: string, teamsList: Team[]) => {
//   return teamsList.map((team) => team.teamId).includes(teamId);
// };
/**
 * Validates user has permission to edit the reimbursement request.
 * @param user the person editing the reimbursement request
 * @param reimbursementRequest the reimbursement request to edit
 * @param organizationId the organization that the user is currently in
 */
var validateUserEditRRPermissions = function (user, reimbursementRequest, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.validateUserIsPartOfFinanceTeamOrHead)(user, organizationId)];
            case 1:
                _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = _b.sent();
                if (reimbursementRequest.recipientId !== user.userId ||
                    reimbursementRequest.reimbursementStatuses.some(function (status) { return status.type === shared_1.ReimbursementStatusType.PENDING_FINANCE; }))
                    throw new errors_utils_1.AccessDeniedException('Only the creator or finance team can edit a reimbursement request. A request that has been pending finance cannot be edited.');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.validateUserEditRRPermissions = validateUserEditRRPermissions;
/**
 * Validates that the refund amount is less than the total amount owed to the user
 * @param user the user reporting or editing a refund
 * @param refundAmount the amount of the refund
 * @param organizationId the organization the request pertains to
 */
var validateRefund = function (user, refundAmount, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var totalOwed, totalReimbursed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.reimbursement_Request
                    .findMany({
                    where: { recipientId: user.userId, dateDeleted: null, accountCode: { organizationId: organizationId } }
                })
                    .then(function (userReimbursementRequests) {
                    return userReimbursementRequests.reduce(function (acc, curr) { return acc + curr.totalCost; }, 0);
                })];
            case 1:
                totalOwed = _a.sent();
                return [4 /*yield*/, prisma_1.default.reimbursement
                        .findMany({
                        where: { purchaserId: user.userId, organizationId: organizationId },
                        select: { amount: true }
                    })
                        .then(function (reimbursements) {
                        return reimbursements.reduce(function (acc, curr) { return acc + curr.amount; }, 0);
                    })];
            case 2:
                totalReimbursed = _a.sent();
                if (refundAmount > totalOwed - totalReimbursed) {
                    throw new errors_utils_1.HttpException(400, 'Reimbursement is greater than the total amount owed');
                }
                return [2 /*return*/];
        }
    });
}); };
exports.validateRefund = validateRefund;

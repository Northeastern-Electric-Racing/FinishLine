"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangeRequestWithProjectAndWorkPackageQueryArgs = exports.getManyChangeRequestQueryArgs = exports.getChangeRequestQueryArgs = void 0;
var client_1 = require("@prisma/client");
var scope_change_requests_query_args_1 = require("./scope-change-requests.query-args");
var user_query_args_1 = require("./user.query-args");
var work_packages_query_args_1 = require("./work-packages.query-args");
var reimbursement_product_other_reason_query_args_1 = require("./reimbursement-product-other-reason.query-args");
var account_code_query_args_1 = require("./account-code.query-args");
var getChangeRequestQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            submitter: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            wbsElement: true,
            category: (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organizationId),
            accountCode: (0, account_code_query_args_1.getAccountCodeQueryArgs)(organizationId),
            reviewer: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            changes: {
                where: {
                    wbsElement: {
                        dateDeleted: null
                    }
                },
                include: {
                    implementer: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    wbsElement: true
                }
            },
            scopeChangeRequest: (0, scope_change_requests_query_args_1.getScopeChangeRequestQueryArgs)(organizationId),
            stageGateChangeRequest: true,
            activationChangeRequest: {
                include: { lead: (0, user_query_args_1.getUserQueryArgs)(organizationId), manager: (0, user_query_args_1.getUserQueryArgs)(organizationId) }
            },
            budgetChangeRequest: true,
            deletedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            requestedReviewers: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getChangeRequestQueryArgs = getChangeRequestQueryArgs;
var getManyChangeRequestQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            submitter: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            wbsElement: true,
            category: (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organizationId),
            accountCode: (0, account_code_query_args_1.getAccountCodeQueryArgs)(organizationId),
            reviewer: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            stageGateChangeRequest: true,
            changes: true,
            activationChangeRequest: {
                include: { lead: (0, user_query_args_1.getUserQueryArgs)(organizationId), manager: (0, user_query_args_1.getUserQueryArgs)(organizationId) }
            },
            budgetChangeRequest: true,
            deletedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            requestedReviewers: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getManyChangeRequestQueryArgs = getManyChangeRequestQueryArgs;
var getChangeRequestWithProjectAndWorkPackageQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            submitter: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            wbsElement: {
                include: {
                    workPackage: (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organizationId),
                    project: {
                        include: {
                            teams: true
                        }
                    },
                    descriptionBullets: { where: { dateDeleted: null } },
                    links: { where: { dateDeleted: null } }
                }
            },
            category: (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organizationId),
            accountCode: (0, account_code_query_args_1.getAccountCodeQueryArgs)(organizationId),
            reviewer: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            changes: {
                where: {
                    wbsElement: {
                        dateDeleted: null
                    }
                },
                include: {
                    implementer: (0, user_query_args_1.getUserQueryArgs)(organizationId),
                    wbsElement: true,
                    category: (0, reimbursement_product_other_reason_query_args_1.getReimbursementProductOtherReasonQueryArgs)(organizationId),
                    accountCode: (0, account_code_query_args_1.getAccountCodeQueryArgs)(organizationId)
                }
            },
            scopeChangeRequest: (0, scope_change_requests_query_args_1.getScopeChangeRequestQueryArgs)(organizationId),
            stageGateChangeRequest: true,
            activationChangeRequest: {
                include: { lead: (0, user_query_args_1.getUserQueryArgs)(organizationId), manager: (0, user_query_args_1.getUserQueryArgs)(organizationId) }
            },
            budgetChangeRequest: true,
            deletedBy: (0, user_query_args_1.getUserQueryArgs)(organizationId),
            requestedReviewers: (0, user_query_args_1.getUserQueryArgs)(organizationId)
        }
    });
};
exports.getChangeRequestWithProjectAndWorkPackageQueryArgs = getChangeRequestWithProjectAndWorkPackageQueryArgs;

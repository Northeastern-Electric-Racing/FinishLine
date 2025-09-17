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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWbsElement = exports.sendCRSubmitterReviewedNotification = exports.reviewProposedSolution = exports.applyWorkPackageProposedChanges = exports.applyProjectProposedChanges = exports.validateNoUnreviewedOpenAccountCodeCRs = exports.validateNoUnreviewedOpenOtherReasonCRs = exports.validateNoUnreviewedOpenCRs = exports.validateProposedChangesFields = exports.allChangeRequestsReviewed = exports.getDateImplemented = exports.calculateChangeRequestStatus = exports.validateChangeRequestAccepted = exports.updateBlocking = exports.convertCRScopeWhyType = void 0;
var prisma_1 = require("../prisma/prisma");
var shared_1 = require("shared");
var errors_utils_1 = require("./errors.utils");
var shared_2 = require("shared");
var changes_utils_1 = require("./changes.utils");
var work_packages_query_args_1 = require("../prisma-query-args/work-packages.query-args");
var projects_services_1 = require("../services/projects.services");
var work_packages_services_1 = require("../services/work-packages.services");
var datetime_utils_1 = require("./datetime.utils");
var description_bullets_utils_1 = require("./description-bullets.utils");
var slack_utils_1 = require("./slack.utils");
var work_packages_utils_1 = require("./work-packages.utils");
var convertCRScopeWhyType = function (whyType) {
    return ({
        ESTIMATION: shared_1.ChangeRequestReason.Estimation,
        SCHOOL: shared_1.ChangeRequestReason.School,
        DESIGN: shared_1.ChangeRequestReason.Design,
        MANUFACTURING: shared_1.ChangeRequestReason.Manufacturing,
        RULES: shared_1.ChangeRequestReason.Rules,
        INITIALIZATION: shared_1.ChangeRequestReason.Initialization,
        COMPETITION: shared_1.ChangeRequestReason.Competition,
        MAINTENANCE: shared_1.ChangeRequestReason.Maintenance,
        OTHER_PROJECT: shared_1.ChangeRequestReason.OtherProject,
        OTHER: shared_1.ChangeRequestReason.Other
    })[whyType];
};
exports.convertCRScopeWhyType = convertCRScopeWhyType;
/**
 * This function updates the start date of all the blockings (and nested blockings) of the initial given work package.
 * It uses a depth first search algorithm for efficiency and to avoid cycles.
 *
 * @param initialWorkPackage the initial work package
 * @param timelineImpact the timeline impact of the proposed solution
 * @param crId the change request id
 * @param reviewer the reviewer of the change request
 */
var updateBlocking = function (initialWorkPackage, timelineImpact, crId, reviewer) { return __awaiter(void 0, void 0, void 0, function () {
    var seenWbsElementIds, blockingUpdateQueue, currWbsId, currWbs, newStartDate, change, newBlocking;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                seenWbsElementIds = new Set([initialWorkPackage.wbsElement.wbsElementId]);
                blockingUpdateQueue = initialWorkPackage.wbsElement.blocking.map(function (blocking) { return blocking.wbsElementId; });
                _a.label = 1;
            case 1:
                if (!(blockingUpdateQueue.length > 0)) return [3 /*break*/, 4];
                currWbsId = blockingUpdateQueue.pop();
                if (!currWbsId)
                    return [3 /*break*/, 4]; // this is more of a type check for pop becuase the while loop prevents this from not existing
                if (seenWbsElementIds.has(currWbsId))
                    return [3 /*break*/, 1]; // if we've already seen it we skip it
                seenWbsElementIds.add(currWbsId);
                return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                        where: { wbsElementId: currWbsId },
                        include: {
                            blocking: true,
                            workPackage: true
                        }
                    })];
            case 2:
                currWbs = _a.sent();
                if (!currWbs)
                    throw new errors_utils_1.NotFoundException('WBS Element', currWbsId);
                if (currWbs.dateDeleted)
                    return [3 /*break*/, 1]; // this wbs element has been deleted so skip it
                if (!currWbs.workPackage)
                    return [3 /*break*/, 1]; // this wbs element is a project so skip it
                newStartDate = (0, shared_1.addWeeksToDate)(currWbs.workPackage.startDate, timelineImpact);
                change = {
                    changeRequestId: crId,
                    implementerId: reviewer.userId,
                    detail: (0, changes_utils_1.buildChangeDetail)('Start Date', currWbs.workPackage.startDate.toLocaleDateString(), newStartDate.toLocaleDateString())
                };
                return [4 /*yield*/, prisma_1.default.work_Package.update({
                        where: { workPackageId: currWbs.workPackage.workPackageId },
                        data: {
                            startDate: newStartDate,
                            wbsElement: {
                                update: {
                                    changes: {
                                        create: change
                                    }
                                }
                            }
                        }
                    })];
            case 3:
                _a.sent();
                newBlocking = currWbs.blocking.map(function (blocking) { return blocking.wbsElementId; });
                blockingUpdateQueue.push.apply(blockingUpdateQueue, newBlocking);
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateBlocking = updateBlocking;
/** Makes sure that a change request has been accepted already (and not deleted)
 * @param crId - the id of the change request to check
 * @returns the change request
 * @throws if the change request is unreviewed, denied, or deleted
 */
var validateChangeRequestAccepted = function (crId) { return __awaiter(void 0, void 0, void 0, function () {
    var changeRequest, currentDate, dateImplemented;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.change_Request.findUnique({ where: { crId: crId }, include: { changes: true } })];
            case 1:
                changeRequest = _a.sent();
                currentDate = new Date();
                if (!changeRequest)
                    throw new errors_utils_1.NotFoundException('Change Request', crId);
                if (changeRequest.dateDeleted)
                    throw new errors_utils_1.HttpException(400, 'Cannot use a deleted change request!');
                if (changeRequest.accepted === null)
                    throw new errors_utils_1.HttpException(400, 'Cannot implement an unreviewed change request');
                if (!changeRequest.accepted)
                    throw new errors_utils_1.HttpException(400, 'Cannot implement a denied change request');
                dateImplemented = (0, exports.getDateImplemented)(changeRequest);
                if (!dateImplemented && !changeRequest.dateReviewed)
                    throw new errors_utils_1.HttpException(400, 'Cannot use an unreviewed and unimplemented change request');
                if (dateImplemented && currentDate.getTime() - dateImplemented.getTime() > 1000 * 60 * 60 * 24 * 5)
                    throw new errors_utils_1.HttpException(400, 'Cannot tie changes to outdated change request');
                return [2 /*return*/, changeRequest];
        }
    });
}); };
exports.validateChangeRequestAccepted = validateChangeRequestAccepted;
/**
 * Calculates the status of a change request.
 * @param changeRequest: is the change request payload
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
var calculateChangeRequestStatus = function (changeRequest) {
    if (changeRequest.changes.length) {
        return shared_2.ChangeRequestStatus.Implemented;
    }
    else if (changeRequest.accepted && changeRequest.dateReviewed) {
        return shared_2.ChangeRequestStatus.Accepted;
    }
    else if (changeRequest.dateReviewed) {
        return shared_2.ChangeRequestStatus.Denied;
    }
    return shared_2.ChangeRequestStatus.Open;
};
exports.calculateChangeRequestStatus = calculateChangeRequestStatus;
var getDateImplemented = function (changeRequest) {
    return changeRequest.changes.reduce(function (res, change) {
        return !res || change.dateImplemented.valueOf() < res.valueOf() ? change.dateImplemented : res;
    }, undefined);
};
exports.getDateImplemented = getDateImplemented;
/**
 * Determines whether all the change requests in an array of change requests have been reviewed or implemented
 * @param changeRequests the given array of change requests
 * @returns true if all the change requests have been reviewed, and false otherwise
 */
var allChangeRequestsReviewed = function (changeRequests) {
    return changeRequests.every(function (changeRequest) { return changeRequest.dateReviewed || (0, exports.getDateImplemented)(changeRequest); });
};
exports.allChangeRequestsReviewed = allChangeRequestsReviewed;
/**
 * Determines if the project lead, project manager, and links all exist
 * @param name the name of the wbs element
 * @param links the links to be verified
 * @param descriptionBullets the description bullets to be verified
 * @param workPackageProposedChanges the work package proposed changes to be verified
 * @param organizationId the organization id the current user is in
 * @param carNumber the car number of the change request's WBS element
 * @param leadId the lead id to be verified
 * @param managerId the manager id to be verified
 */
var validateProposedChangesFields = function (originalElement, links, descriptionBullets, blockedBy, workPackageProposedChanges, organizationId, carNumber, leadId, managerId) { return __awaiter(void 0, void 0, void 0, function () {
    var lead, manager, linksWithLinkTypes, descriptionBulletsWithTypes, foundCarId, carWbs, promises, resolvedChanges, validatedBlockedBys;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!leadId) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: leadId }, include: { organizations: true } })];
            case 1:
                lead = _b.sent();
                if (!lead)
                    throw new errors_utils_1.NotFoundException('User', leadId);
                if (!lead.organizations.map(function (org) { return org.organizationId; }).includes(organizationId))
                    throw new errors_utils_1.HttpException(400, 'Project lead does not belong to the organization');
                _b.label = 2;
            case 2:
                if (!managerId) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: { userId: managerId },
                        include: { organizations: true }
                    })];
            case 3:
                manager = _b.sent();
                if (!manager)
                    throw new errors_utils_1.NotFoundException('User', managerId);
                if (!manager.organizations.map(function (org) { return org.organizationId; }).includes(organizationId))
                    throw new errors_utils_1.HttpException(400, 'Project manager does not belong to the organization');
                _b.label = 4;
            case 4:
                linksWithLinkTypes = links.map(function (link) { return __awaiter(void 0, void 0, void 0, function () {
                    var linkType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.link_Type.findUnique({
                                    where: { uniqueLinkType: { name: link.linkTypeName, organizationId: organizationId } }
                                })];
                            case 1:
                                linkType = _a.sent();
                                if (!linkType)
                                    throw new errors_utils_1.NotFoundException('Link Type', link.linkTypeName);
                                return [2 /*return*/, __assign(__assign({}, link), { linkType: linkType })];
                        }
                    });
                }); });
                descriptionBulletsWithTypes = descriptionBullets.map(function (bullet) { return __awaiter(void 0, void 0, void 0, function () {
                    var descriptionBulletType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.description_Bullet_Type.findUnique({
                                    where: { uniqueDescriptionBulletType: { name: bullet.type, organizationId: organizationId } }
                                })];
                            case 1:
                                descriptionBulletType = _a.sent();
                                if (!descriptionBulletType)
                                    throw new errors_utils_1.NotFoundException('Description Bullet Type', bullet.type);
                                return [2 /*return*/, __assign(__assign({}, bullet), { descriptionBulletType: descriptionBulletType })];
                        }
                    });
                }); });
                foundCarId = undefined;
                if (!(carNumber !== undefined)) return [3 /*break*/, 6];
                return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                        where: {
                            wbsNumber: {
                                carNumber: carNumber,
                                projectNumber: 0,
                                workPackageNumber: 0,
                                organizationId: organizationId
                            }
                        },
                        include: {
                            car: true
                        }
                    })];
            case 5:
                carWbs = _b.sent();
                if (!(carWbs === null || carWbs === void 0 ? void 0 : carWbs.car))
                    throw new errors_utils_1.NotFoundException('Car', carNumber);
                foundCarId = carWbs.car.carId;
                _b.label = 6;
            case 6:
                promises = workPackageProposedChanges.map(function (proposedChange) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, exports.validateProposedChangesFields)(proposedChange, [], proposedChange.descriptionBullets, proposedChange.blockedBy, [], organizationId, carNumber, proposedChange.leadId, proposedChange.managerId)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(promises)];
            case 7:
                resolvedChanges = _b.sent();
                return [4 /*yield*/, (0, work_packages_utils_1.validateBlockedBys)(blockedBy, organizationId)];
            case 8:
                validatedBlockedBys = _b.sent();
                _a = {
                    originalElement: originalElement
                };
                return [4 /*yield*/, Promise.all(linksWithLinkTypes)];
            case 9:
                _a.links = _b.sent();
                return [4 /*yield*/, Promise.all(descriptionBulletsWithTypes)];
            case 10: return [2 /*return*/, (_a.descriptionBullets = _b.sent(),
                    _a.validatedBlockedBys = validatedBlockedBys,
                    _a.carId = foundCarId,
                    _a.workPackageProposedChanges = resolvedChanges,
                    _a)];
        }
    });
}); };
exports.validateProposedChangesFields = validateProposedChangesFields;
/**
 * throws an error if there are any other open unreviewed or unimplemented change requests for this wbs element
 *
 * @param wbsElemId the wbs element id to find CRs with
 * @throws if the WBS element has open unreviewed change requests
 */
var validateNoUnreviewedOpenCRs = function (wbsElemId) { return __awaiter(void 0, void 0, void 0, function () {
    var openCRs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.change_Request.findMany({
                    where: { wbsElementId: wbsElemId, dateReviewed: null, dateDeleted: null, changes: { none: {} } }
                })];
            case 1:
                openCRs = _a.sent();
                if (openCRs.length > 1)
                    throw new errors_utils_1.HttpException(400, 'There are other open unreviewed change requests for this WBS element');
                return [2 /*return*/];
        }
    });
}); };
exports.validateNoUnreviewedOpenCRs = validateNoUnreviewedOpenCRs;
/**
 * throws an error if there are any other open unreviewed change requests for this other reason
 * @param otherReasonId the other reason Id to find CRs with
 * @throws if the Category has open unreviewed change requests
 *
 */
var validateNoUnreviewedOpenOtherReasonCRs = function (otherReasonId) { return __awaiter(void 0, void 0, void 0, function () {
    var openCRs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.change_Request.findMany({
                    where: { categoryId: otherReasonId, dateReviewed: null, dateDeleted: null }
                })];
            case 1:
                openCRs = _a.sent();
                if (openCRs.length > 1)
                    throw new errors_utils_1.HttpException(400, 'There are other open unreviewed change requests for this WBS element');
                return [2 /*return*/];
        }
    });
}); };
exports.validateNoUnreviewedOpenOtherReasonCRs = validateNoUnreviewedOpenOtherReasonCRs;
/**
 * throws an error if there are any other open unreviewed change requests for this account code
 * @param accountCodeId the account code id to find CRs with
 * @throws if the Account Code has open unreviewed change requests
 *
 */
var validateNoUnreviewedOpenAccountCodeCRs = function (accountCodeId) { return __awaiter(void 0, void 0, void 0, function () {
    var openCRs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.change_Request.findMany({
                    where: { accountCodeId: accountCodeId, dateReviewed: null, dateDeleted: null }
                })];
            case 1:
                openCRs = _a.sent();
                if (openCRs.length > 1)
                    throw new errors_utils_1.HttpException(400, 'There are other open unreviewed change requests for this WBS element');
                return [2 /*return*/];
        }
    });
}); };
exports.validateNoUnreviewedOpenAccountCodeCRs = validateNoUnreviewedOpenAccountCodeCRs;
/**
 * Applies the proposed changes by either creating a project if the newProject field is true or editing a project if the newProject field is false and there is an associated project
 * @param wbsProposedChanges the wbs proposed changes of the change request
 * @param projectProposedChanges  the project proposed changes of the change request
 * @param associatedProject the optional associated project of the change request
 * @param reviewer  the user reviewing the change request
 * @param crId  the change request id
 * @param carNumber the car number of the change request's WBS element
 */
var applyProjectProposedChanges = function (wbsProposedChanges, projectProposedChanges, associatedProject, reviewer, crId, carNumber, organization) { return __awaiter(void 0, void 0, void 0, function () {
    var links, descriptionBullets, projectWbsNum, proj, proj, _i, _a, proposedChange;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!projectProposedChanges) return [3 /*break*/, 8];
                links = wbsProposedChanges.links.map(function (link) {
                    return __assign(__assign({}, link), { linkTypeName: link.linkType.name });
                });
                descriptionBullets = wbsProposedChanges.proposedDescriptionBulletChanges.map(description_bullets_utils_1.descriptionBulletToDescriptionBulletPreview);
                projectWbsNum = null;
                if (!!associatedProject) return [3 /*break*/, 2];
                return [4 /*yield*/, projects_services_1.default.createProject(reviewer, crId, carNumber, wbsProposedChanges.name, projectProposedChanges.summary, projectProposedChanges.teams.map(function (team) { return team.teamId; }), projectProposedChanges.budget, links, descriptionBullets, wbsProposedChanges.leadId, wbsProposedChanges.managerId, organization)];
            case 1:
                proj = _b.sent();
                projectWbsNum = proj.wbsNum;
                return [3 /*break*/, 4];
            case 2:
                if (!associatedProject) return [3 /*break*/, 4];
                return [4 /*yield*/, projects_services_1.default.editProject(reviewer, associatedProject.projectId, crId, wbsProposedChanges.name, projectProposedChanges.budget, projectProposedChanges.summary, descriptionBullets, links, wbsProposedChanges.leadId, wbsProposedChanges.managerId, organization)];
            case 3:
                proj = _b.sent();
                projectWbsNum = proj.wbsNum;
                _b.label = 4;
            case 4:
                _i = 0, _a = projectProposedChanges.workPackageProposedChanges;
                _b.label = 5;
            case 5:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                proposedChange = _a[_i];
                return [4 /*yield*/, (0, exports.applyWorkPackageProposedChanges)(wbsProposedChanges, proposedChange, projectWbsNum, null, reviewer, crId, organization)];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.applyProjectProposedChanges = applyProjectProposedChanges;
/**
 * Applies the proposed changes by either creating a work package if the change request's WBS element is a project or editing a work package if the change request's WBS element is a work package
 * @param wbsProposedChanges the wbs proposed changes of the change request
 * @param workPackageProposedChanges the work package proposed changes of the change request
 * @param associatedProject the optional associated project of the change request
 * @param associatedWorkPackage  the optional associated work package of the change request
 * @param reviewer  the user reviewing the change request
 * @param crId  the change request id
 * @param organizationId the organization id of the user
 */
var applyWorkPackageProposedChanges = function (wbsProposedChanges, workPackageProposedChanges, existingWbsNum, associatedWorkPackage, reviewer, crId, organization) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!existingWbsNum) return [3 /*break*/, 2];
                return [4 /*yield*/, work_packages_services_1.default.createWorkPackage(reviewer, workPackageProposedChanges.wbsProposedChanges.name, crId, workPackageProposedChanges.stage, (0, datetime_utils_1.transformDate)(workPackageProposedChanges.startDate), workPackageProposedChanges.duration, workPackageProposedChanges.blockedBy, workPackageProposedChanges.wbsProposedChanges.proposedDescriptionBulletChanges.map(description_bullets_utils_1.descriptionBulletToDescriptionBulletPreview), existingWbsNum, organization)];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                if (!associatedWorkPackage) return [3 /*break*/, 4];
                return [4 /*yield*/, work_packages_services_1.default.editWorkPackage(reviewer, associatedWorkPackage.workPackageId, wbsProposedChanges.name, crId, workPackageProposedChanges.stage, (0, datetime_utils_1.transformDate)(workPackageProposedChanges.startDate), workPackageProposedChanges.duration, workPackageProposedChanges.blockedBy, wbsProposedChanges.proposedDescriptionBulletChanges.map(description_bullets_utils_1.descriptionBulletToDescriptionBulletPreview), wbsProposedChanges.leadId, wbsProposedChanges.managerId, organization)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.applyWorkPackageProposedChanges = applyWorkPackageProposedChanges;
/**
 * Reviews a proposed solution and automates the changes
 * @param psId the proposed solution id
 * @param foundCR the change request being reviewed
 * @param crId the change request id
 * @param reviewer  the user reviewing the change request
 */
var reviewProposedSolution = function (psId, foundCR, reviewer, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var foundPs, newBudget, change, wpProj, newBudget, updatedDuration, changes, changePromises;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, prisma_1.default.proposed_Solution.findUnique({
                    where: { proposedSolutionId: psId }
                })];
            case 1:
                foundPs = _e.sent();
                if (!foundPs || foundPs.scopeChangeRequestId !== ((_a = foundCR.scopeChangeRequest) === null || _a === void 0 ? void 0 : _a.scopeCrId))
                    throw new errors_utils_1.NotFoundException('Proposed Solution', psId);
                if (!(!((_b = foundCR.wbsElement) === null || _b === void 0 ? void 0 : _b.workPackage) && ((_c = foundCR.wbsElement) === null || _c === void 0 ? void 0 : _c.project))) return [3 /*break*/, 5];
                newBudget = foundCR.wbsElement.project.budget + foundPs.budgetImpact;
                change = (0, changes_utils_1.createChange)('Budget', foundCR.wbsElement.project.budget, newBudget, foundCR.crId, reviewer.userId, foundCR.wbsElementId, foundCR.categoryId, foundCR.accountCodeId);
                return [4 /*yield*/, prisma_1.default.project.update({
                        where: { projectId: foundCR.wbsElement.project.projectId },
                        data: {
                            budget: newBudget
                        }
                    })];
            case 2:
                _e.sent();
                if (!change) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.change.create({ data: change })];
            case 3:
                _e.sent();
                _e.label = 4;
            case 4: return [3 /*break*/, 11];
            case 5:
                if (!((_d = foundCR.wbsElement) === null || _d === void 0 ? void 0 : _d.workPackage)) return [3 /*break*/, 11];
                return [4 /*yield*/, prisma_1.default.project.findUnique({
                        where: { projectId: foundCR.wbsElement.workPackage.projectId },
                        include: { workPackages: (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organizationId) }
                    })];
            case 6:
                wpProj = _e.sent();
                if (!wpProj)
                    throw new errors_utils_1.NotFoundException('Project', foundCR.wbsElement.workPackage.projectId);
                newBudget = wpProj.budget + foundPs.budgetImpact;
                updatedDuration = foundCR.wbsElement.workPackage.duration + foundPs.timelineImpact;
                changes = [
                    (0, changes_utils_1.createChange)('Budget', wpProj.budget, newBudget, foundCR.crId, reviewer.userId, foundCR.wbsElementId, foundCR.categoryId, foundCR.accountCodeId),
                    (0, changes_utils_1.createChange)('Duration', foundCR.wbsElement.workPackage.duration, updatedDuration, foundCR.crId, reviewer.userId, foundCR.wbsElementId, foundCR.categoryId, foundCR.accountCodeId)
                ];
                if (!(foundPs.timelineImpact > 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, (0, exports.updateBlocking)(foundCR.wbsElement.workPackage, foundPs.timelineImpact, foundCR.crId, reviewer)];
            case 7:
                _e.sent();
                _e.label = 8;
            case 8: 
            // update the project and work package
            return [4 /*yield*/, prisma_1.default.project.update({
                    where: { projectId: foundCR.wbsElement.workPackage.projectId },
                    data: {
                        budget: newBudget,
                        workPackages: {
                            update: {
                                where: { workPackageId: foundCR.wbsElement.workPackage.workPackageId },
                                data: {
                                    duration: updatedDuration
                                }
                            }
                        }
                    }
                })];
            case 9:
                // update the project and work package
                _e.sent();
                changePromises = changes.map(function (change) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!change) return [3 /*break*/, 2];
                                return [4 /*yield*/, prisma_1.default.change.create({ data: change })];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(changePromises)];
            case 10:
                _e.sent();
                _e.label = 11;
            case 11: 
            // finally update the proposed solution
            return [4 /*yield*/, prisma_1.default.proposed_Solution.update({
                    where: { proposedSolutionId: psId },
                    data: {
                        approved: true
                    }
                })];
            case 12:
                // finally update the proposed solution
                _e.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.reviewProposedSolution = reviewProposedSolution;
/**
 * Sends a slack notification to the submitter of the change request that their change request has been reviewed
 * @param foundCR the change request that was reviewed
 */
var sendCRSubmitterReviewedNotification = function (foundCR) { return __awaiter(void 0, void 0, void 0, function () {
    var creatorUserSettings, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user_Settings.findUnique({ where: { userId: foundCR.submitterId } })];
            case 1:
                creatorUserSettings = _a.sent();
                if (!(creatorUserSettings && creatorUserSettings.slackId)) return [3 /*break*/, 5];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, slack_utils_1.sendSlackCRReviewedNotification)(creatorUserSettings.slackId, foundCR.crId, foundCR.identifier, foundCR.reviewNotes)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                if (err_1 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(err_1.message));
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.sendCRSubmitterReviewedNotification = sendCRSubmitterReviewedNotification;
var validateWbsElement = function (wbsNum, organization) { return __awaiter(void 0, void 0, void 0, function () {
    var wbsElement;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                    where: {
                        wbsNumber: __assign(__assign({}, wbsNum), { organizationId: organization.organizationId })
                    }
                })];
            case 1:
                wbsElement = _a.sent();
                if (!wbsElement)
                    throw new errors_utils_1.NotFoundException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                if (wbsElement.dateDeleted)
                    throw new errors_utils_1.DeletedException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                return [2 /*return*/, wbsElement];
        }
    });
}); };
exports.validateWbsElement = validateWbsElement;

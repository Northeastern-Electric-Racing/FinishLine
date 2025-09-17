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
var client_1 = require("@prisma/client");
var shared_1 = require("shared");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("../utils/errors.utils");
var work_packages_query_args_1 = require("../prisma-query-args/work-packages.query-args");
var work_packages_transformer_1 = require("../transformers/work-packages.transformer");
var change_requests_utils_1 = require("../utils/change-requests.utils");
var slack_utils_1 = require("../utils/slack.utils");
var changes_utils_1 = require("../utils/changes.utils");
var description_bullets_utils_1 = require("../utils/description-bullets.utils");
var work_packages_utils_1 = require("../utils/work-packages.utils");
var description_bullets_query_args_1 = require("../prisma-query-args/description-bullets.query-args");
var users_utils_1 = require("../utils/users.utils");
/** Service layer containing logic for work package controller functions. */
var WorkPackagesService = /** @class */ (function () {
    function WorkPackagesService() {
    }
    /**
     * Retrieve all work packages, optionally filtered by query parameters.
     *
     * @param query the filters on the query
     * @param organizationId the id of the organization that the user is currently in
     * @returns a list of work packages
     */
    WorkPackagesService.getAllWorkPackages = function (query, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var workPackages, outputWorkPackages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.work_Package.findMany(__assign({ where: { wbsElement: { dateDeleted: null, organizationId: organization.organizationId } } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)))];
                    case 1:
                        workPackages = _a.sent();
                        outputWorkPackages = workPackages.map(work_packages_transformer_1.default).filter(function (wp) {
                            var passes = true;
                            if (query.status)
                                passes && (passes = wp.status === query.status);
                            if (query.daysUntilDeadline) {
                                var daysToDeadline = Math.round((wp.endDate.getTime() - new Date().getTime()) / 86400000);
                                passes && (passes = daysToDeadline <= parseInt(query === null || query === void 0 ? void 0 : query.daysUntilDeadline));
                            }
                            return passes;
                        });
                        outputWorkPackages.sort(function (wpA, wpB) { return wpA.endDate.getTime() - wpB.endDate.getTime(); });
                        return [2 /*return*/, outputWorkPackages];
                }
            });
        });
    };
    /**
     * Retrieve the work package with the specified WBS number.
     * @param parsedWbs the WBS number of the desired work package
     * @param organizationId the id of the organization that the user is currently in
     * @returns the desired work package
     * @throws if the work package with the desired WBS number is not found, is deleted or is not part of the given organization
     */
    WorkPackagesService.getSingleWorkPackage = function (parsedWbs, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var wp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, shared_1.isWorkPackageWbs)(parsedWbs)) {
                            throw new errors_utils_1.HttpException(404, 'WBS Number ' + (0, shared_1.wbsPipe)(parsedWbs) + ' is a not a work package WBS#');
                        }
                        return [4 /*yield*/, prisma_1.default.work_Package.findFirst(__assign({ where: {
                                    wbsElement: {
                                        dateDeleted: null,
                                        carNumber: parsedWbs.carNumber,
                                        projectNumber: parsedWbs.projectNumber,
                                        workPackageNumber: parsedWbs.workPackageNumber
                                    }
                                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)))];
                    case 1:
                        wp = _a.sent();
                        if (!wp)
                            throw new errors_utils_1.NotFoundException('Work Package', "".concat(parsedWbs.carNumber, ".").concat(parsedWbs.projectNumber, ".").concat(parsedWbs.workPackageNumber));
                        if (wp.wbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Work Package', wp.wbsElementId);
                        if (wp.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Work Package');
                        return [2 /*return*/, (0, work_packages_transformer_1.default)(wp)];
                }
            });
        });
    };
    /**
     * Retrieve a subset of work packages.
     * @param wbsNums the WBS numbers of the work packages to retrieve
     * @param organizationId the id of the organization that the user is currently in
     * @returns the work packages with the given WBS numbers
     * @throws if any of the work packages are not found or are not part of the organization
     */
    WorkPackagesService.getManyWorkPackages = function (wbsNums, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var workPackagePromises, resolvedWorkPackages;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wbsNums.forEach(function (wbsNum) {
                            if (!(0, shared_1.isWorkPackageWbs)(wbsNum)) {
                                throw new errors_utils_1.HttpException(404, "WBS Number ".concat(wbsNum.carNumber, ".").concat(wbsNum.projectNumber, ".").concat(wbsNum.workPackageNumber, " is not a Work Package WBS#"));
                            }
                        });
                        workPackagePromises = wbsNums.map(function (wbsNum) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, WorkPackagesService.getSingleWorkPackage(wbsNum, organization)];
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(workPackagePromises)];
                    case 1:
                        resolvedWorkPackages = _a.sent();
                        return [2 /*return*/, resolvedWorkPackages];
                }
            });
        });
    };
    /**
     * Creates a Work_Package in the database
     * @param user the user creating the work package
     * @param name the name of the new work package
     * @param crId the id of the change request creating this work package
     * @param stage the stage of the work package
     * @param startDate the date string representing the start date
     * @param duration the expected duration of this work package, in weeks
     * @param blockedBy the WBS elements that need to be completed before this WP
     * @param descriptionBullets the description bullets associated with this WP
     * @param organizationId the id of the organization that the user is currently in
     * @returns the WBS number of the successfully created work package
     * @throws if the work package could not be created
     */
    WorkPackagesService.createWorkPackage = function (user, name, crId, stage, startDate, duration, blockedBy, descriptionBullets, projectWbsNum, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var blockedByElements, carNumber, projectNumber, project, projectId, _a, leadId, managerId, newWorkPackageNumber, date, changesToCreate, created, changes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        if (_b.sent())
                            throw new errors_utils_1.AccessDeniedGuestException('create work packages');
                        if (!crId) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, change_requests_utils_1.validateChangeRequestAccepted)(crId)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, (0, work_packages_utils_1.validateBlockedBys)(blockedBy, organization.organizationId)];
                    case 4:
                        blockedByElements = _b.sent();
                        carNumber = projectWbsNum.carNumber, projectNumber = projectWbsNum.projectNumber;
                        return [4 /*yield*/, prisma_1.default.project.findFirst({
                                where: {
                                    wbsElement: {
                                        carNumber: carNumber,
                                        projectNumber: projectNumber,
                                        organizationId: organization.organizationId,
                                        dateDeleted: null
                                    }
                                },
                                include: {
                                    workPackages: {
                                        where: { wbsElement: { dateDeleted: null } },
                                        include: {
                                            wbsElement: true
                                        }
                                    },
                                    wbsElement: true
                                }
                            })];
                    case 5:
                        project = _b.sent();
                        if (!project) {
                            throw new errors_utils_1.NotFoundException('Project', "".concat(carNumber, ".").concat(projectNumber, ".0"));
                        }
                        projectId = project.projectId;
                        _a = project.wbsElement, leadId = _a.leadId, managerId = _a.managerId;
                        newWorkPackageNumber = project.workPackages
                            .map(function (element) { return element.wbsElement.workPackageNumber; })
                            .reduce(function (prev, curr) { return Math.max(prev, curr); }, 0) + 1;
                        date = new Date(startDate.split('T')[0]);
                        date.setTime(date.getTime() + 12 * 60 * 60 * 1000);
                        changesToCreate = crId
                            ? [
                                {
                                    changeRequestId: crId,
                                    implementerId: user.userId,
                                    detail: 'New Work Package Created'
                                }
                            ]
                            : [];
                        return [4 /*yield*/, prisma_1.default.work_Package.create(__assign({ data: {
                                    wbsElement: {
                                        create: {
                                            carNumber: carNumber,
                                            projectNumber: projectNumber,
                                            workPackageNumber: newWorkPackageNumber,
                                            name: name,
                                            changes: {
                                                createMany: { data: changesToCreate }
                                            },
                                            organizationId: organization.organizationId,
                                            leadId: leadId,
                                            managerId: managerId
                                        }
                                    },
                                    stage: stage,
                                    project: { connect: { projectId: projectId } },
                                    startDate: date,
                                    duration: duration,
                                    orderInProject: project.workPackages.length + 1,
                                    blockedBy: { connect: blockedByElements.map(function (ele) { return ({ wbsElementId: ele.wbsElementId }); }) }
                                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)))];
                    case 6:
                        created = _b.sent();
                        return [4 /*yield*/, (0, changes_utils_1.getWorkPackageChanges)(null, name, null, stage, null, new Date(startDate), null, duration, [], blockedByElements, null, leadId, null, managerId, [], descriptionBullets, crId, created.wbsElementId, user.userId)];
                    case 7:
                        changes = _b.sent();
                        // Add the description bullets to the workpackage
                        return [4 /*yield*/, (0, description_bullets_utils_1.addRawDescriptionBullets)(descriptionBullets, description_bullets_utils_1.DescriptionBulletDestination.WBS_ELEMENT, created.wbsElement.wbsElementId, created.wbsElement.organizationId)];
                    case 8:
                        // Add the description bullets to the workpackage
                        _b.sent();
                        return [4 /*yield*/, prisma_1.default.change.createMany({ data: changes.changes })];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, (0, work_packages_transformer_1.default)(created)];
                }
            });
        });
    };
    /**
     * Edits a Work Package in the database
     * @param user the user editing the work package
     * @param workPackageId the id of the work package
     * @param name the new name of the work package
     * @param crId the id of the change request implementing this edit
     * @param startDate the date string representing the new start date
     * @param duration the new duration of this work package, in weeks
     * @param blockedBy the new WBS elements to be completed before this WP
     * @param descriptionBullets the new description bullets associated with this WP
     * @param leadId the new lead for this work package
     * @param managerId the new manager for this work package
     * @param organizationId the id of the organization that the user is currently in
     */
    WorkPackagesService.editWorkPackage = function (user, workPackageId, name, crId, stage, startDate, duration, blockedBy, descriptionBullets, leadId, managerId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, originalWorkPackage, wbsElementId, blockedByElems, changes, date, status, updatedWorkPackage, timelineImpact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = user.userId;
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        // verify user is allowed to edit work packages
                        if (_a.sent())
                            throw new errors_utils_1.AccessDeniedGuestException('edit work packages');
                        return [4 /*yield*/, prisma_1.default.work_Package.findUnique({
                                where: { workPackageId: workPackageId },
                                include: {
                                    wbsElement: {
                                        include: {
                                            descriptionBullets: (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organization.organizationId)
                                        }
                                    },
                                    blockedBy: true
                                }
                            })];
                    case 2:
                        originalWorkPackage = _a.sent();
                        if (!originalWorkPackage)
                            throw new errors_utils_1.NotFoundException('Work Package', workPackageId);
                        if (originalWorkPackage.wbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Work Package', workPackageId);
                        if (originalWorkPackage.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Work Package');
                        // the crId must match a valid approved change request
                        return [4 /*yield*/, (0, change_requests_utils_1.validateChangeRequestAccepted)(crId)];
                    case 3:
                        // the crId must match a valid approved change request
                        _a.sent();
                        wbsElementId = originalWorkPackage.wbsElementId;
                        return [4 /*yield*/, (0, work_packages_utils_1.validateBlockedBys)(blockedBy, organization.organizationId)];
                    case 4:
                        blockedByElems = _a.sent();
                        return [4 /*yield*/, (0, changes_utils_1.getWorkPackageChanges)(originalWorkPackage.wbsElement.name, name, originalWorkPackage.stage, stage, originalWorkPackage.startDate, new Date(startDate), originalWorkPackage.duration, duration, originalWorkPackage.blockedBy, blockedByElems, originalWorkPackage.wbsElement.managerId, leadId, originalWorkPackage.wbsElement.leadId, managerId, originalWorkPackage.wbsElement.descriptionBullets, descriptionBullets, crId, wbsElementId, userId)];
                    case 5:
                        changes = _a.sent();
                        date = new Date(startDate);
                        date.setTime(date.getTime() + 12 * 60 * 60 * 1000);
                        status = originalWorkPackage.wbsElement.status === shared_1.WbsElementStatus.Complete
                            ? shared_1.WbsElementStatus.Active
                            : originalWorkPackage.wbsElement.status;
                        return [4 /*yield*/, prisma_1.default.work_Package.update(__assign({ where: { wbsElementId: wbsElementId }, data: {
                                    startDate: date,
                                    duration: duration,
                                    wbsElement: {
                                        update: {
                                            name: name,
                                            leadId: leadId,
                                            managerId: managerId,
                                            status: status
                                        }
                                    },
                                    stage: stage,
                                    blockedBy: {
                                        set: [], // remove all the connections then add all the given ones
                                        connect: blockedByElems.map(function (ele) { return ({ wbsElementId: ele.wbsElementId }); })
                                    }
                                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)))];
                    case 6:
                        updatedWorkPackage = _a.sent();
                        timelineImpact = (updatedWorkPackage.startDate.getTime() - originalWorkPackage.startDate.getTime()) / 1000 / 60 / 60 / 24 / 7 +
                            updatedWorkPackage.duration -
                            originalWorkPackage.duration;
                        return [4 /*yield*/, (0, change_requests_utils_1.updateBlocking)(updatedWorkPackage, timelineImpact, crId, user)];
                    case 7:
                        _a.sent();
                        if (!(changes.deletedDescriptionBullets.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, prisma_1.default.description_Bullet.updateMany({
                                where: { descriptionId: { in: changes.deletedDescriptionBullets.map(function (descriptionBullet) { return descriptionBullet.id; }) } },
                                data: { dateDeleted: new Date() }
                            })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: 
                    // Add the new description bullets to the workpackage
                    return [4 /*yield*/, (0, description_bullets_utils_1.addRawDescriptionBullets)(changes.addedDescriptionBullets, description_bullets_utils_1.DescriptionBulletDestination.WBS_ELEMENT, wbsElementId, originalWorkPackage.wbsElement.organizationId)];
                    case 10:
                        // Add the new description bullets to the workpackage
                        _a.sent();
                        // edit the expected changes and deliverables
                        return [4 /*yield*/, (0, description_bullets_utils_1.editDescriptionBullets)(changes.editedDescriptionBullets, originalWorkPackage.wbsElement.organizationId)];
                    case 11:
                        // edit the expected changes and deliverables
                        _a.sent();
                        // create the changes in prisma
                        return [4 /*yield*/, prisma_1.default.change.createMany({ data: changes.changes })];
                    case 12:
                        // create the changes in prisma
                        _a.sent();
                        return [2 /*return*/, (0, work_packages_transformer_1.default)(updatedWorkPackage)];
                }
            });
        });
    };
    /**
     * Deletes the Work Package
     * @param submitter The user who deleted the work package
     * @param wbsNum The work package number to be deleted
     * @param organizationId The organization id that the user is in
     */
    WorkPackagesService.deleteWorkPackage = function (submitter, wbsNum, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var workPackage, wbsElementId, workPackageId, dateDeleted, deletedByUserId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        // Verify submitter is allowed to delete work packages
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('delete work packages');
                        return [4 /*yield*/, WorkPackagesService.getSingleWorkPackage(wbsNum, organization)];
                    case 2:
                        workPackage = _a.sent();
                        wbsElementId = workPackage.wbsElementId, workPackageId = workPackage.id;
                        dateDeleted = new Date();
                        deletedByUserId = submitter.userId;
                        // Soft delete the work package by updating its related "deleted" fields
                        return [4 /*yield*/, prisma_1.default.work_Package.update({
                                where: {
                                    workPackageId: workPackageId
                                },
                                data: {
                                    // Soft delete the given wp's wbs by setting crs to denied and soft deleting tasks
                                    wbsElement: {
                                        update: {
                                            changeRequests: {
                                                updateMany: {
                                                    where: {
                                                        wbsElementId: wbsElementId
                                                    },
                                                    data: {
                                                        accepted: false,
                                                        dateReviewed: dateDeleted
                                                    }
                                                }
                                            },
                                            tasks: {
                                                updateMany: {
                                                    where: {
                                                        wbsElementId: wbsElementId
                                                    },
                                                    data: {
                                                        dateDeleted: dateDeleted,
                                                        deletedByUserId: deletedByUserId
                                                    }
                                                }
                                            },
                                            dateDeleted: dateDeleted,
                                            deletedByUserId: deletedByUserId,
                                            descriptionBullets: {
                                                updateMany: {
                                                    where: {
                                                        wbsElementId: wbsElementId
                                                    },
                                                    data: {
                                                        dateDeleted: dateDeleted
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            })];
                    case 3:
                        // Soft delete the work package by updating its related "deleted" fields
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the work packages the given work package is blocking
     * @param wbsNum the wbs number of the work package to get the blocking work packages for
     * @param organizationId the id of the organization that the user is currently in
     * @returns the blocking work packages for the given work package
     */
    WorkPackagesService.getBlockingWorkPackages = function (wbsNum, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var carNumber, projectNumber, workPackageNumber, wbsElement, workPackage, blockingWorkPackages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        carNumber = wbsNum.carNumber, projectNumber = wbsNum.projectNumber, workPackageNumber = wbsNum.workPackageNumber;
                        // is a project or car so just return empty array until we implement blocking projects/cars
                        if (!(0, shared_1.isWorkPackageWbs)(wbsNum))
                            return [2 /*return*/, []];
                        return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                                where: {
                                    wbsNumber: {
                                        carNumber: carNumber,
                                        projectNumber: projectNumber,
                                        workPackageNumber: workPackageNumber,
                                        organizationId: organization.organizationId
                                    }
                                },
                                include: {
                                    workPackage: (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)
                                }
                            })];
                    case 1:
                        wbsElement = _a.sent();
                        workPackage = wbsElement === null || wbsElement === void 0 ? void 0 : wbsElement.workPackage;
                        if (!workPackage)
                            throw new errors_utils_1.NotFoundException('Work Package', (0, shared_1.wbsPipe)(wbsNum));
                        if (workPackage.wbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Work Package', workPackage.wbsElementId);
                        if (workPackage.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Work Package');
                        return [4 /*yield*/, (0, work_packages_utils_1.getBlockingWorkPackages)(workPackage)];
                    case 2:
                        blockingWorkPackages = _a.sent();
                        return [2 /*return*/, blockingWorkPackages.map(work_packages_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Send a slack message to the project lead of each work package telling them when their work package is due.
     * Sends a message for every work package that is due before or on the given deadline (even before today)
     * @param user - the user doing the sending
     * @param deadline - the deadline
     * @param organizationId - the id of the organization that the user is currently in
     * @returns void
     */
    WorkPackagesService.slackMessageUpcomingDeadlines = function (user, deadline, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var workPackages, upcomingWorkPackages;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('send the upcoming deadlines slack messages');
                        return [4 /*yield*/, prisma_1.default.work_Package.findMany(__assign({ where: {
                                    wbsElement: { dateDeleted: null, status: client_1.WBS_Element_Status.ACTIVE, organizationId: organization.organizationId }
                                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)))];
                    case 2:
                        workPackages = _a.sent();
                        upcomingWorkPackages = workPackages
                            .filter(function (wp) { return (0, shared_1.getDay)((0, shared_1.calculateEndDate)(wp.startDate, wp.duration)) <= (0, shared_1.getDay)(deadline); })
                            .sort(function (a, b) { return (0, shared_1.calculateEndDate)(a.startDate, a.duration).getTime() - (0, shared_1.calculateEndDate)(b.startDate, b.duration).getTime(); });
                        // have to do it like this so it goes sequentially and we can sleep between each because of rate limiting
                        return [4 /*yield*/, upcomingWorkPackages.reduce(function (previousCall, workPackage) {
                                return previousCall.then(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, (0, slack_utils_1.sendSlackUpcomingDeadlineNotification)(workPackage)];
                                            case 1:
                                                _a.sent(); // send the slack message for this work package
                                                return [4 /*yield*/, new Promise(function (callBack) { return setTimeout(callBack, 2000); })];
                                            case 2:
                                                _a.sent(); // sleep for 2 seconds
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            }, Promise.resolve())];
                    case 3:
                        // have to do it like this so it goes sequentially and we can sleep between each because of rate limiting
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WorkPackagesService;
}());
exports.default = WorkPackagesService;

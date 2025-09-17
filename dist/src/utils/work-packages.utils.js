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
exports.validateBlockedByTemplates = exports.validateBlockedBys = exports.deleteBlockingTemplates = exports.getBlockingWorkPackages = exports.calculateWorkPackageProgress = void 0;
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
var work_packages_query_args_1 = require("../prisma-query-args/work-packages.query-args");
var calculateWorkPackageProgress = function (deliverables, expectedActivities) {
    var bullets = deliverables.concat(expectedActivities);
    return bullets.length === 0 ? 0 : Math.floor((bullets.filter(function (b) { return b.dateTimeChecked; }).length / bullets.length) * 100);
};
exports.calculateWorkPackageProgress = calculateWorkPackageProgress;
/**
 * Gets all the work packages the given work package is blocking
 * @param initialWorkPackage the work package to get the blocking work packages for
 * @returns an array of the blocking work packages
 */
var getBlockingWorkPackages = function (initialWorkPackage) { return __awaiter(void 0, void 0, void 0, function () {
    var seenWbsElementIds, blockingUpdateQueue, blockingWorkPackages, currWbsId, currWbs, newBlocking;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                seenWbsElementIds = new Set([initialWorkPackage.wbsElement.wbsElementId]);
                blockingUpdateQueue = initialWorkPackage.wbsElement.blocking.map(function (blocking) { return blocking.wbsElementId; });
                blockingWorkPackages = [];
                _a.label = 1;
            case 1:
                if (!(blockingUpdateQueue.length > 0)) return [3 /*break*/, 3];
                currWbsId = blockingUpdateQueue.pop();
                if (!currWbsId)
                    return [3 /*break*/, 3]; // this is more of a type check for pop becuase the while loop prevents this from not existing
                if (seenWbsElementIds.has(currWbsId))
                    return [3 /*break*/, 1]; // if we've already seen it we skip it
                seenWbsElementIds.add(currWbsId);
                return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                        where: { wbsElementId: currWbsId },
                        include: {
                            blocking: true,
                            workPackage: __assign({}, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(initialWorkPackage.wbsElement.organizationId))
                        }
                    })];
            case 2:
                currWbs = _a.sent();
                if ((currWbs === null || currWbs === void 0 ? void 0 : currWbs.wbsElementId) === initialWorkPackage.wbsElementId)
                    throw new errors_utils_1.HttpException(400, 'Circular dependency detected');
                if (!currWbs)
                    throw new errors_utils_1.NotFoundException('WBS Element', currWbsId);
                if (currWbs.dateDeleted)
                    return [3 /*break*/, 1]; // this wbs element has been deleted so skip it
                if (!currWbs.workPackage)
                    return [3 /*break*/, 1]; // this wbs element is a project so skip it
                newBlocking = currWbs.blocking.map(function (blocking) { return blocking.wbsElementId; });
                blockingUpdateQueue.push.apply(blockingUpdateQueue, newBlocking);
                blockingWorkPackages.push(currWbs.workPackage);
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/, blockingWorkPackages];
        }
    });
}); };
exports.getBlockingWorkPackages = getBlockingWorkPackages;
var deleteBlockingTemplates = function (workPackageTemplate, submitter) { return __awaiter(void 0, void 0, void 0, function () {
    var seenWorkPackageTemplateIds, blockingIdUpdateQueue, currentBlockingId, currentBlocking, newBlocking, dateDeleted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                seenWorkPackageTemplateIds = new Set(workPackageTemplate.wbsElementTemplateId);
                blockingIdUpdateQueue = workPackageTemplate.blocking.map(function (blocking) { return blocking.wbsElementTemplateId; });
                _a.label = 1;
            case 1:
                if (!(blockingIdUpdateQueue.length > 0)) return [3 /*break*/, 4];
                currentBlockingId = blockingIdUpdateQueue.pop();
                if (!currentBlockingId)
                    return [3 /*break*/, 4];
                if (seenWorkPackageTemplateIds.has(currentBlockingId))
                    return [3 /*break*/, 1]; // if we've already seen it we skip it
                seenWorkPackageTemplateIds.add(currentBlockingId);
                return [4 /*yield*/, prisma_1.default.work_Package_Template.findUnique({
                        where: {
                            wbsElementTemplateId: currentBlockingId
                        },
                        include: {
                            blocking: true,
                            wbsElementTemplate: true
                        }
                    })];
            case 2:
                currentBlocking = _a.sent();
                if ((currentBlocking === null || currentBlocking === void 0 ? void 0 : currentBlocking.wbsElementTemplateId) === workPackageTemplate.wbsElementTemplateId) {
                    throw new errors_utils_1.HttpException(400, 'Circular dependency detected');
                }
                if (!currentBlocking)
                    throw new errors_utils_1.NotFoundException('Work Package Template', currentBlockingId);
                if (currentBlocking.wbsElementTemplate.dateDeleted)
                    return [3 /*break*/, 1]; // skip if this work package template has been deleted
                newBlocking = currentBlocking.blocking.map(function (blocking) { return blocking.wbsElementTemplateId; });
                blockingIdUpdateQueue.push.apply(blockingIdUpdateQueue, newBlocking);
                dateDeleted = new Date();
                // delete the work package template
                return [4 /*yield*/, prisma_1.default.work_Package_Template.update({
                        where: {
                            wbsElementTemplateId: currentBlockingId
                        },
                        data: {
                            wbsElementTemplate: {
                                update: {
                                    dateDeleted: dateDeleted,
                                    userDeleted: {
                                        connect: {
                                            userId: submitter.userId
                                        }
                                    }
                                }
                            }
                        }
                    })];
            case 3:
                // delete the work package template
                _a.sent();
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteBlockingTemplates = deleteBlockingTemplates;
var validateBlockedBys = function (blockedBy, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var blockedByWBSElems, blockedByIds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockedBy.forEach(function (dep) {
                    if (dep.workPackageNumber === 0) {
                        throw new errors_utils_1.HttpException(400, 'A Project cannot be a Blocker');
                    }
                });
                return [4 /*yield*/, Promise.all(blockedBy.map(function (ele) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                                        where: {
                                            wbsNumber: {
                                                carNumber: ele.carNumber,
                                                projectNumber: ele.projectNumber,
                                                workPackageNumber: ele.workPackageNumber,
                                                organizationId: organizationId
                                            }
                                        }
                                    })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }))];
            case 1:
                blockedByWBSElems = _a.sent();
                blockedByIds = [];
                blockedByWBSElems.forEach(function (elem) {
                    if (!elem) {
                        throw new errors_utils_1.HttpException(400, 'One of the blockers was not found.');
                    }
                    else {
                        blockedByIds.push(elem);
                    }
                });
                return [2 /*return*/, blockedByIds];
        }
    });
}); };
exports.validateBlockedBys = validateBlockedBys;
var validateBlockedByTemplates = function (blockedByIds, originalTemplateId) { return __awaiter(void 0, void 0, void 0, function () {
    var blockedByTemplates;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.work_Package_Template.findMany({
                    where: {
                        wbsElementTemplateId: {
                            in: blockedByIds
                        }
                    }
                })];
            case 1:
                blockedByTemplates = _a.sent();
                if (blockedByTemplates.length !== blockedByIds.length) {
                    throw new errors_utils_1.HttpException(400, 'One of the blockers is not a Work Package Template.');
                }
                if (blockedByIds.includes(originalTemplateId)) {
                    throw new errors_utils_1.HttpException(400, 'A Work Package Template cannot block itself.');
                }
                return [2 /*return*/, blockedByTemplates];
        }
    });
}); };
exports.validateBlockedByTemplates = validateBlockedByTemplates;

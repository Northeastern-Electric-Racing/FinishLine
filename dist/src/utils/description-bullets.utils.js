"use strict";
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
exports.markDescriptionBulletsAsDeleted = exports.validateDescriptionBulletType = exports.validateDescriptionBullets = exports.editDescriptionBullets = exports.addRawDescriptionBullets = exports.DescriptionBulletDestination = exports.addDescriptionBulletsToProjectTemplate = exports.addDescriptionBulletsToWorkPackageTemplate = exports.addDescriptionBulletsToWbsElement = exports.descBulletConverter = exports.descriptionBulletsToChangeListValues = exports.descriptionBulletToDescriptionBulletPreview = exports.descriptionBulletToChangeListValue = exports.throwIfUncheckedDescriptionBullets = exports.hasBulletCheckingPermissions = exports.separateDescriptionBulletsByType = void 0;
var prisma_1 = require("../prisma/prisma");
var shared_1 = require("shared");
var errors_utils_1 = require("./errors.utils");
var users_utils_1 = require("./users.utils");
var separateDescriptionBulletsByType = function (descriptionBullets) {
    var _a;
    var descriptionBulletsSeparatedByType = new Map();
    for (var _i = 0, descriptionBullets_1 = descriptionBullets; _i < descriptionBullets_1.length; _i++) {
        var descriptionBullet = descriptionBullets_1[_i];
        if (descriptionBulletsSeparatedByType.has(descriptionBullet.type)) {
            (_a = descriptionBulletsSeparatedByType.get(descriptionBullet.type)) === null || _a === void 0 ? void 0 : _a.push(descriptionBullet);
        }
        else {
            descriptionBulletsSeparatedByType.set(descriptionBullet.type, [descriptionBullet]);
        }
    }
    return descriptionBulletsSeparatedByType;
};
exports.separateDescriptionBulletsByType = separateDescriptionBulletsByType;
var hasBulletCheckingPermissions = function (user, descriptionId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var descriptionBullet, leader, manager;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.description_Bullet.findUnique({
                    where: { descriptionId: descriptionId },
                    include: {
                        wbsElement: {
                            include: {
                                lead: true,
                                manager: true
                            }
                        }
                    }
                })];
            case 1:
                descriptionBullet = _a.sent();
                if (!user || !descriptionBullet || !descriptionBullet.wbsElement)
                    return [2 /*return*/, false];
                leader = descriptionBullet.wbsElement.lead;
                manager = descriptionBullet.wbsElement.manager;
                return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organizationId, shared_1.isLeadership)];
            case 2: return [2 /*return*/, ((_a.sent()) ||
                    (leader && leader.userId === user.userId) ||
                    (manager && manager.userId === user.userId))];
        }
    });
}); };
exports.hasBulletCheckingPermissions = hasBulletCheckingPermissions;
/**
 * Validates that there are no unchecked expected activities or delivrerables
 * @param workPackage Work package to check bullets for
 * @throws if there are any unchecked expected activities or deliverables
 */
var throwIfUncheckedDescriptionBullets = function (descriptionBullets) {
    // checks for any unchecked expected activities, if there are any it will return an error
    if (descriptionBullets.some(function (element) { return element.dateTimeChecked === null && element.dateDeleted === null; }))
        throw new errors_utils_1.HttpException(400, "Work Package has unchecked expected activities");
};
exports.throwIfUncheckedDescriptionBullets = throwIfUncheckedDescriptionBullets;
var descriptionBulletToChangeListValue = function (descriptionBullet) {
    return {
        element: descriptionBullet,
        comparator: "".concat(descriptionBullet.detail),
        displayValue: descriptionBullet.detail
    };
};
exports.descriptionBulletToChangeListValue = descriptionBulletToChangeListValue;
var descriptionBulletToDescriptionBulletPreview = function (descriptionBullet) {
    return {
        id: descriptionBullet.descriptionId,
        detail: descriptionBullet.detail,
        type: descriptionBullet.descriptionBulletType.name
    };
};
exports.descriptionBulletToDescriptionBulletPreview = descriptionBulletToDescriptionBulletPreview;
var descriptionBulletsToChangeListValues = function (descriptionBullets) {
    return descriptionBullets
        .filter(function (bullet) { return !bullet.dateDeleted; })
        .map(function (bullet) { return (0, exports.descriptionBulletToChangeListValue)((0, exports.descBulletConverter)(bullet)); });
};
exports.descriptionBulletsToChangeListValues = descriptionBulletsToChangeListValues;
/**
 * Converts a DescriptionBulletWithType to a DescriptionBullet
 * @param descBullet the DescriptionBulletWithType to convert
 * @returns the converted DescriptionBullet
 */
var descBulletConverter = function (descBullet) {
    var _a;
    return {
        id: descBullet.descriptionId,
        detail: descBullet.detail,
        dateAdded: descBullet.dateAdded,
        dateDeleted: (_a = descBullet.dateDeleted) !== null && _a !== void 0 ? _a : undefined,
        type: descBullet.descriptionBulletType.name
    };
};
exports.descBulletConverter = descBulletConverter;
// helper method to add the given description bullets into the database, linked to the given wbs element id
var addDescriptionBulletsToWbsElement = function (addedDetails, wbsElementId, typeName, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var wbsElement, foundType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({ where: { wbsElementId: wbsElementId } })];
            case 1:
                wbsElement = _a.sent();
                if (!wbsElement)
                    throw new errors_utils_1.NotFoundException('WBS Element', wbsElementId);
                return [4 /*yield*/, (0, exports.validateDescriptionBulletType)(typeName, organizationId)];
            case 2:
                foundType = _a.sent();
                if (!(addedDetails.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.description_Bullet.createMany({
                        data: addedDetails.map(function (element) {
                            return {
                                detail: element,
                                wbsElementId: wbsElement.wbsElementId,
                                descriptionBulletTypeId: foundType.id
                            };
                        })
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addDescriptionBulletsToWbsElement = addDescriptionBulletsToWbsElement;
var addDescriptionBulletsToWorkPackageTemplate = function (addedDetails, templateId, typeName, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var template, foundType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.work_Package_Template.findUnique({ where: { wbsElementTemplateId: templateId } })];
            case 1:
                template = _a.sent();
                if (!template)
                    throw new errors_utils_1.NotFoundException('Work Package Template', templateId);
                return [4 /*yield*/, (0, exports.validateDescriptionBulletType)(typeName, organizationId)];
            case 2:
                foundType = _a.sent();
                if (!(addedDetails.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.description_Bullet.createMany({
                        data: addedDetails.map(function (element) {
                            return {
                                detail: element,
                                workPackageTemplateId: templateId,
                                descriptionBulletTypeId: foundType.id
                            };
                        })
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addDescriptionBulletsToWorkPackageTemplate = addDescriptionBulletsToWorkPackageTemplate;
var addDescriptionBulletsToProjectTemplate = function (addedDetails, templateId, typeName, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var template, foundType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.project_Template.findUnique({ where: { wbsElementTemplateId: templateId } })];
            case 1:
                template = _a.sent();
                if (!template)
                    throw new errors_utils_1.NotFoundException('Project Template', templateId);
                return [4 /*yield*/, (0, exports.validateDescriptionBulletType)(typeName, organizationId)];
            case 2:
                foundType = _a.sent();
                if (!(addedDetails.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.description_Bullet.createMany({
                        data: addedDetails.map(function (element) {
                            return {
                                detail: element,
                                projectTemplateId: templateId,
                                descriptionBulletTypeId: foundType.id
                            };
                        })
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addDescriptionBulletsToProjectTemplate = addDescriptionBulletsToProjectTemplate;
var DescriptionBulletDestination;
(function (DescriptionBulletDestination) {
    DescriptionBulletDestination[DescriptionBulletDestination["WBS_ELEMENT"] = 0] = "WBS_ELEMENT";
    DescriptionBulletDestination[DescriptionBulletDestination["WORK_PACKAGE_TEMPLATE"] = 1] = "WORK_PACKAGE_TEMPLATE";
    DescriptionBulletDestination[DescriptionBulletDestination["PROJECT_TEMPLATE"] = 2] = "PROJECT_TEMPLATE";
    DescriptionBulletDestination[DescriptionBulletDestination["PROPOSED_CHANGES"] = 3] = "PROPOSED_CHANGES";
})(DescriptionBulletDestination || (exports.DescriptionBulletDestination = DescriptionBulletDestination = {}));
var addRawDescriptionBullets = function (descriptionBullets, destination, destinationId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var descriptionBulletsSeparatedByType, promises, _i, descriptionBulletsSeparatedByType_1, _a, type, bullets;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                descriptionBulletsSeparatedByType = (0, exports.separateDescriptionBulletsByType)(descriptionBullets);
                promises = [];
                for (_i = 0, descriptionBulletsSeparatedByType_1 = descriptionBulletsSeparatedByType; _i < descriptionBulletsSeparatedByType_1.length; _i++) {
                    _a = descriptionBulletsSeparatedByType_1[_i], type = _a[0], bullets = _a[1];
                    switch (destination) {
                        case DescriptionBulletDestination.WBS_ELEMENT:
                            promises.concat((0, exports.addDescriptionBulletsToWbsElement)(bullets.map(function (bullet) { return bullet.detail; }), destinationId, type, organizationId));
                            break;
                        case DescriptionBulletDestination.WORK_PACKAGE_TEMPLATE:
                            promises.concat((0, exports.addDescriptionBulletsToWorkPackageTemplate)(bullets.map(function (bullet) { return bullet.detail; }), destinationId, type, organizationId));
                            break;
                        case DescriptionBulletDestination.PROJECT_TEMPLATE:
                            promises.concat((0, exports.addDescriptionBulletsToProjectTemplate)(bullets.map(function (bullet) { return bullet.detail; }), destinationId, type, organizationId));
                            break;
                        case DescriptionBulletDestination.PROPOSED_CHANGES:
                            // TODO add proposed changes
                            break;
                    }
                }
                return [4 /*yield*/, Promise.all(promises)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.addRawDescriptionBullets = addRawDescriptionBullets;
// edit descrption bullets in the db for each id and detail pair
var editDescriptionBullets = function (editedIdsAndDetails, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var promises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (editedIdsAndDetails.length < 1)
                    return [2 /*return*/];
                promises = editedIdsAndDetails.map(function (element) { return __awaiter(void 0, void 0, void 0, function () {
                    var foundType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.description_Bullet_Type.findUnique({
                                    where: { uniqueDescriptionBulletType: { name: element.type, organizationId: organizationId } }
                                })];
                            case 1:
                                foundType = _a.sent();
                                if (!foundType)
                                    throw new errors_utils_1.NotFoundException('Description Bullet Type', element.type);
                                return [4 /*yield*/, prisma_1.default.description_Bullet.update({
                                        where: { descriptionId: element.id },
                                        data: { detail: element.detail, descriptionBulletTypeId: foundType.id }
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.resolve(promises)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.editDescriptionBullets = editDescriptionBullets;
var validateDescriptionBullets = function (descriptionBullets, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var promises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                promises = descriptionBullets.map(function (bullet) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, exports.validateDescriptionBulletType)(bullet.type, organizationId)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(promises)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.validateDescriptionBullets = validateDescriptionBullets;
var validateDescriptionBulletType = function (typeName, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var foundType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.description_Bullet_Type.findUnique({
                    where: { uniqueDescriptionBulletType: { name: typeName, organizationId: organizationId } }
                })];
            case 1:
                foundType = _a.sent();
                if (!foundType)
                    throw new errors_utils_1.NotFoundException('Description Bullet Type', typeName);
                return [2 /*return*/, foundType];
        }
    });
}); };
exports.validateDescriptionBulletType = validateDescriptionBulletType;
var markDescriptionBulletsAsDeleted = function (descriptionBullets) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.description_Bullet.updateMany({
                    where: {
                        descriptionId: {
                            in: descriptionBullets.map(function (bullet) { return bullet.id; })
                        }
                    },
                    data: {
                        dateDeleted: new Date()
                    }
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.markDescriptionBulletsAsDeleted = markDescriptionBulletsAsDeleted;

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
exports.getProjects = exports.checkMaterialInputs = exports.updateProjectAndCreateChanges = exports.getUserFullName = exports.getHighestProjectNumber = exports.calculateProjectStatus = void 0;
var prisma_1 = require("../prisma/prisma");
var shared_1 = require("shared");
var errors_utils_1 = require("./errors.utils");
var changes_utils_1 = require("./changes.utils");
var description_bullets_utils_1 = require("./description-bullets.utils");
var links_utils_1 = require("./links.utils");
var links_query_args_1 = require("../prisma-query-args/links.query-args");
var description_bullets_query_args_1 = require("../prisma-query-args/description-bullets.query-args");
var projects_query_args_1 = require("../prisma-query-args/projects.query-args");
/**
 * calculate the project's status based on its workpacakges' status
 * @param proj a given project to be calculated on its status
 * @returns the project's calculated wbs element status as either complete, active, or incomplete
 */
var calculateProjectStatus = function (proj) {
    if (proj.workPackages.length === 0)
        return shared_1.WbsElementStatus.Inactive;
    if (proj.workPackages.every(function (wp) { return wp.wbsElement.status === shared_1.WbsElementStatus.Complete; }))
        return shared_1.WbsElementStatus.Complete;
    else if (proj.workPackages.some(function (wp) { return wp.wbsElement.status === shared_1.WbsElementStatus.Active; }))
        return shared_1.WbsElementStatus.Active;
    return shared_1.WbsElementStatus.Inactive;
};
exports.calculateProjectStatus = calculateProjectStatus;
// gets highest current project number
var getHighestProjectNumber = function (carNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var maxProjectNumber;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma_1.default.wBS_Element.aggregate({
                    where: { carNumber: carNumber },
                    _max: { projectNumber: true }
                })];
            case 1:
                maxProjectNumber = _b.sent();
                return [2 /*return*/, (_a = maxProjectNumber._max.projectNumber) !== null && _a !== void 0 ? _a : 0];
        }
    });
}); };
exports.getHighestProjectNumber = getHighestProjectNumber;
// Given a user's id, this method returns the user's full name
var getUserFullName = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!userId)
                    return [2 /*return*/, null];
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId } })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                return [2 /*return*/, "".concat(user.firstName, " ").concat(user.lastName)];
        }
    });
}); };
exports.getUserFullName = getUserFullName;
// Update a project and create changes together
var updateProjectAndCreateChanges = function (projectId, crId, implementerId, name, budget, summary, newDescriptionBullets, newLinkCreateArgs, leadId, managerId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var changesJson, originalProject, wbsElementId, originalWorkPackages, nameChangeJson, budgetChangeJson, summaryChangeJson, managerChangeJson, _a, _b, leadChangeJson, _c, _d, descriptionBulletChanges, linkChanges, wpToUpdate, wpChanges, wpToUpdate, wpChanges, updatedProject, deletedDescriptionBullets;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                changesJson = [];
                return [4 /*yield*/, prisma_1.default.project.findUnique({
                        where: {
                            projectId: projectId
                        },
                        include: {
                            wbsElement: {
                                include: {
                                    links: __assign({ where: { dateDeleted: null } }, (0, links_query_args_1.getLinkQueryArgs)(organizationId)),
                                    descriptionBullets: __assign({ where: { dateDeleted: null } }, (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organizationId))
                                }
                            },
                            workPackages: {
                                where: { wbsElement: { dateDeleted: null } },
                                include: { wbsElement: true }
                            }
                        }
                    })];
            case 1:
                originalProject = _e.sent();
                // if it doesn't exist we error
                if (!originalProject)
                    throw new errors_utils_1.NotFoundException('Project', projectId);
                if (originalProject.wbsElement.dateDeleted)
                    throw new errors_utils_1.DeletedException('Project', projectId);
                if (originalProject.wbsElement.organizationId !== organizationId)
                    throw new errors_utils_1.InvalidOrganizationException('Project');
                wbsElementId = originalProject.wbsElementId, originalWorkPackages = originalProject.workPackages;
                nameChangeJson = (0, changes_utils_1.createChange)('name', originalProject.wbsElement.name, name, crId, implementerId, wbsElementId, null, null);
                budgetChangeJson = (0, changes_utils_1.createChange)('budget', originalProject.budget, budget, crId, implementerId, wbsElementId, null, null);
                summaryChangeJson = (0, changes_utils_1.createChange)('summary', originalProject.summary, summary, crId, implementerId, wbsElementId, null, null);
                _a = changes_utils_1.createChange;
                _b = ['manager'];
                return [4 /*yield*/, (0, exports.getUserFullName)(originalProject.wbsElement.managerId)];
            case 2:
                _b = _b.concat([_e.sent()]);
                return [4 /*yield*/, (0, exports.getUserFullName)(managerId)];
            case 3:
                managerChangeJson = _a.apply(void 0, _b.concat([_e.sent(), crId,
                    implementerId,
                    wbsElementId,
                    null,
                    null]));
                _c = changes_utils_1.createChange;
                _d = ['lead'];
                return [4 /*yield*/, (0, exports.getUserFullName)(originalProject.wbsElement.leadId)];
            case 4:
                _d = _d.concat([_e.sent()]);
                return [4 /*yield*/, (0, exports.getUserFullName)(leadId)];
            case 5:
                leadChangeJson = _c.apply(void 0, _d.concat([_e.sent(), crId,
                    implementerId,
                    wbsElementId,
                    null,
                    null]));
                // Dealing with lists
                if (nameChangeJson)
                    changesJson.push(nameChangeJson);
                if (budgetChangeJson)
                    changesJson.push(budgetChangeJson);
                if (summaryChangeJson)
                    changesJson.push(summaryChangeJson);
                if (managerChangeJson)
                    changesJson.push(managerChangeJson);
                if (leadChangeJson)
                    changesJson.push(leadChangeJson);
                return [4 /*yield*/, (0, changes_utils_1.getDescriptionBulletChanges)(originalProject.wbsElement.descriptionBullets, newDescriptionBullets, crId, wbsElementId, implementerId)];
            case 6:
                descriptionBulletChanges = _e.sent();
                linkChanges = (0, changes_utils_1.createListChanges)('link', originalProject.wbsElement.links.map(function (link) { return (0, links_utils_1.linkToChangeListValue)(__assign(__assign({}, link), { linkTypeName: link.linkType.name })); }), newLinkCreateArgs ? newLinkCreateArgs.map(links_utils_1.linkToChangeListValue) : [], crId, implementerId, wbsElementId);
                changesJson = changesJson.concat(descriptionBulletChanges.changes).concat(linkChanges.changes);
                if (!(!originalProject.wbsElement.managerId && managerId)) return [3 /*break*/, 9];
                wpToUpdate = originalWorkPackages.filter(function (wp) { return !wp.wbsElement.managerId; });
                return [4 /*yield*/, Promise.all(wpToUpdate.map(function (wp) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _a = changes_utils_1.createChange;
                                _b = ['manager', null];
                                return [4 /*yield*/, (0, exports.getUserFullName)(managerId)];
                            case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), crId, implementerId, wp.wbsElementId, null, null]))];
                        }
                    }); }); }))];
            case 7:
                wpChanges = (_e.sent()).filter(function (change) { return change !== undefined; });
                changesJson = changesJson.concat(wpChanges);
                return [4 /*yield*/, prisma_1.default.wBS_Element.updateMany({
                        where: { wbsElementId: { in: wpToUpdate.map(function (wp) { return wp.wbsElementId; }) } },
                        data: { managerId: managerId }
                    })];
            case 8:
                _e.sent();
                _e.label = 9;
            case 9:
                if (!(!originalProject.wbsElement.leadId && leadId)) return [3 /*break*/, 12];
                wpToUpdate = originalWorkPackages.filter(function (wp) { return !wp.wbsElement.leadId; });
                return [4 /*yield*/, Promise.all(wpToUpdate.map(function (wp) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _a = changes_utils_1.createChange;
                                _b = ['lead', null];
                                return [4 /*yield*/, (0, exports.getUserFullName)(leadId)];
                            case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), crId, implementerId, wp.wbsElementId, null, null]))];
                        }
                    }); }); }))];
            case 10:
                wpChanges = (_e.sent()).filter(function (change) { return change !== undefined; });
                changesJson = changesJson.concat(wpChanges);
                return [4 /*yield*/, prisma_1.default.wBS_Element.updateMany({
                        where: { wbsElementId: { in: wpToUpdate.map(function (wp) { return wp.wbsElementId; }) } },
                        data: { leadId: leadId }
                    })];
            case 11:
                _e.sent();
                _e.label = 12;
            case 12: return [4 /*yield*/, prisma_1.default.project.update(__assign({ where: {
                        wbsElementId: wbsElementId
                    }, data: {
                        budget: budget !== null && budget !== void 0 ? budget : undefined,
                        summary: summary,
                        wbsElement: {
                            update: {
                                name: name,
                                leadId: leadId,
                                managerId: managerId
                            }
                        }
                    } }, (0, projects_query_args_1.getProjectQueryArgs)(organizationId)))];
            case 13:
                updatedProject = _e.sent();
                deletedDescriptionBullets = descriptionBulletChanges.deleted;
                if (!(deletedDescriptionBullets.length > 0)) return [3 /*break*/, 15];
                return [4 /*yield*/, prisma_1.default.description_Bullet.updateMany({
                        where: {
                            descriptionId: {
                                in: deletedDescriptionBullets.map(function (descriptionBullet) { return descriptionBullet.id; })
                            }
                        },
                        data: {
                            dateDeleted: new Date()
                        }
                    })];
            case 14:
                _e.sent();
                _e.label = 15;
            case 15: 
            // Add the new description bullets
            return [4 /*yield*/, (0, description_bullets_utils_1.addRawDescriptionBullets)(descriptionBulletChanges.added, description_bullets_utils_1.DescriptionBulletDestination.WBS_ELEMENT, wbsElementId, organizationId)];
            case 16:
                // Add the new description bullets
                _e.sent();
                // Edit the existing description bullets
                return [4 /*yield*/, (0, description_bullets_utils_1.editDescriptionBullets)(descriptionBulletChanges.edited, organizationId)];
            case 17:
                // Edit the existing description bullets
                _e.sent();
                // Update links
                return [4 /*yield*/, (0, links_utils_1.updateLinks)(linkChanges, wbsElementId, implementerId, organizationId)];
            case 18:
                // Update links
                _e.sent();
                return [4 /*yield*/, prisma_1.default.change.createMany({
                        data: changesJson
                    })];
            case 19:
                _e.sent();
                return [2 /*return*/, { project: updatedProject, wbsElementId: wbsElementId }];
        }
    });
}); };
exports.updateProjectAndCreateChanges = updateProjectAndCreateChanges;
/**
 * Check if given assembly, material type, manufacturer, and unit exist in the app database
 * @param manufacturerName the manufacure of the material to check if it exists
 * @param materialTypeName the material type of the material to check if it exists
 * @param unitName the unit of the material to check if it exists
 * @param assemblyId the assembly of the material to check if it exists
 * @throws if any of these properties of the material does not exist in the db
 */
var checkMaterialInputs = function (manufacturerName, materialTypeName, unitName, assemblyId) { return __awaiter(void 0, void 0, void 0, function () {
    var assembly, materialType, manufacturer, unit;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!assemblyId) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma_1.default.assembly.findFirst({ where: { assemblyId: assemblyId } })];
            case 1:
                assembly = _a.sent();
                if (!assembly)
                    throw new errors_utils_1.NotFoundException('Assembly', assemblyId);
                _a.label = 2;
            case 2: return [4 /*yield*/, prisma_1.default.material_Type.findFirst({
                    where: { name: materialTypeName }
                })];
            case 3:
                materialType = _a.sent();
                if (!materialType)
                    throw new errors_utils_1.NotFoundException('Material Type', materialTypeName);
                return [4 /*yield*/, prisma_1.default.manufacturer.findFirst({
                        where: { name: manufacturerName }
                    })];
            case 4:
                manufacturer = _a.sent();
                if (!manufacturer)
                    throw new errors_utils_1.NotFoundException('Manufacturer', manufacturerName);
                if (!unitName) return [3 /*break*/, 6];
                return [4 /*yield*/, prisma_1.default.unit.findFirst({
                        where: { name: unitName }
                    })];
            case 5:
                unit = _a.sent();
                if (!unit)
                    throw new errors_utils_1.NotFoundException('Unit', unitName);
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.checkMaterialInputs = checkMaterialInputs;
/**
 * Produce a array of primsa formated projectIDs, given the array of Project
 * @param projectIds the projectIds to get as users
 * @returns projectIds in prisma format
 */
var getProjects = function (projectIds, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var projects;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: { projectId: { in: projectIds }, wbsElement: { organizationId: organizationId, dateDeleted: null } } }, (0, projects_query_args_1.getProjectQueryArgs)(organizationId)))];
            case 1:
                projects = _a.sent();
                validateFoundProjects(projects, projectIds);
                return [2 /*return*/, projects];
        }
    });
}); };
exports.getProjects = getProjects;
/**
 * Validates that the projects found in the database match the given projectIds
 * @param projects the projects found in the database
 * @param projectIds the requested projectIds to retrieve
 */
var validateFoundProjects = function (projects, projectIds) {
    if (projects.length !== projectIds.length) {
        var primsaProjectIds_1 = projects.map(function (project) { return project.projectId; });
        var missingProjectIds = projectIds.filter(function (id) { return !primsaProjectIds_1.includes(id); });
        throw new errors_utils_1.HttpException(404, "Projects(s) with the following ids not found: ".concat(missingProjectIds.join(', ')));
    }
};

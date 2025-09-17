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
var shared_1 = require("shared");
var prisma_1 = require("../prisma/prisma");
var projects_transformer_1 = require("../transformers/projects.transformer");
var change_requests_utils_1 = require("../utils/change-requests.utils");
var errors_utils_1 = require("../utils/errors.utils");
var projects_utils_1 = require("../utils/projects.utils");
var utils_1 = require("../utils/utils");
var work_packages_services_1 = require("./work-packages.services");
var links_transformer_1 = require("../transformers/links.transformer");
var users_utils_1 = require("../utils/users.utils");
var projects_query_args_1 = require("../prisma-query-args/projects.query-args");
var links_query_args_1 = require("../prisma-query-args/links.query-args");
var description_bullets_query_args_1 = require("../prisma-query-args/description-bullets.query-args");
var link_types_query_args_1 = require("../prisma-query-args/link-types.query-args");
var ProjectsService = /** @class */ (function () {
    function ProjectsService() {
    }
    /**
     * Get all the non deleted projects in the database for the given organization.
     * @param organizationId the id of the organization the user is currently in
     * @param includeDeleted whether or not to include deleted projects
     * @returns all the projects
     */
    ProjectsService.getAllProjects = function (organization, includeDeleted) {
        return __awaiter(this, void 0, void 0, function () {
            var projects, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!includeDeleted) return [3 /*break*/, 2];
                        return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: { wbsElement: { organizationId: organization.organizationId } } }, (0, projects_query_args_1.getProjectManyQueryArgs)(organization.organizationId)))];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: { wbsElement: { dateDeleted: null, organizationId: organization.organizationId } } }, (0, projects_query_args_1.getProjectManyQueryArgs)(organization.organizationId)))];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        projects = _a;
                        return [2 /*return*/, projects.map(projects_transformer_1.projectPreviewTransformer)];
                }
            });
        });
    };
    ProjectsService.getUsersLeadingProjects = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: {
                                wbsElement: {
                                    organizationId: organization.organizationId,
                                    dateDeleted: null,
                                    OR: [{ leadId: user.userId }, { managerId: user.userId }]
                                }
                            } }, (0, projects_query_args_1.getProjectManyQueryArgs)(organization.organizationId)))];
                    case 1:
                        projects = _a.sent();
                        return [2 /*return*/, projects.map(projects_transformer_1.projectPreviewTransformer)];
                }
            });
        });
    };
    ProjectsService.getUsersTeamsProjects = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: {
                                wbsElement: {
                                    organizationId: organization.organizationId,
                                    dateDeleted: null
                                },
                                teams: {
                                    some: {
                                        OR: [
                                            {
                                                headId: user.userId
                                            },
                                            {
                                                leads: {
                                                    some: {
                                                        userId: user.userId
                                                    }
                                                }
                                            },
                                            {
                                                members: {
                                                    some: {
                                                        userId: user.userId
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            } }, (0, projects_query_args_1.getProjectManyQueryArgs)(organization.organizationId)))];
                    case 1:
                        projects = _a.sent();
                        return [2 /*return*/, projects.map(projects_transformer_1.projectPreviewTransformer)];
                }
            });
        });
    };
    ProjectsService.getTeamsProjects = function (organization, teamId) {
        return __awaiter(this, void 0, void 0, function () {
            var projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: {
                                wbsElement: {
                                    organizationId: organization.organizationId,
                                    dateDeleted: null
                                },
                                teams: {
                                    some: {
                                        teamId: teamId
                                    }
                                }
                            } }, (0, projects_query_args_1.getProjectQueryArgs)(organization.organizationId)))];
                    case 1:
                        projects = _a.sent();
                        return [2 /*return*/, projects.map(projects_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Get a single project
     * @param wbsNumber the wbsNumber of the project to get
     * @param organizationId the id of the organization the user is currently in
     * @returns the request project
     * @throws if the wbsNumber is invalid, the project is not found, or the project is deleted
     */
    ProjectsService.getSingleProject = function (wbsNumber, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization)];
                    case 1:
                        project = _a.sent();
                        return [2 /*return*/, (0, projects_transformer_1.default)(project)];
                }
            });
        });
    };
    ProjectsService.getSingleProjectWithQueryArgs = function (wbsNumber, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var carNumber, projectNumber, workPackageNumber, wbsElement, project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, shared_1.isProjectWbs)(wbsNumber))
                            throw new errors_utils_1.HttpException(400, "".concat((0, shared_1.wbsPipe)(wbsNumber), " is not a valid project WBS #!"));
                        carNumber = wbsNumber.carNumber, projectNumber = wbsNumber.projectNumber, workPackageNumber = wbsNumber.workPackageNumber;
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
                                    project: __assign({}, (0, projects_query_args_1.getProjectQueryArgs)(organization.organizationId))
                                }
                            })];
                    case 1:
                        wbsElement = _a.sent();
                        project = wbsElement === null || wbsElement === void 0 ? void 0 : wbsElement.project;
                        if (!project)
                            throw new errors_utils_1.NotFoundException('Project', (0, shared_1.wbsPipe)(wbsNumber));
                        if (project.wbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Project', project.projectId);
                        if (project.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Project');
                        return [2 /*return*/, project];
                }
            });
        });
    };
    /**
     * Create a new project with the given information.
     * @param user the user creating the project
     * @param crId the change request id being used to create the project
     * @param carNumber the car number of the new project
     * @param name the name of the new project
     * @param summary the summary of the new project
     * @param teamIds the ids of the teams that the new project will be assigned to
     * @param budget the new budget of the project
     * @param linkCreateArgs the link create args
     * @param summary the new summary of the project
     * @param descriptionBullets the new description bullets of the project
     * @param leadId the new lead of the project
     * @param managerId the new manager of the project
     * @param organizationId the id of the organization the user is currently in
     * @returns the wbs number of the created project
     * @throws if the user doesn't have permission or if the change request is invalid
     */
    ProjectsService.createProject = function (user, crId, carNumber, name, summary, teamIds, budget, linkCreateArgs, descriptionBullets, leadId, managerId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, _i, teamIds_1, teamId, team, carWbs, maxProjectNumber, changes, createdWbsElement, wbsElementId, createdProject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = user.userId;
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        if (_a.sent())
                            throw new errors_utils_1.AccessDeniedGuestException('create projects');
                        if (!crId) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, change_requests_utils_1.validateChangeRequestAccepted)(crId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(teamIds.length > 0)) return [3 /*break*/, 7];
                        _i = 0, teamIds_1 = teamIds;
                        _a.label = 4;
                    case 4:
                        if (!(_i < teamIds_1.length)) return [3 /*break*/, 7];
                        teamId = teamIds_1[_i];
                        return [4 /*yield*/, prisma_1.default.team.findUnique({ where: { teamId: teamId } })];
                    case 5:
                        team = _a.sent();
                        if (!team)
                            throw new errors_utils_1.NotFoundException('Team', teamId);
                        if (team.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team');
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                            where: {
                                wbsNumber: { carNumber: carNumber, projectNumber: 0, workPackageNumber: 0, organizationId: organization.organizationId }
                            },
                            include: { car: true }
                        })];
                    case 8:
                        carWbs = _a.sent();
                        if (!(carWbs === null || carWbs === void 0 ? void 0 : carWbs.car))
                            throw new errors_utils_1.NotFoundException('Car', carNumber);
                        return [4 /*yield*/, (0, projects_utils_1.getHighestProjectNumber)(carNumber)];
                    case 9:
                        maxProjectNumber = _a.sent();
                        changes = crId
                            ? [
                                {
                                    changeRequestId: crId,
                                    implementerId: user.userId,
                                    detail: 'New Project Created'
                                }
                            ]
                            : [];
                        return [4 /*yield*/, prisma_1.default.wBS_Element.create({
                                data: {
                                    carNumber: carNumber,
                                    projectNumber: maxProjectNumber + 1,
                                    workPackageNumber: 0,
                                    name: name,
                                    project: {
                                        create: {
                                            summary: summary,
                                            teams: {
                                                connect: teamIds.map(function (teamId) { return ({ teamId: teamId }); })
                                            },
                                            carId: carWbs.car.carId
                                        }
                                    },
                                    changes: { createMany: { data: changes } },
                                    organizationId: carWbs.organizationId
                                },
                                include: {
                                    project: __assign({}, (0, projects_query_args_1.getProjectQueryArgs)(organization.organizationId)),
                                    changes: true
                                }
                            })];
                    case 10:
                        createdWbsElement = _a.sent();
                        wbsElementId = createdWbsElement.wbsElementId, createdProject = createdWbsElement.project;
                        if (!createdProject) {
                            throw new errors_utils_1.NotFoundException('Project', wbsElementId);
                        }
                        // Project has been created, so create the changes and add other details (like budget, project manager id, etc)
                        return [4 /*yield*/, (0, projects_utils_1.updateProjectAndCreateChanges)(createdProject.projectId, crId, userId, name, budget, summary, descriptionBullets, linkCreateArgs, leadId, managerId, organization.organizationId)];
                    case 11:
                        // Project has been created, so create the changes and add other details (like budget, project manager id, etc)
                        _a.sent();
                        return [2 /*return*/, (0, projects_transformer_1.default)(createdProject)];
                }
            });
        });
    };
    /**
     * Edits the given project with the given information.
     * @param user the user editing the project
     * @param projectId the id of the project to edit
     * @param crId the change request used to do the editing
     * @param name the new name of the project
     * @param budget the new budget of the project
     * @param summary the new summary of the project
     * @param newDescriptionBullets the new description bullets of the project
     * @param linkCreateArgs the new links of the project
     * @param leadId the new lead of the project
     * @param managerId the new manager of the project
     * @param organizationId the id of the organization the user is currently in
     * @returns the edited project
     */
    ProjectsService.editProject = function (user, projectId, crId, name, budget, summary, newDescriptionBullets, linkCreateArgs, leadId, managerId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, originalProject, updatedProject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = user.userId;
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(userId, organization.organizationId, shared_1.isGuest)];
                    case 1:
                        if (_a.sent())
                            throw new errors_utils_1.AccessDeniedGuestException('edit projects');
                        return [4 /*yield*/, (0, change_requests_utils_1.validateChangeRequestAccepted)(crId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.project.findUnique({
                                where: {
                                    projectId: projectId
                                },
                                include: {
                                    wbsElement: {
                                        include: {
                                            links: (0, links_query_args_1.getLinkQueryArgs)(organization.organizationId),
                                            descriptionBullets: (0, description_bullets_query_args_1.getDescriptionBulletQueryArgs)(organization.organizationId)
                                        }
                                    }
                                }
                            })];
                    case 3:
                        originalProject = _a.sent();
                        // if it doesn't exist we error
                        if (!originalProject)
                            throw new errors_utils_1.NotFoundException('Project', projectId);
                        if (originalProject.wbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Project', projectId);
                        if (originalProject.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Project');
                        return [4 /*yield*/, (0, projects_utils_1.updateProjectAndCreateChanges)(originalProject.projectId, crId, userId, name, budget, summary, newDescriptionBullets, linkCreateArgs, leadId, managerId, organization.organizationId)];
                    case 4:
                        updatedProject = (_a.sent()).project;
                        // return the updated work package
                        return [2 /*return*/, (0, projects_transformer_1.default)(updatedProject)];
                }
            });
        });
    };
    /**
     * Adds or removes the given team to the projects teams depending if it is already assigned to the project or not.
     *
     * @param user the user doing the setting
     * @param wbsNumber the wbsNumber of the project
     * @param teamId the teamId to assign the project to
     * @param organizationId the id of the organization the user is currently in
     * @throws if the project isn't found, the team isn't found, or the user doesn't have access
     */
    ProjectsService.setProjectTeam = function (user, wbsNumber, teamId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var project, team;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, shared_1.isProjectWbs)(wbsNumber))
                            throw new errors_utils_1.HttpException(400, "".concat((0, shared_1.wbsPipe)(wbsNumber), " is not a valid project WBS #!"));
                        return [4 /*yield*/, ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization)];
                    case 1:
                        project = _a.sent();
                        return [4 /*yield*/, prisma_1.default.team.findUnique({ where: { teamId: teamId } })];
                    case 2:
                        team = _a.sent();
                        if (!team)
                            throw new errors_utils_1.NotFoundException('Team', teamId);
                        if (team.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 3:
                        // check for user and user permission (admin, app admin, or leader of the team)
                        if (!(_a.sent()) && user.userId !== team.headId) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('set project teams');
                        }
                        if (!project.teams.some(function (currTeam) { return currTeam.teamId === teamId; })) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma_1.default.project.update({
                                where: { projectId: project.projectId },
                                data: {
                                    teams: {
                                        disconnect: {
                                            teamId: teamId
                                        }
                                    }
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, prisma_1.default.project.update({
                            where: { projectId: project.projectId },
                            data: {
                                teams: {
                                    connect: {
                                        teamId: teamId
                                    }
                                }
                            }
                        })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete the the project in the database along with all its dependencies.
     * @param user the user who is trying to delete the project
     * @param wbsNumber the wbsNumber of the project
     * @param organizationId the id of the organization the user is currently in
     * @throws if the wbs number does not correspond to a project, the user trying to
     * delete the project is not admin/app-admin, or the project is not found.
     * @returns the project that is deleted.
     */
    ProjectsService.deleteProject = function (user, wbsNumber, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var project, projectId, wbsElementId, dateDeleted, deletedByUserId, deletedProject, workPackages;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('delete projects');
                        }
                        return [4 /*yield*/, ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization)];
                    case 2:
                        project = _a.sent();
                        projectId = project.projectId, wbsElementId = project.wbsElementId;
                        dateDeleted = new Date();
                        deletedByUserId = user.userId;
                        return [4 /*yield*/, prisma_1.default.project.update(__assign({ where: {
                                    projectId: projectId
                                }, data: {
                                    wbsElement: {
                                        update: {
                                            dateDeleted: dateDeleted,
                                            deletedByUserId: deletedByUserId,
                                            changeRequests: {
                                                updateMany: {
                                                    where: { wbsElementId: wbsElementId },
                                                    data: { dateDeleted: dateDeleted, deletedByUserId: deletedByUserId }
                                                }
                                            },
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
                                } }, (0, projects_query_args_1.getProjectQueryArgs)(organization.organizationId)))];
                    case 3:
                        deletedProject = _a.sent();
                        return [4 /*yield*/, prisma_1.default.work_Package.findMany({
                                where: {
                                    projectId: projectId
                                },
                                include: { wbsElement: true }
                            })];
                    case 4:
                        workPackages = _a.sent();
                        return [4 /*yield*/, Promise.all(workPackages.map(function (workPackage) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, work_packages_services_1.default.deleteWorkPackage(user, (0, utils_1.wbsNumOf)(workPackage.wbsElement), organization)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, (0, projects_transformer_1.default)(deletedProject)];
                }
            });
        });
    };
    /**
     * Toggles a user's favorite status on a projects
     * @param wbsNumber the project wbs number to be favorited/unfavorited
     * @param user the user who is favoriting/unfavoriting the project
     * @param organizationId the id of the organization the user is currently in
     * @returns the project that the user has favorited/unfavorited
     * @throws if the project wbs doesn't exist or is not corresponding to a project
     */
    ProjectsService.toggleFavorite = function (wbsNumber, user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var project, favorited, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ProjectsService.getSingleProjectWithQueryArgs(wbsNumber, organization)];
                    case 1:
                        project = _b.sent();
                        favorited = project.favoritedBy.some(function (currUser) { return currUser.userId === user.userId; });
                        if (!favorited) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma_1.default.user.update({
                                where: { userId: user.userId },
                                data: {
                                    favoriteProjects: {
                                        disconnect: {
                                            projectId: project.projectId
                                        }
                                    }
                                }
                            })];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, prisma_1.default.user.update({
                            where: { userId: user.userId },
                            data: {
                                favoriteProjects: {
                                    connect: {
                                        projectId: project.projectId
                                    }
                                }
                            }
                        })];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        _a;
                        return [2 /*return*/, (0, projects_transformer_1.default)(project)];
                }
            });
        });
    };
    /**
     * Gets all the link types in the users organization
     * @param organizationId The organization the user is currently in
     * @returns all the link types in the users organization
     */
    ProjectsService.getAllLinkTypes = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.link_Type.findMany(__assign({ where: {
                                organizationId: organization.organizationId
                            } }, (0, link_types_query_args_1.getLinkTypeQueryArgs)(organization.organizationId)))];
                    case 1: return [2 /*return*/, (_a.sent()).map(links_transformer_1.linkTypeTransformer)];
                }
            });
        });
    };
    /**
     * Creates a new LinkType with the given information
     *
     * @param name the name of the new LinkType
     * @param iconName the name of the icon for the new LinkType
     * @param required is the new LinkType required
     * @param user the user who is creating the new LinkType
     * @param orgainzationId the organization the link type is being created for
     * @throws AccessDeniedException if the submitter of the request is not an admin
     * @throws HttpException if a LinkType of the given name already exists
     * @returns the created LinkType
     */
    ProjectsService.createLinkType = function (user, name, iconName, required, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var existingLinkType, linkType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('Only admins can create link types');
                        return [4 /*yield*/, prisma_1.default.link_Type.findUnique({
                                where: { uniqueLinkType: { name: name, organizationId: organization.organizationId } }
                            })];
                    case 2:
                        existingLinkType = _a.sent();
                        if (existingLinkType)
                            throw new errors_utils_1.HttpException(400, 'LinkType with that name already exists in this organization.');
                        return [4 /*yield*/, prisma_1.default.link_Type.create(__assign({ data: {
                                    name: name,
                                    creatorId: user.userId,
                                    iconName: iconName,
                                    required: required,
                                    organizationId: organization.organizationId
                                } }, (0, link_types_query_args_1.getLinkTypeQueryArgs)(organization.organizationId)))];
                    case 3:
                        linkType = _a.sent();
                        return [2 /*return*/, (0, links_transformer_1.linkTypeTransformer)(linkType)];
                }
            });
        });
    };
    /**
     * Updates the linkType's name, iconName, or required.
     * @param linkName the name of the linkType being editted
     * @param iconName the new iconName
     * @param required the new required status
     * @param submitter user requesting the edit
     * @param organizationId the organization the user is currently in
     * @returns the updated linkType
     */
    ProjectsService.editLinkType = function (linkName, iconName, required, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var linkType, linkTypeUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('Only an admin can update the linkType');
                        return [4 /*yield*/, prisma_1.default.link_Type.findUnique({
                                where: {
                                    uniqueLinkType: {
                                        name: linkName,
                                        organizationId: organization.organizationId
                                    }
                                }
                            })];
                    case 2:
                        linkType = _a.sent();
                        if (!linkType)
                            throw new errors_utils_1.NotFoundException('Link Type', linkName);
                        return [4 /*yield*/, prisma_1.default.link_Type.update(__assign({ where: { id: linkType.id }, data: {
                                    name: linkName,
                                    iconName: iconName,
                                    required: required
                                } }, (0, link_types_query_args_1.getLinkTypeQueryArgs)(organization.organizationId)))];
                    case 3:
                        linkTypeUpdated = _a.sent();
                        return [2 /*return*/, (0, links_transformer_1.linkTypeTransformer)(linkTypeUpdated)];
                }
            });
        });
    };
    /**
     * Sets an abbreviation for this project
     * @param wbsNum the project
     * @param user the user making the change
     * @param organization the organization
     * @param abbreviation the new abbreviation
     * @returns the updated project
     */
    ProjectsService.setAbbreviation = function (wbsNum, user, organization, abbreviation) {
        return __awaiter(this, void 0, void 0, function () {
            var project, updatedProject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ProjectsService.getSingleProjectWithQueryArgs(wbsNum, organization)];
                    case 1:
                        project = _a.sent();
                        if (!project)
                            throw new errors_utils_1.NotFoundException('Project', (0, shared_1.wbsPipe)(wbsNum));
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('set abbreviation');
                        }
                        return [4 /*yield*/, prisma_1.default.project.update(__assign({ where: { projectId: project.projectId }, data: {
                                    abbreviation: abbreviation
                                } }, (0, projects_query_args_1.getProjectQueryArgs)(organization.organizationId)))];
                    case 3:
                        updatedProject = _a.sent();
                        return [2 /*return*/, (0, projects_transformer_1.default)(updatedProject)];
                }
            });
        });
    };
    /**
     * Removes the abbreviation from a given project
     * @param wbsNum the project
     * @param user the user making the change
     * @param organization the organization
     * @returns the updated project
     */
    ProjectsService.deleteAbbreviation = function (wbsNum, user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ProjectsService.getSingleProjectWithQueryArgs(wbsNum, organization)];
                    case 1:
                        project = _a.sent();
                        if (!project)
                            throw new errors_utils_1.NotFoundException('Project', (0, shared_1.wbsPipe)(wbsNum));
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('delete abbreviation');
                        }
                        return [4 /*yield*/, prisma_1.default.project.update({
                                where: { projectId: project.projectId },
                                data: {
                                    abbreviation: null
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProjectsService;
}());
exports.default = ProjectsService;

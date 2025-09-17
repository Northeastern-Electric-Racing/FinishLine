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
var tasks_transformer_1 = require("../transformers/tasks.transformer");
var errors_utils_1 = require("../utils/errors.utils");
var tasks_utils_1 = require("../utils/tasks.utils");
var users_utils_1 = require("../utils/users.utils");
var utils_1 = require("../utils/utils");
var teams_query_args_1 = require("../prisma-query-args/teams.query-args");
var tasks_query_args_1 = require("../prisma-query-args/tasks.query-args");
var projects_query_args_1 = require("../prisma-query-args/projects.query-args");
var TasksService = /** @class */ (function () {
    function TasksService() {
    }
    /**
     * Creates a Task in the database
     * @param createdBy the user creating the task
     * @param wbsNum the WBS Number to create the task for
     * @param title the title of the tas
     * @param notes the notes of the task
     * @param priority the priority of the task
     * @param status the status of the task
     * @param assignees the assignees ids of the task
     * @param organizationId the organization that the user is currently in
     * @param deadline the deadline of the task
     * @returns the id of the successfully created task
     * @throws if the user does not have access to create a task, wbs element does not exist, or wbs element is deleted
     */
    TasksService.createTask = function (createdBy, wbsNum, title, notes, priority, status, assignees, organization, deadline) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedWbsElement, project, teams, users, createdTask, newTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                            where: {
                                wbsNumber: __assign(__assign({}, wbsNum), { organizationId: organization.organizationId })
                            },
                            include: {
                                project: {
                                    include: {
                                        teams: (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId),
                                        wbsElement: true,
                                        workPackages: { include: { wbsElement: true } }
                                    }
                                }
                            }
                        })];
                    case 1:
                        requestedWbsElement = _a.sent();
                        if (!requestedWbsElement)
                            throw new errors_utils_1.NotFoundException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                        if (requestedWbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                        project = requestedWbsElement.project;
                        if (!project)
                            throw new errors_utils_1.HttpException(400, "This task's wbs element is not linked to a project!");
                        teams = project.teams;
                        if (!teams || teams.length === 0)
                            throw new errors_utils_1.HttpException(400, 'This project needs to be assigned to a team to create a task!');
                        return [4 /*yield*/, !(0, users_utils_1.userHasPermission)(createdBy.userId, organization.organizationId, shared_1.notGuest)];
                    case 2:
                        if (_a.sent()) {
                            throw new errors_utils_1.AccessDeniedException('Guests cannot create tasks');
                        }
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(assignees)];
                    case 3:
                        users = _a.sent();
                        if (!(0, shared_1.isUnderWordCount)(title, 15))
                            throw new errors_utils_1.HttpException(400, 'Title must be less than 15 words');
                        if (!(0, shared_1.isUnderWordCount)(notes, 250))
                            throw new errors_utils_1.HttpException(400, 'Notes must be less than 250 words');
                        if (status === 'IN_PROGRESS' && (!deadline || assignees.length === 0)) {
                            throw new errors_utils_1.HttpException(400, 'Tasks in progress must have a dealine and assignees');
                        }
                        return [4 /*yield*/, prisma_1.default.task.create(__assign({ data: {
                                    wbsElement: {
                                        connect: {
                                            wbsNumber: __assign(__assign({}, wbsNum), { organizationId: organization.organizationId })
                                        }
                                    },
                                    title: title,
                                    notes: notes,
                                    deadline: deadline,
                                    priority: priority,
                                    status: status,
                                    createdBy: { connect: { userId: createdBy.userId } },
                                    assignees: { connect: users.map(function (user) { return ({ userId: user.userId }); }) }
                                } }, (0, tasks_query_args_1.getTaskQueryArgs)(organization.organizationId)))];
                    case 4:
                        createdTask = _a.sent();
                        newTask = (0, tasks_transformer_1.default)(createdTask);
                        return [4 /*yield*/, (0, tasks_utils_1.sendSlackTaskAssignedNotificationToUsers)(newTask, assignees, organization.organizationId)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, newTask];
                }
            });
        });
    };
    /**
     * Edits a Task in the database
     * @param user the user editing the task
     * @param organizationId the organization id
     * @param taskId the task that is being edited
     * @param title the new title for the task
     * @param notes the new notes for the task
     * @param priority the new priority for the task
     * @param deadline the new deadline for the task
     * @returns the sucessfully edited task
     */
    TasksService.editTask = function (user, organizationId, taskId, title, notes, priority, deadline) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, originalTask, updatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organizationId, shared_1.notGuest)];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission)
                            throw new errors_utils_1.AccessDeniedException('Guests cannot edit tasks');
                        return [4 /*yield*/, prisma_1.default.task.findUnique({ where: { taskId: taskId }, include: { wbsElement: true } })];
                    case 2:
                        originalTask = _a.sent();
                        if (!originalTask)
                            throw new errors_utils_1.NotFoundException('Task', taskId);
                        if (originalTask.wbsElement.organizationId !== organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Task');
                        if (originalTask.dateDeleted)
                            throw new errors_utils_1.DeletedException('Task', taskId);
                        if (!(0, shared_1.isUnderWordCount)(title, 15))
                            throw new errors_utils_1.HttpException(400, 'Title must be less than 15 words');
                        if (!(0, shared_1.isUnderWordCount)(notes, 250))
                            throw new errors_utils_1.HttpException(400, 'Notes must be less than 250 words');
                        return [4 /*yield*/, prisma_1.default.task.update(__assign({ where: { taskId: taskId }, data: { title: title, notes: notes, priority: priority, deadline: deadline } }, (0, tasks_query_args_1.getTaskQueryArgs)(originalTask.wbsElement.organizationId)))];
                    case 3:
                        updatedTask = _a.sent();
                        return [2 /*return*/, (0, tasks_transformer_1.default)(updatedTask)];
                }
            });
        });
    };
    /**
     * Edits the status of a task in the database
     * @param user the user editing the task
     * @param organizationId the organizqtion Id
     * @param taskId the id of the task
     * @param status the new status
     * @returns the updated task
     * @throws if the task does not exist, the task is already deleted, or if the user does not have permissions
     */
    TasksService.editTaskStatus = function (user, organizationId, taskId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var originalTask, hasPermission, updatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.task.findUnique({ where: { taskId: taskId }, include: { assignees: true, wbsElement: true } })];
                    case 1:
                        originalTask = _a.sent();
                        if (!originalTask)
                            throw new errors_utils_1.NotFoundException('Task', taskId);
                        if (organizationId !== originalTask.wbsElement.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Task');
                        if (originalTask.dateDeleted)
                            throw new errors_utils_1.DeletedException('Task', taskId);
                        if (status === 'IN_PROGRESS' && (!originalTask.deadline || originalTask.assignees.length === 0)) {
                            throw new errors_utils_1.HttpException(400, 'A task in progress must have a deadline and assignees!');
                        }
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organizationId, shared_1.notGuest)];
                    case 2:
                        hasPermission = _a.sent();
                        if (!hasPermission)
                            throw new errors_utils_1.AccessDeniedException('Guests cannot edit tasks');
                        return [4 /*yield*/, prisma_1.default.task.update(__assign({ where: { taskId: taskId }, data: { status: status } }, (0, tasks_query_args_1.getTaskQueryArgs)(originalTask.wbsElement.organizationId)))];
                    case 3:
                        updatedTask = _a.sent();
                        return [2 /*return*/, (0, tasks_transformer_1.default)(updatedTask)];
                }
            });
        });
    };
    /**
     * Edits the assignees of a task in the database
     * @param user the user editing the task
     * @param taskId the id of the task
     * @param assignees the new assignees
     * @param organization the organization that the user is currently in
     * @returns the updated task
     * @throws if the task does not exist, the task is already deleted, any of the assignees don't exist, or if the user does not have permissions
     */
    TasksService.editTaskAssignees = function (user, taskId, assignees, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var originalTask, originalAssigneeIds, newAssigneeIds, hasPermission, assigneeUsers, transformedAssigneeUsers, updatedTask, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.task.findUnique({
                            where: { taskId: taskId },
                            include: {
                                wbsElement: { include: { project: (0, projects_query_args_1.getProjectQueryArgs)(organization.organizationId) } },
                                assignees: true
                            }
                        })];
                    case 1:
                        originalTask = _b.sent();
                        if (!originalTask)
                            throw new errors_utils_1.NotFoundException('Task', taskId);
                        if (originalTask.dateDeleted)
                            throw new errors_utils_1.DeletedException('Task', taskId);
                        originalAssigneeIds = originalTask.assignees.map(function (assignee) { return assignee.userId; });
                        newAssigneeIds = assignees.filter(function (userId) { return !originalAssigneeIds.includes(userId); });
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.notGuest)];
                    case 2:
                        hasPermission = _b.sent();
                        if (!hasPermission)
                            throw new errors_utils_1.AccessDeniedException('Guests cannot edit tasks');
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(assignees)];
                    case 3:
                        assigneeUsers = _b.sent();
                        transformedAssigneeUsers = assigneeUsers.map(function (user) {
                            return {
                                userId: user.userId
                            };
                        });
                        _a = tasks_transformer_1.default;
                        return [4 /*yield*/, prisma_1.default.task.update(__assign({ where: { taskId: taskId }, data: {
                                    assignees: {
                                        set: transformedAssigneeUsers
                                    }
                                } }, (0, tasks_query_args_1.getTaskQueryArgs)(organization.organizationId)))];
                    case 4:
                        updatedTask = _a.apply(void 0, [_b.sent()]);
                        return [4 /*yield*/, (0, tasks_utils_1.sendSlackTaskAssignedNotificationToUsers)(updatedTask, newAssigneeIds, organization.organizationId)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, updatedTask];
                }
            });
        });
    };
    /**
     * Delete task in the database
     * @param taskId the id number of the given task
     * @param currentUser the current user currently accessing the task
     * @param organizationId the organization that the user is currently in
     * @returns the deleted task
     * @throws if the user does not have permission
     */
    TasksService.deleteTask = function (currentUser, taskId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var task, wbsElement, wbsNum, isLead, deletedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.task.findUnique(__assign({ where: { taskId: taskId } }, (0, tasks_query_args_1.getTaskQueryArgs)(organization.organizationId)))];
                    case 1:
                        task = _a.sent();
                        if (!task)
                            throw new errors_utils_1.NotFoundException('Task', taskId);
                        if (task.dateDeleted)
                            throw new errors_utils_1.DeletedException('Task', taskId);
                        return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({ where: { wbsElementId: task.wbsElementId } })];
                    case 2:
                        wbsElement = _a.sent();
                        if (!wbsElement)
                            throw new errors_utils_1.NotFoundException('WBS Element', task.wbsElementId);
                        if (wbsElement.dateDeleted) {
                            wbsNum = (0, utils_1.wbsNumOf)(wbsElement);
                            throw new errors_utils_1.DeletedException('WBS Element', (0, shared_1.wbsPipe)(wbsNum));
                        }
                        isLead = wbsElement.leadId === currentUser.userId || wbsElement.managerId === currentUser.userId;
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(currentUser.userId, organization.organizationId, shared_1.isAdmin)];
                    case 3:
                        if (!(_a.sent()) && !isLead) {
                            throw new errors_utils_1.AccessDeniedException('Only admin, app-admins, project leads, and project managers can delete tasks');
                        }
                        return [4 /*yield*/, prisma_1.default.task.update({
                                where: { taskId: taskId },
                                data: { dateDeleted: new Date(), deletedByUserId: currentUser.userId }
                            })];
                    case 4:
                        deletedTask = _a.sent();
                        return [2 /*return*/, deletedTask.taskId];
                }
            });
        });
    };
    return TasksService;
}());
exports.default = TasksService;

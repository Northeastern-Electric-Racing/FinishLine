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
var client_1 = require("@prisma/client");
var prisma_1 = require("../prisma/prisma");
var teams_transformer_1 = require("../transformers/teams.transformer");
var errors_utils_1 = require("../utils/errors.utils");
var users_utils_1 = require("../utils/users.utils");
var shared_2 = require("shared");
var teams_utils_1 = require("../utils/teams.utils");
var teams_query_args_1 = require("../prisma-query-args/teams.query-args");
var google_integration_utils_1 = require("../utils/google-integration.utils");
var team_types_transformer_1 = require("../transformers/team-types.transformer");
var work_packages_query_args_1 = require("../prisma-query-args/work-packages.query-args");
var work_packages_transformer_1 = require("../transformers/work-packages.transformer");
var TeamsService = /** @class */ (function () {
    function TeamsService() {
    }
    /**
     * Gets all teams (archived teams are not included)
     * @param organizationId The organization the user is currently in
     * @returns a list of teams
     */
    TeamsService.getAllTeams = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findMany(__assign({ where: { dateArchived: null, organizationId: organization.organizationId } }, (0, teams_query_args_1.getTeamPreviewQueryArgs)(organization.organizationId)))];
                    case 1:
                        teams = _a.sent();
                        return [2 /*return*/, teams.map(teams_transformer_1.teamPreviewTransformer)];
                }
            });
        });
    };
    /**
     * Gets all archived teams
     * @param organizationId The organization the user is currently in
     * @returns a list of teams
     */
    TeamsService.getAllArchivedTeams = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findMany(__assign({ where: { dateArchived: { not: null }, organizationId: organization.organizationId } }, (0, teams_query_args_1.getTeamPreviewQueryArgs)(organization.organizationId)))];
                    case 1:
                        teams = _a.sent();
                        return [2 /*return*/, teams.map(teams_transformer_1.teamPreviewTransformer)];
                }
            });
        });
    };
    /**
     * Gets a team with the given id
     * @param teamId - id of team to retrieve
     * @param organizationId The organization the user is currently in
     * @returns a team
     * @throws if the team is not found in the db
     */
    TeamsService.getSingleTeam = function (teamId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findUnique(__assign({ where: { teamId: teamId } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 1:
                        team = _a.sent();
                        if (!team) {
                            throw new errors_utils_1.NotFoundException('Team', teamId);
                        }
                        if (team.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team');
                        return [2 /*return*/, (0, teams_transformer_1.default)(team)];
                }
            });
        });
    };
    TeamsService.getUsersTeams = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findMany(__assign({ where: {
                                organizationId: organization.organizationId,
                                dateArchived: null,
                                OR: [
                                    { headId: user.userId },
                                    { leads: { some: { userId: user.userId } } },
                                    { members: { some: { userId: user.userId } } }
                                ]
                            } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 1:
                        teams = _a.sent();
                        return [2 /*return*/, teams.map(teams_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Update the given teamId's team's members
     * @param submitter a user who's making this request
     * @param teamId a id of team to be updated
     * @param userIds a array of user Ids that replaces team's old members
     * @param organizationId The organization the user is currently in
     * @returns a updated team
     * @throws if the team is not found, the submitter has no priviledge, the team is archived, or any user from the given userIds does not exist
     */
    TeamsService.setTeamMembers = function (submitter, teamId, userIds, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team, isTeamLead, users, newTeamLeads, updateTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeamsService.getSingleTeam(teamId, organization)];
                    case 1:
                        team = _a.sent();
                        if (team.dateArchived)
                            throw new errors_utils_1.HttpException(400, 'Cannot edit the members of an archived team');
                        isTeamLead = team.leads.some(function (lead) { return lead.userId === submitter.userId; });
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!(_a.sent()) &&
                            submitter.userId !== team.head.userId &&
                            !isTeamLead)
                            throw new errors_utils_1.AccessDeniedException('you must be an admin, the team head, or a team lead to update the members!');
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(userIds)];
                    case 3:
                        users = _a.sent();
                        if (users.map(function (user) { return user.userId; }).includes(team.head.userId))
                            throw new errors_utils_1.HttpException(400, 'team head cannot be a member!');
                        newTeamLeads = (0, teams_utils_1.removeUsersFromList)(team.leads, users);
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: {
                                    teamId: teamId
                                }, data: {
                                    members: {
                                        set: (0, users_utils_1.getPrismaQueryUserIds)(users)
                                    },
                                    leads: {
                                        set: (0, users_utils_1.getPrismaQueryUserIds)(newTeamLeads)
                                    }
                                } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 4:
                        updateTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(updateTeam)];
                }
            });
        });
    };
    /**
     * Changes the description of the given team to be the new description
     * @param user The user who is editing the description
     * @param teamId The id for the team that is being edited
     * @param newDescription the new description for the team
     * @param organizationId The organization the user is currently in
     * @returns The team with the new description
     */
    TeamsService.editDescription = function (user, teamId, newDescription, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team, updateTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, shared_2.isUnderWordCount)(newDescription, 300))
                            throw new errors_utils_1.HttpException(400, 'Description must be less than 300 words');
                        return [4 /*yield*/, TeamsService.getSingleTeam(teamId, organization)];
                    case 1:
                        team = _a.sent();
                        if (team.dateArchived)
                            throw new errors_utils_1.HttpException(400, 'Cannot edit the description of an archived team');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!((_a.sent()) || user.userId === team.head.userId))
                            throw new errors_utils_1.AccessDeniedException('you must be an admin or the team head to update the members!');
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: { teamId: teamId }, data: {
                                    description: newDescription
                                } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 3:
                        updateTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(updateTeam)];
                }
            });
        });
    };
    /**
     * Updates the slack id of a given team
     * @param updater the user updating
     * @param organization the organizaiton
     * @param teamId the id of the team
     * @param slackId the new slack id
     * @returns a preview of the updated team
     */
    TeamsService.editSlackId = function (updater, organization, teamId, slackId) {
        return __awaiter(this, void 0, void 0, function () {
            var team, updatedTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeamsService.getSingleTeam(teamId, organization)];
                    case 1:
                        team = _a.sent();
                        if (team.dateArchived)
                            throw new errors_utils_1.HttpException(400, 'Cannot edit the slack id of an archived team');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(updater.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!((_a.sent()) ||
                            updater.userId === team.head.userId))
                            throw new errors_utils_1.AccessDeniedException('you must be an admin or the team head to update the slack id!');
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: { teamId: teamId }, data: {
                                    slackId: slackId
                                } }, (0, teams_query_args_1.getTeamPreviewQueryArgs)(organization.organizationId)))];
                    case 3:
                        updatedTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.teamPreviewTransformer)(updatedTeam)];
                }
            });
        });
    };
    /**
     * Update the team's head of the given team to the given user
     * @param submitter The submitter of this request
     * @param teamId The id for the team that is being edited
     * @param userId The user to be the new team's head
     * @param organizationId The organization the user is currently in
     * @returns The team with the new head
     * @throws if the team is not found, the submitter has no privilege, the team is archived, or any user from the given userIds does not exist
     */
    TeamsService.setTeamHead = function (submitter, teamId, userId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team, newHead, newTeamMembers, newTeamLeads, newHeadTeam, updateTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeamsService.getSingleTeam(teamId, organization)];
                    case 1:
                        team = _a.sent();
                        if (team.dateArchived)
                            throw new errors_utils_1.HttpException(400, 'Cannot edit the head of an archived team');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!(_a.sent()) &&
                            submitter.userId !== team.head.userId)
                            throw new errors_utils_1.AccessDeniedException('You must be an admin or the head to update the head!');
                        return [4 /*yield*/, prisma_1.default.user.findUnique({
                                where: { userId: userId }
                            })];
                    case 3:
                        newHead = _a.sent();
                        if (!newHead)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        newTeamMembers = (0, teams_utils_1.removeUsersFromList)(team.members, [newHead]);
                        newTeamLeads = (0, teams_utils_1.removeUsersFromList)(team.leads, [newHead]);
                        if (!newHead)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(newHead.userId, organization.organizationId, shared_1.isHead)];
                    case 4:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('The team head must be at least a head');
                        return [4 /*yield*/, prisma_1.default.team.findFirst({
                                where: {
                                    AND: [
                                        { OR: [{ headId: userId }, { leads: { some: { userId: userId } } }] },
                                        { NOT: { teamId: team.teamId } },
                                        { organizationId: organization.organizationId }
                                    ]
                                }
                            })];
                    case 5:
                        newHeadTeam = _a.sent();
                        if (newHeadTeam)
                            throw new errors_utils_1.AccessDeniedException('The new team head must not be a head or lead of another team in the same organization!');
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: { teamId: teamId }, data: {
                                    head: {
                                        connect: { userId: userId }
                                    },
                                    members: {
                                        set: (0, users_utils_1.getPrismaQueryUserIds)(newTeamMembers)
                                    },
                                    leads: {
                                        set: (0, users_utils_1.getPrismaQueryUserIds)(newTeamLeads)
                                    }
                                } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 6:
                        updateTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(updateTeam)];
                }
            });
        });
    };
    /**
     * Hard deletes the team with the given teamId
     * @param deleter the user submitting this request
     * @param teamId the id of the team to be deleted
     * @param organizationId The organization the user is currently in
     */
    TeamsService.deleteTeam = function (deleter, teamId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(deleter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('delete teams');
                        return [4 /*yield*/, prisma_1.default.team.findUnique(__assign({ where: { teamId: teamId } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 2:
                        team = _a.sent();
                        if (!team)
                            throw new errors_utils_1.NotFoundException('Team', teamId);
                        return [4 /*yield*/, prisma_1.default.team.delete({ where: { teamId: teamId } })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new team in the database
     * @param submitter The submitter who is trying to create a new team
     * @param teamName the name of the new team
     * @param headId the id of the user who will be the head on the new team
     * @param slackId the slack id for the slack channel for the team
     * @param description a short description of the team (must be less than 300 words)
     * @param isFinanceTeam whether the team is the finance team
     * @param organizationId The organization the user is currently in
     * @returns The newly created team
     */
    TeamsService.createTeam = function (submitter, teamName, headId, slackId, description, isFinanceTeam, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var newHead, newHeadTeam, duplicateName, financeTeam, createdTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedException('You must be an admin or higher to create a new team!');
                        }
                        if (!(0, shared_2.isUnderWordCount)(description, 300))
                            throw new errors_utils_1.HttpException(400, 'Description must be less than 300 words');
                        return [4 /*yield*/, prisma_1.default.user.findUnique({
                                where: { userId: headId }
                            })];
                    case 2:
                        newHead = _a.sent();
                        if (!newHead)
                            throw new errors_utils_1.NotFoundException('User', headId);
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(newHead.userId, organization.organizationId, shared_1.isHead)];
                    case 3:
                        if (!(_a.sent()))
                            throw new errors_utils_1.HttpException(400, 'The team head must be at least a head');
                        return [4 /*yield*/, prisma_1.default.team.findFirst({
                                where: { headId: headId, organizationId: organization.organizationId }
                            })];
                    case 4:
                        newHeadTeam = _a.sent();
                        if (newHeadTeam)
                            throw new errors_utils_1.HttpException(400, 'The new team head must not be a head of another team in the same organization.');
                        return [4 /*yield*/, prisma_1.default.team.findFirst({
                                where: { teamName: teamName, organizationId: organization.organizationId }
                            })];
                    case 5:
                        duplicateName = _a.sent();
                        if (duplicateName)
                            throw new errors_utils_1.HttpException(400, 'The new team name must not be the name of another team');
                        return [4 /*yield*/, prisma_1.default.team.findFirst({
                                where: { financeTeam: true, organizationId: organization.organizationId }
                            })];
                    case 6:
                        financeTeam = _a.sent();
                        if (isFinanceTeam && financeTeam)
                            throw new errors_utils_1.HttpException(400, 'There can only be one finance team in an organization');
                        return [4 /*yield*/, prisma_1.default.team.create(__assign({ data: {
                                    teamName: teamName,
                                    slackId: slackId,
                                    description: description,
                                    head: { connect: { userId: headId } },
                                    organization: { connect: { organizationId: organization.organizationId } },
                                    financeTeam: isFinanceTeam
                                } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 7:
                        createdTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(createdTeam)];
                }
            });
        });
    };
    /**
     * Update the given teamId's team's leads
     * @param submitter a user who's making this request
     * @param teamId a id of team to be updated
     * @param userIds a array of user Ids that replaces team's old leads
     * @param organizationId The organization the user is currently in
     * @returns an updated team
     * @throws if the team is not found, the submitter has no privilege, the team is archived, or any user from the given userIds does not exist
     */
    TeamsService.setTeamLeads = function (submitter, teamId, userIds, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team, newLeads, newTeamMembers, updateTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeamsService.getSingleTeam(teamId, organization)];
                    case 1:
                        team = _a.sent();
                        if (team.dateArchived)
                            throw new errors_utils_1.HttpException(400, 'Cannot edit the leads of an archived team');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!(_a.sent()) &&
                            submitter.userId !== team.head.userId) {
                            throw new errors_utils_1.AccessDeniedException('You must be an admin or the head to update the lead!');
                        }
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(userIds)];
                    case 3:
                        newLeads = _a.sent();
                        if (newLeads.map(function (lead) { return lead.userId; }).includes(team.head.userId)) {
                            throw new errors_utils_1.HttpException(400, 'A lead cannot be the head of the team!');
                        }
                        newTeamMembers = (0, teams_utils_1.removeUsersFromList)(team.members, newLeads);
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: { teamId: teamId }, data: {
                                    leads: {
                                        set: (0, users_utils_1.getPrismaQueryUserIds)(newLeads)
                                    },
                                    members: {
                                        set: (0, users_utils_1.getPrismaQueryUserIds)(newTeamMembers)
                                    }
                                } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 4:
                        updateTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(updateTeam)];
                }
            });
        });
    };
    /**
     * Archives/unarchives a given team
     * @param submitter a user who's archiving the team
     * @param teamId a id of team to be updated
     * @param organizationId The organization the user is currently in
     * @returns the archived team
     * @throws if the team is not found, the submitter has no privilege, the team has any projects that are not complete
     */
    TeamsService.archiveTeam = function (submitter, teamId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var team, updateData, updatedTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findUnique(__assign({ where: { teamId: teamId } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 1:
                        team = _a.sent();
                        if (!team)
                            throw new errors_utils_1.NotFoundException('Team', teamId);
                        if (team.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('You must be an admin or above to archive a team');
                        if (team.projects.some(function (project) { return project.wbsElement.status !== client_1.WBS_Element_Status.COMPLETE; }))
                            throw new errors_utils_1.HttpException(400, 'A team is not archivable if it has any active projects, or incomplete projects');
                        updateData = {
                            dateArchived: team.dateArchived === null ? new Date() : null,
                            userArchived: team.userArchivedId === null ? { connect: { userId: submitter.userId } } : { disconnect: true }
                        };
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: { teamId: teamId }, data: updateData }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 3:
                        updatedTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(updatedTeam)];
                }
            });
        });
    };
    /**
     * Creates a team type
     * @param submitter the user who is creating the team type
     * @param name the name of the team type
     * @param iconName the name of the icon
     * @param organizationId The organization the user is currently in
     * @returns the created team
     */
    TeamsService.createTeamType = function (submitter, name, iconName, description, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var duplicateName, teamType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('create a team type');
                        }
                        return [4 /*yield*/, prisma_1.default.team_Type.findUnique({
                                where: { uniqueTeamType: { name: name, organizationId: organization.organizationId } }
                            })];
                    case 2:
                        duplicateName = _a.sent();
                        if (duplicateName) {
                            throw new errors_utils_1.HttpException(400, 'Cannot create a teamType with a name that already exists');
                        }
                        return [4 /*yield*/, prisma_1.default.team_Type.create({
                                data: {
                                    name: name,
                                    iconName: iconName,
                                    description: description,
                                    organizationId: organization.organizationId,
                                    calendarId: null
                                }
                            })];
                    case 3:
                        teamType = _a.sent();
                        return [2 /*return*/, (0, team_types_transformer_1.teamTypeTransformer)(teamType)];
                }
            });
        });
    };
    /**
     * Gets a team with the given id
     * @param teamTypeId - id of teamType to retrieve
     * @param organizationId The organization the user is currently in
     * @returns a teamType
     * @throws if the team is not found in the db
     */
    TeamsService.getSingleTeamType = function (teamTypeId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team_Type.findUnique({
                            where: { teamTypeId: teamTypeId }
                        })];
                    case 1:
                        teamType = _a.sent();
                        if (!teamType)
                            throw new errors_utils_1.NotFoundException('Team Type', teamTypeId);
                        if (teamType.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team Type');
                        return [2 /*return*/, (0, team_types_transformer_1.teamTypeTransformer)(teamType)];
                }
            });
        });
    };
    /**
     * Gets all the team types for the given organization
     * @param organizationId The organization the user is currently in
     * @returns all the team types for the given organization
     */
    TeamsService.getAllTeamTypes = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamTypes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team_Type.findMany({
                            where: { organizationId: organization.organizationId }
                        })];
                    case 1:
                        teamTypes = _a.sent();
                        return [2 /*return*/, teamTypes.map(team_types_transformer_1.teamTypeTransformer)];
                }
            });
        });
    };
    /**
     * Changes the description of the given teamType to be the new description
     * @param user The user who is editing the description
     * @param teamTypeId The id for the teamType that is being edited
     * @param name the new name for the team
     * @param iconName the new icon name for the team
     * @param description the new description for the team
     * @param imageFileId the new image for the team
     * @param organizationId The organization the user is currently in
     * @returns The team with the new description
     */
    TeamsService.editTeamType = function (user, teamTypeId, name, iconName, description, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTeamType, updatedTeamType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, shared_2.isUnderWordCount)(description, 300))
                            throw new errors_utils_1.HttpException(400, 'Description must be less than 300 words');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedException('you must be an admin to edit the team types description');
                        return [4 /*yield*/, prisma_1.default.team_Type.findUnique({
                                where: { teamTypeId: teamTypeId }
                            })];
                    case 2:
                        currentTeamType = _a.sent();
                        if (!currentTeamType) {
                            throw new errors_utils_1.NotFoundException('Team Type', teamTypeId);
                        }
                        return [4 /*yield*/, prisma_1.default.team_Type.update({
                                where: { teamTypeId: teamTypeId },
                                data: {
                                    name: name,
                                    iconName: iconName,
                                    description: description
                                }
                            })];
                    case 3:
                        updatedTeamType = _a.sent();
                        return [2 /*return*/, (0, team_types_transformer_1.teamTypeTransformer)(updatedTeamType)];
                }
            });
        });
    };
    /**
     * Sets the teamType for a team
     * @param submitter the user who is setting the team type
     * @param teamId id of the team
     * @param teamTypeId id of the teamType
     * @param organizationId The organization the user is currently in
     * @returns the updated team with teamType
     */
    TeamsService.setTeamType = function (submitter, teamId, teamTypeId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamType, team, updatedTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('set a team type');
                        }
                        return [4 /*yield*/, prisma_1.default.team_Type.findFirst({
                                where: { teamTypeId: teamTypeId }
                            })];
                    case 2:
                        teamType = _a.sent();
                        if (!teamType)
                            throw new errors_utils_1.NotFoundException('Team Type', teamTypeId);
                        if (teamType.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team Type');
                        return [4 /*yield*/, prisma_1.default.team.findUnique(__assign({ where: { teamId: teamId } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 3:
                        team = _a.sent();
                        if (!team)
                            throw new errors_utils_1.NotFoundException('Team', teamId);
                        if (team.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team');
                        return [4 /*yield*/, prisma_1.default.team.update(__assign({ where: { teamId: teamId }, data: {
                                    teamType: {
                                        connect: { teamTypeId: teamTypeId }
                                    }
                                } }, (0, teams_query_args_1.getTeamQueryArgs)(organization.organizationId)))];
                    case 4:
                        updatedTeam = _a.sent();
                        return [2 /*return*/, (0, teams_transformer_1.default)(updatedTeam)];
                }
            });
        });
    };
    /**
     * Deletes the Team Type with the given organization Id and Team_Type id
     * @param deleter a user who is making this request
     * @param teamTypeId the id of the Team Type to be deleted
     * @param organizationId the organization Id of the Team Type
     */
    TeamsService.deleteTeamType = function (deleter, teamTypeId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(deleter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('only admins can delete team types');
                        return [4 /*yield*/, prisma_1.default.team_Type.findUnique({
                                where: { teamTypeId: teamTypeId }
                            })];
                    case 2:
                        teamType = _a.sent();
                        if (!teamType)
                            throw new errors_utils_1.NotFoundException('Team Type', teamTypeId);
                        if (teamType.dateDeleted)
                            throw new errors_utils_1.DeletedException('Team Type', teamTypeId);
                        if (teamType.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Team Type');
                        return [4 /*yield*/, prisma_1.default.team_Type.update({
                                where: { teamTypeId: teamTypeId },
                                data: { dateDeleted: new Date(), deletedById: deleter.userId }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, teamType];
                }
            });
        });
    };
    /**
     * Adds the user to the team types onboarding list
     * @param submitter the user who is setting the onboarding team type
     * @param teamTypeId the id of the team type
     * @param organization the organization the user is currently in
     * @returns the updated team type
     */
    TeamsService.setOnboardingUser = function (submitter, teamTypeId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamType, updatedTeamType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team_Type.findUnique({
                            where: { teamTypeId: teamTypeId, organizationId: organization.organizationId },
                            include: { usersOnboarding: true }
                        })];
                    case 1:
                        teamType = _a.sent();
                        if (!teamType)
                            throw new errors_utils_1.NotFoundException('Team Type', teamTypeId);
                        // if the user is in any onboarding team type, remove them
                        return [4 /*yield*/, prisma_1.default.user.update({
                                where: { userId: submitter.userId },
                                data: {
                                    onboardingTeamTypes: {
                                        set: []
                                    }
                                }
                            })];
                    case 2:
                        // if the user is in any onboarding team type, remove them
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.team_Type.update({
                                where: { teamTypeId: teamTypeId },
                                data: {
                                    usersOnboarding: { connect: { userId: submitter.userId } }
                                }
                            })];
                    case 3:
                        updatedTeamType = _a.sent();
                        return [2 /*return*/, (0, team_types_transformer_1.teamTypeTransformer)(updatedTeamType)];
                }
            });
        });
    };
    TeamsService.completeOnboarding = function (submitter) {
        return __awaiter(this, void 0, void 0, function () {
            var onboardingTeamTypes, teamTypeIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team_Type.findMany({
                            where: { usersOnboarding: { some: { userId: submitter.userId } } }
                        })];
                    case 1:
                        onboardingTeamTypes = _a.sent();
                        teamTypeIds = onboardingTeamTypes.map(function (teamType) { return ({ teamTypeId: teamType.teamTypeId }); });
                        // remove the user from any onboardingTeamTypes they are a part of and add them to the onboardedTeamTypes
                        return [4 /*yield*/, prisma_1.default.user.update({
                                where: { userId: submitter.userId },
                                data: {
                                    onboardedTeamTypes: {
                                        set: teamTypeIds
                                    },
                                    onboardingTeamTypes: {
                                        set: []
                                    }
                                }
                            })];
                    case 2:
                        // remove the user from any onboardingTeamTypes they are a part of and add them to the onboardedTeamTypes
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TeamsService.setTeamTypeImage = function (submitter, teamTypeId, image, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamType, imageData, updatedTeamType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('set a team types image');
                        }
                        return [4 /*yield*/, prisma_1.default.team_Type.findUnique({
                                where: {
                                    teamTypeId: teamTypeId
                                }
                            })];
                    case 2:
                        teamType = _a.sent();
                        if (!teamType)
                            throw new errors_utils_1.NotFoundException('Team Type', teamTypeId);
                        return [4 /*yield*/, (0, google_integration_utils_1.uploadFile)(image)];
                    case 3:
                        imageData = _a.sent();
                        return [4 /*yield*/, prisma_1.default.team_Type.update({
                                where: {
                                    teamTypeId: teamTypeId
                                },
                                data: {
                                    imageFileId: imageData.id
                                }
                            })];
                    case 4:
                        updatedTeamType = _a.sent();
                        return [2 /*return*/, updatedTeamType];
                }
            });
        });
    };
    /**
     * Gets the current users teams workpackages
     *
     * @param user The current user
     * @param organization The organization the current user is logged in for
     */
    TeamsService.getMyTeamsWorkpackages = function (user, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var usersTeams, workPackages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.team.findMany({
                            where: {
                                organizationId: organization.organizationId,
                                dateArchived: null,
                                OR: [
                                    {
                                        members: { some: { userId: user.userId } },
                                        leads: { some: { userId: user.userId } },
                                        headId: user.userId
                                    }
                                ]
                            }
                        })];
                    case 1:
                        usersTeams = _a.sent();
                        return [4 /*yield*/, prisma_1.default.work_Package.findMany(__assign({ where: {
                                    wbsElement: {
                                        organizationId: organization.organizationId,
                                        dateDeleted: null,
                                        status: { not: client_1.WBS_Element_Status.COMPLETE }
                                    },
                                    project: {
                                        teams: {
                                            some: {
                                                teamId: {
                                                    in: usersTeams.map(function (team) { return team.teamId; })
                                                }
                                            }
                                        }
                                    }
                                } }, (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)))];
                    case 2:
                        workPackages = _a.sent();
                        return [2 /*return*/, workPackages.map(work_packages_transformer_1.default)];
                }
            });
        });
    };
    return TeamsService;
}());
exports.default = TeamsService;

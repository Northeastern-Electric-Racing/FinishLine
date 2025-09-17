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
exports.getTeamProjects = exports.removeUsersFromList = exports.getTeamsFromUsers = exports.isUserPartOfTeams = exports.areUsersPartOfTeams = exports.isUserOnTeam = exports.allUsersOnTeam = void 0;
var client_1 = require("@prisma/client");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
var teamQueryArgsMembersOnly = client_1.Prisma.validator()({
    include: {
        members: true,
        head: true,
        leads: true
    }
});
/**
 * Returns true if every given user is on the given team (either a member, head, or lead)
 * @param team the given team with members, lead, and head included in the get payload
 * @param users the given users
 * @returns true or false
 */
var allUsersOnTeam = function (team, users) {
    return users.every(function (user) { return (0, exports.isUserOnTeam)(team, user); });
};
exports.allUsersOnTeam = allUsersOnTeam;
/**
 * Returns true if the user is a member, head, or lead of a team
 */
var isUserOnTeam = function (team, user) {
    return (team.headId === user.userId ||
        team.leads.map(function (lead) { return lead.userId; }).includes(user.userId) ||
        team.members.map(function (member) { return member.userId; }).includes(user.userId));
};
exports.isUserOnTeam = isUserOnTeam;
/**
 * Validates that all of the users are at least part of one of the given teams
 *
 * @param teams the teams to check the users are on
 * @param users the users to check are on at least one of the teams
 * @returns if all of the users are part of at least one of ther teams
 */
var areUsersPartOfTeams = function (teams, users) {
    return users.every(function (user) { return teams.some(function (team) { return (0, exports.isUserOnTeam)(team, user); }); });
};
exports.areUsersPartOfTeams = areUsersPartOfTeams;
/**
 * Validates that the given user is part of at least one of the given teams
 *
 * @param teams the teams to check the users are on
 * @param user the user to check
 * @returns if all of the users are part of at least one of ther teams
 */
var isUserPartOfTeams = function (teams, user) {
    return teams.some(function (team) { return (0, exports.isUserOnTeam)(team, user); });
};
exports.isUserPartOfTeams = isUserPartOfTeams;
/**
 * Gets the teams from a list of users
 * @param users the users to get the teams from
 * @returns an array of the teams each user is in
 */
var getTeamsFromUsers = function (users) {
    return users.map(function (user) {
        var teams = [];
        if (user.teamsAsHead)
            teams.push.apply(teams, user.teamsAsHead);
        if (user.teamsAsLead)
            teams.push.apply(teams, user.teamsAsLead);
        if (user.teamsAsMember)
            teams.push.apply(teams, user.teamsAsMember);
        return teams;
    });
};
exports.getTeamsFromUsers = getTeamsFromUsers;
/**
 * Removes all users in the second list from the first list. Returns a list of
 * all users in the first list filtered to exclude those users in the second list.
 * @param currentUsers The primary list of users
 * @param usersToRemove the list of users to remove from currentUsers
 * @returns all users in currentUsers that aren't in usersToRemove
 */
var removeUsersFromList = function (currentUsers, usersToRemove) {
    var userIdsToRemove = usersToRemove.map(function (user) { return user.userId; });
    return currentUsers.filter(function (user) { return !userIdsToRemove.includes(user.userId); });
};
exports.removeUsersFromList = removeUsersFromList;
/**
 * Given a team id, produces all of the projects assigned to that team
 * @param teamId the id of the team
 * @returns array of projects currently assigned to the given team (errors if no team is found)
 */
var getTeamProjects = function (teamId) { return __awaiter(void 0, void 0, void 0, function () {
    var team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.team.findUnique({
                    where: {
                        teamId: teamId
                    },
                    include: {
                        projects: true
                    }
                })];
            case 1:
                team = _a.sent();
                if (!team) {
                    throw new errors_utils_1.NotFoundException('Team', teamId);
                }
                return [2 /*return*/, team.projects];
        }
    });
}); };
exports.getTeamProjects = getTeamProjects;

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamPreviewTransformer = void 0;
var user_transformer_1 = require("./user.transformer");
var team_types_transformer_1 = require("./team-types.transformer");
var projects_transformer_1 = require("./projects.transformer");
var teamTransformer = function (team) {
    var _a;
    return {
        teamId: team.teamId,
        teamName: team.teamName,
        slackId: team.slackId,
        description: team.description,
        head: (0, user_transformer_1.userTransformer)(team.head),
        members: team.members.map(user_transformer_1.userTransformer),
        projects: team.projects.map(projects_transformer_1.projectPreviewTransformer),
        leads: team.leads.map(user_transformer_1.userTransformer),
        userArchived: team.userArchived ? (0, user_transformer_1.userTransformer)(team.userArchived) : undefined,
        dateArchived: (_a = team.dateArchived) !== null && _a !== void 0 ? _a : undefined,
        teamType: team.teamType ? (0, team_types_transformer_1.teamTypeTransformer)(team.teamType) : undefined
    };
};
var teamPreviewTransformer = function (team) {
    return __assign(__assign({}, team), { leads: team.leads.map(user_transformer_1.userTransformer), members: team.members.map(user_transformer_1.userTransformer), head: (0, user_transformer_1.userTransformer)(team.head) });
};
exports.teamPreviewTransformer = teamPreviewTransformer;
exports.default = teamTransformer;

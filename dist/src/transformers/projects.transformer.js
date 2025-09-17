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
exports.retrospectiveProjectPreviewTransformer = exports.projectPreviewTransformer = void 0;
var shared_1 = require("shared");
var utils_1 = require("../utils/utils");
var tasks_transformer_1 = require("./tasks.transformer");
var projects_utils_1 = require("../utils/projects.utils");
var links_transformer_1 = require("./links.transformer");
var description_bullets_utils_1 = require("../utils/description-bullets.utils");
var user_transformer_1 = require("./user.transformer");
var teams_transformer_1 = require("./teams.transformer");
var work_packages_transformer_1 = require("./work-packages.transformer");
var projectTransformer = function (project) {
    var _a;
    var wbsElement = project.wbsElement;
    var wbsNum = (0, utils_1.wbsNumOf)(wbsElement);
    var lead = wbsElement.lead, manager = wbsElement.manager;
    return {
        wbsElementId: wbsElement.wbsElementId,
        id: project.projectId,
        wbsNum: wbsNum,
        dateCreated: wbsElement.dateCreated,
        name: wbsElement.name,
        status: (0, projects_utils_1.calculateProjectStatus)(project),
        lead: lead ? (0, user_transformer_1.userTransformer)(lead) : undefined,
        manager: manager ? (0, user_transformer_1.userTransformer)(manager) : undefined,
        changes: wbsElement.changes.map(function (change) { return ({
            changeId: change.changeId,
            changeRequestId: change.changeRequestId,
            changeRequestIdentifier: change.changeRequest.identifier,
            wbsNum: wbsNum,
            implementer: (0, user_transformer_1.userTransformer)(change.implementer),
            detail: change.detail,
            dateImplemented: change.dateImplemented
        }); }),
        deleted: wbsElement.dateDeleted !== null,
        favoritedBy: project.favoritedBy.map(user_transformer_1.userTransformer),
        teams: project.teams.map(teams_transformer_1.teamPreviewTransformer),
        summary: project.summary,
        budget: project.budget,
        links: project.wbsElement.links.map(links_transformer_1.linkTransformer),
        duration: (0, shared_1.calculateDuration)(project.workPackages),
        startDate: (0, shared_1.calculateProjectStartDate)(project.workPackages),
        endDate: (0, shared_1.calculateProjectEndDate)(project.workPackages),
        descriptionBullets: wbsElement.descriptionBullets.map(description_bullets_utils_1.descBulletConverter),
        tasks: wbsElement.tasks.map(tasks_transformer_1.default),
        workPackages: project.workPackages.map(work_packages_transformer_1.default),
        abbreviation: (_a = project.abbreviation) !== null && _a !== void 0 ? _a : undefined
    };
};
var projectPreviewTransformer = function (project) {
    var _a;
    var wbsElement = project.wbsElement;
    var wbsNum = (0, utils_1.wbsNumOf)(wbsElement);
    var lead = wbsElement.lead, manager = wbsElement.manager;
    return {
        id: project.projectId,
        wbsElementId: project.wbsElementId,
        dateCreated: project.wbsElement.dateCreated,
        name: project.wbsElement.name,
        status: (0, projects_utils_1.calculateProjectStatus)(project),
        wbsNum: wbsNum,
        deleted: !!project.wbsElement.dateDeleted,
        lead: lead ? (0, user_transformer_1.userTransformer)(lead) : undefined,
        manager: manager ? (0, user_transformer_1.userTransformer)(manager) : undefined,
        budget: project.budget,
        teams: project.teams.map(teams_transformer_1.teamPreviewTransformer),
        links: project.wbsElement.links.map(links_transformer_1.linkTransformer),
        duration: (0, shared_1.calculateDuration)(project.workPackages),
        startDate: (0, shared_1.calculateProjectStartDate)(project.workPackages),
        tasks: project.wbsElement.tasks.map(tasks_transformer_1.default),
        workPackages: project.workPackages.map(work_packages_transformer_1.default),
        abbreviation: (_a = project.abbreviation) !== null && _a !== void 0 ? _a : undefined
    };
};
exports.projectPreviewTransformer = projectPreviewTransformer;
var retrospectiveProjectPreviewTransformer = function (project) {
    return __assign(__assign({}, (0, exports.projectPreviewTransformer)(project)), { workPackages: project.workPackages.map(work_packages_transformer_1.retrospectiveWorkPackageTransformer), originalStartDate: (0, shared_1.calculateProjectOriginalStartDate)(project.workPackages), originalEndDate: (0, shared_1.calculateProjectOriginalEndDate)(project.workPackages) });
};
exports.retrospectiveProjectPreviewTransformer = retrospectiveProjectPreviewTransformer;
exports.default = projectTransformer;

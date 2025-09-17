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
exports.retrospectiveWorkPackageTransformer = void 0;
var shared_1 = require("shared");
var description_bullets_transformer_1 = require("../transformers/description-bullets.transformer");
var utils_1 = require("../utils/utils");
var user_transformer_1 = require("./user.transformer");
var design_reviews_transformer_1 = require("./design-reviews.transformer");
var team_types_transformer_1 = require("./team-types.transformer");
var workPackageTransformer = function (wpInput) {
    var wbsNum = (0, utils_1.wbsNumOf)(wpInput.wbsElement);
    return {
        wbsElementId: wpInput.wbsElementId,
        links: [],
        projectId: wpInput.projectId,
        id: wpInput.workPackageId,
        dateCreated: wpInput.wbsElement.dateCreated,
        name: wpInput.wbsElement.name,
        orderInProject: wpInput.orderInProject,
        startDate: wpInput.startDate,
        duration: wpInput.duration,
        descriptionBullets: wpInput.wbsElement.descriptionBullets.map(description_bullets_transformer_1.default),
        blockedBy: wpInput.blockedBy.map(utils_1.wbsNumOf),
        manager: wpInput.wbsElement.manager ? (0, user_transformer_1.userTransformer)(wpInput.wbsElement.manager) : undefined,
        lead: wpInput.wbsElement.lead ? (0, user_transformer_1.userTransformer)(wpInput.wbsElement.lead) : undefined,
        status: (0, utils_1.convertStatus)(wpInput.wbsElement.status),
        wbsNum: wbsNum,
        endDate: (0, shared_1.calculateEndDate)(wpInput.startDate, wpInput.duration),
        changes: wpInput.wbsElement.changes.map(function (change) { return ({
            wbsNum: wbsNum,
            changeId: change.changeId,
            changeRequestIdentifier: change.changeRequest.identifier,
            changeRequestId: change.changeRequestId,
            implementer: (0, user_transformer_1.userTransformer)(change.implementer),
            detail: change.detail,
            dateImplemented: change.dateImplemented
        }); }),
        teamTypes: wpInput.project.teams.flatMap(function (team) { var _a; return (_a = team.teamType) !== null && _a !== void 0 ? _a : []; }).map(team_types_transformer_1.teamTypeTransformer),
        projectName: wpInput.project.wbsElement.name,
        stage: wpInput.stage || undefined,
        blocking: wpInput.wbsElement.blocking.map(function (wp) { return (0, utils_1.wbsNumOf)(wp.wbsElement); }),
        designReviews: wpInput.wbsElement.designReviews.map(function (designReview) {
            return (0, design_reviews_transformer_1.designReviewPreviewTransformer)(designReview, "".concat(wpInput.project.wbsElement.name, " - ").concat(wpInput.wbsElement.name));
        }),
        deleted: wpInput.wbsElement.dateDeleted !== null
    };
};
var retrospectiveWorkPackageTransformer = function (wpInput) {
    return __assign(__assign({}, workPackageTransformer(wpInput)), { originalStartDate: wpInput.originalStartDate, originalDuration: wpInput.originalDuration });
};
exports.retrospectiveWorkPackageTransformer = retrospectiveWorkPackageTransformer;
exports.default = workPackageTransformer;

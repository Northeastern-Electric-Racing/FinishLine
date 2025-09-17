"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designReviewPreviewTransformer = exports.designReviewTransformer = void 0;
var shared_1 = require("shared");
var utils_1 = require("../utils/utils");
var user_transformer_1 = require("./user.transformer");
var team_types_transformer_1 = require("./team-types.transformer");
var designReviewTransformer = function (designReview) {
    var _a, _b, _c, _d, _e, _f;
    var wbsName = (0, shared_1.isProjectWbs)(designReview.wbsElement)
        ? designReview.wbsElement.name
        : "".concat((_a = designReview.wbsElement.workPackage) === null || _a === void 0 ? void 0 : _a.project.wbsElement.name, " - ").concat(designReview.wbsElement.name);
    return {
        designReviewId: designReview.designReviewId,
        dateScheduled: designReview.dateScheduled,
        meetingTimes: designReview.meetingTimes,
        dateCreated: designReview.dateCreated,
        userCreated: (0, user_transformer_1.userTransformer)(designReview.userCreated),
        requiredMembers: designReview.requiredMembers.map(user_transformer_1.userTransformer),
        optionalMembers: designReview.optionalMembers.map(user_transformer_1.userTransformer),
        confirmedMembers: designReview.confirmedMembers.map(user_transformer_1.userWithScheduleSettingsTransformer),
        deniedMembers: designReview.deniedMembers.map(user_transformer_1.userTransformer),
        location: (_b = designReview.location) !== null && _b !== void 0 ? _b : undefined,
        isOnline: designReview.isOnline,
        isInPerson: designReview.isInPerson,
        zoomLink: (_c = designReview.zoomLink) !== null && _c !== void 0 ? _c : undefined,
        calendarEventId: (_d = designReview.calendarEventId) !== null && _d !== void 0 ? _d : undefined,
        attendees: designReview.attendees.map(user_transformer_1.userTransformer),
        dateDeleted: (_e = designReview.dateDeleted) !== null && _e !== void 0 ? _e : undefined,
        userDeleted: designReview.userDeleted ? (0, user_transformer_1.userTransformer)(designReview.userDeleted) : undefined,
        docTemplateLink: (_f = designReview.docTemplateLink) !== null && _f !== void 0 ? _f : undefined,
        status: designReview.status,
        teamType: (0, team_types_transformer_1.teamTypeTransformer)(designReview.teamType),
        wbsName: wbsName,
        wbsNum: (0, utils_1.wbsNumOf)(designReview.wbsElement),
        initialDate: designReview.initialDateScheduled
    };
};
exports.designReviewTransformer = designReviewTransformer;
var designReviewPreviewTransformer = function (designReview, wbsName) {
    return {
        designReviewId: designReview.designReviewId,
        dateScheduled: designReview.dateScheduled,
        userCreated: (0, user_transformer_1.userTransformer)(designReview.userCreated),
        status: designReview.status,
        wbsName: wbsName
    };
};
exports.designReviewPreviewTransformer = designReviewPreviewTransformer;

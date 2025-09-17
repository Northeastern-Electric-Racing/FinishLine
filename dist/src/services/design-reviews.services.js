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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var shared_1 = require("shared");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("../utils/errors.utils");
var users_utils_1 = require("../utils/users.utils");
var design_reviews_utils_1 = require("../utils/design-reviews.utils");
var design_reviews_transformer_1 = require("../transformers/design-reviews.transformer");
var slack_utils_1 = require("../utils/slack.utils");
var design_reviews_query_args_1 = require("../prisma-query-args/design-reviews.query-args");
var work_packages_query_args_1 = require("../prisma-query-args/work-packages.query-args");
var user_query_args_1 = require("../prisma-query-args/user.query-args");
var google_integration_utils_1 = require("../utils/google-integration.utils");
var pop_up_utils_1 = require("../utils/pop-up.utils");
var DesignReviewsService = /** @class */ (function () {
    function DesignReviewsService() {
    }
    /**
     * Gets all design reviews in the database
     * @param organizationId the organization id of the current user
     * @returns All of the design reviews
     */
    DesignReviewsService.getAllDesignReviews = function (organization) {
        return __awaiter(this, void 0, void 0, function () {
            var designReviews;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.design_Review.findMany(__assign({ where: { dateDeleted: null, wbsElement: { organizationId: organization.organizationId } } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 1:
                        designReviews = _a.sent();
                        return [2 /*return*/, designReviews.map(design_reviews_transformer_1.designReviewTransformer)];
                }
            });
        });
    };
    /**
     * Deletes a design review
     * @param submitter the user who deleted the design review
     * @param designReviewId the id of the design review to be deleted
     * @param organizationId the organization that the user is currently in
     */
    DesignReviewsService.deleteDesignReview = function (submitter, designReviewId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var designReview, deletedDesignReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.design_Review.findUnique(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 1:
                        designReview = _a.sent();
                        if (!designReview)
                            throw new errors_utils_1.NotFoundException('Design Review', designReviewId);
                        if (designReview.dateDeleted)
                            throw new errors_utils_1.DeletedException('Design Review', designReviewId);
                        if (designReview.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Design Review');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        if (!((_a.sent()) ||
                            submitter.userId === designReview.userCreatedId))
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('delete design reviews');
                        return [4 /*yield*/, prisma_1.default.design_Review.update(__assign({ where: { designReviewId: designReviewId }, data: { dateDeleted: new Date(), userDeleted: { connect: { userId: submitter.userId } } } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 3:
                        deletedDesignReview = _a.sent();
                        if (!(deletedDesignReview.calendarEventId &&
                            deletedDesignReview.teamType.calendarId &&
                            deletedDesignReview.calendarEventId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, google_integration_utils_1.deleteCalendarEvent)(deletedDesignReview.teamType.calendarId, deletedDesignReview.calendarEventId)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(deletedDesignReview)];
                }
            });
        });
    };
    /**
     * Create a design review
     * @param submitter User submitting the design review
     * @param initialDate what initial date to base the meeting times off of
     * @param teamTypeId team type id
     * @param requiredMemberIds ids of members who are required to go
     * @param optionalMemberIds ids of members who do not have to go
     * @param wbsNum wbs num related to the design review
     * @param meetingTimes meeting times of the design review
     * @param organizationId the organization that the user is currently in
     * @returns a new design review
     */
    DesignReviewsService.createDesignReview = function (submitter, initialDate, teamTypeId, requiredMemberIds, optionalMemberIds, wbsNum, meetingTimes, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var teamType, wbsElement, date, designReview, members, memberUserSettings, _i, memberUserSettings_1, memberUserSetting, err_1, project, teams;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(submitter.userId, organization.organizationId, shared_1.isLeadership)];
                    case 1:
                        if (!(_b.sent()))
                            throw new errors_utils_1.AccessDeniedException('create design review');
                        return [4 /*yield*/, DesignReviewsService.getSingleTeamType(teamTypeId, organization)];
                    case 2:
                        teamType = _b.sent();
                        return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({
                                where: {
                                    wbsNumber: {
                                        carNumber: wbsNum.carNumber,
                                        projectNumber: wbsNum.projectNumber,
                                        workPackageNumber: wbsNum.workPackageNumber,
                                        organizationId: organization.organizationId
                                    }
                                },
                                include: {
                                    workPackage: (0, work_packages_query_args_1.getWorkPackageQueryArgs)(organization.organizationId)
                                }
                            })];
                    case 3:
                        wbsElement = _b.sent();
                        if (!wbsElement)
                            throw new errors_utils_1.NotFoundException('WBS Element', wbsNum.carNumber);
                        if (wbsElement.dateDeleted)
                            throw new errors_utils_1.DeletedException('WBS Element', wbsNum.carNumber);
                        if (wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('WBS Element');
                        // checks if the meeting times are valid times and are all continous (ie. [1, 2, 3, 4])
                        (0, design_reviews_utils_1.validateMeetingTimes)(meetingTimes);
                        date = new Date(initialDate);
                        if (date.getTime() < new Date().getTime()) {
                            throw new errors_utils_1.HttpException(400, 'Design review cannot be initially set for a past day');
                        }
                        return [4 /*yield*/, prisma_1.default.design_Review.create(__assign({ data: {
                                    initialDateScheduled: date,
                                    dateScheduled: date,
                                    dateCreated: new Date(),
                                    status: client_1.Design_Review_Status.UNCONFIRMED,
                                    isOnline: false,
                                    isInPerson: false,
                                    userCreated: { connect: { userId: submitter.userId } },
                                    teamType: { connect: { teamTypeId: teamType.teamTypeId } },
                                    requiredMembers: { connect: requiredMemberIds.map(function (memberId) { return ({ userId: memberId }); }) },
                                    optionalMembers: { connect: optionalMemberIds.map(function (memberId) { return ({ userId: memberId }); }) },
                                    meetingTimes: meetingTimes,
                                    wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } }
                                } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 4:
                        designReview = _b.sent();
                        return [4 /*yield*/, prisma_1.default.user.findMany({
                                where: { userId: { in: optionalMemberIds.concat(requiredMemberIds) } }
                            })];
                    case 5:
                        members = _b.sent();
                        if (!members) {
                            throw new errors_utils_1.NotFoundException('User', 'Cannot find members who are invited to the design review');
                        }
                        return [4 /*yield*/, prisma_1.default.user_Settings.findMany({
                                where: { userId: { in: members.map(function (member) { return member.userId; }) } }
                            })];
                    case 6:
                        memberUserSettings = _b.sent();
                        if (!memberUserSettings) {
                            throw new errors_utils_1.NotFoundException('User Settings', 'Cannot find settings of members');
                        }
                        _i = 0, memberUserSettings_1 = memberUserSettings;
                        _b.label = 7;
                    case 7:
                        if (!(_i < memberUserSettings_1.length)) return [3 /*break*/, 12];
                        memberUserSetting = memberUserSettings_1[_i];
                        if (!memberUserSetting.slackId) return [3 /*break*/, 11];
                        _b.label = 8;
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, (0, slack_utils_1.sendSlackDesignReviewConfirmNotification)(memberUserSetting.slackId, designReview.designReviewId, designReview.wbsElement.name)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_1 = _b.sent();
                        if (err_1 instanceof Error) {
                            throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(err_1.message));
                        }
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 7];
                    case 12: return [4 /*yield*/, (0, pop_up_utils_1.sendDrPopUp)(designReview, members, submitter, wbsElement.name, organization.organizationId)];
                    case 13:
                        _b.sent();
                        project = (_a = wbsElement.workPackage) === null || _a === void 0 ? void 0 : _a.project;
                        teams = project === null || project === void 0 ? void 0 : project.teams;
                        if (!(teams && teams.length > 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, (0, slack_utils_1.sendSlackDRNotifications)(teams, designReview, submitter, wbsElement.name)];
                    case 14:
                        _b.sent();
                        _b.label = 15;
                    case 15: return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(designReview)];
                }
            });
        });
    };
    /**
     * Retrieves a single design review
     *
     * @param submitter the user who is trying to retrieve the design review
     * @param designReviewId the id of the design review to retrieve
     * @param organizationId the organization that the user is currently in
     * @returns the design review
     */
    DesignReviewsService.getSingleDesignReview = function (_submitter, designReviewId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var designReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.design_Review.findUnique(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 1:
                        designReview = _a.sent();
                        if (!designReview)
                            throw new errors_utils_1.NotFoundException('Design Review', designReviewId);
                        if (designReview.dateDeleted)
                            throw new errors_utils_1.DeletedException('Design Review', designReviewId);
                        if (designReview.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Design Review');
                        return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(designReview)];
                }
            });
        });
    };
    /**
     * Edits a Design_Review in the database
     * @param user the user editing the design review (must be leadership)
     * @param designReviewId the id of the design review to edit
     * @param dateScheduled the date of the design review
     * @param teamTypeId the team that the design_review is for (software, electrical, etc.)
     * @param requiredMembersIds required members Ids for the design review
     * @param optionalMembersIds optional members Ids for the design review
     * @param isOnline is the design review online (IF TRUE: zoom link should be requried)
     * @param isInPerson is the design review in person (IF TRUE: location should be required)
     * @param zoomLink the zoom link for the design review meeting
     * @param location the location for the design review meeting
     * @param docTemplateLink the document template link for the design review
     * @param status see Design_Review_Status enum
     * @param attendees the attendees for the design review
     * @param meetingTimes meeting time must be between 0-83 (representing 1hr increments from 10am 10pm, Monday-Sunday)
     * @param organizationId the organization that the user is currently in
     */
    DesignReviewsService.editDesignReview = function (user, designReviewId, dateScheduled, teamTypeId, requiredMembersIds, optionalMembersIds, isOnline, isInPerson, zoomLink, location, docTemplateLink, status, attendees, meetingTimes, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var originaldesignReview, teamType, updatedRequiredMembers, _a, updatedOptionalMembers, _b, updatedAttendees, _c, calendarEventId, _d, _e, allRequiredMembersConfirmed, updatedDesignReview;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isNotLeadership)];
                    case 1:
                        // verify user is allowed to edit design review
                        if (_g.sent())
                            throw new errors_utils_1.AccessDeniedMemberException('edit design reviews');
                        // make sure the requiredMembersIds are not in the optionalMembers
                        if (requiredMembersIds.length > 0 && requiredMembersIds.some(function (rMemberId) { return optionalMembersIds.includes(rMemberId); })) {
                            throw new errors_utils_1.HttpException(400, 'required members cannot be in optional members');
                        }
                        // make sure there is a zoom link if the design review is online
                        if (isOnline && zoomLink === null) {
                            throw new errors_utils_1.HttpException(400, 'zoom link is required for online design reviews');
                        }
                        // make sure there is a location if the design review is in person
                        if (isInPerson && location === null) {
                            throw new errors_utils_1.HttpException(400, 'location is required for in person design reviews');
                        }
                        // throws if meeting times are not: consecutive and between 0-11
                        meetingTimes = (0, design_reviews_utils_1.validateMeetingTimes)(meetingTimes);
                        // docTemplateLink is required if the status is scheduled or done
                        if (status === client_1.Design_Review_Status.SCHEDULED || status === client_1.Design_Review_Status.DONE) {
                            if (docTemplateLink == null) {
                                throw new errors_utils_1.HttpException(400, 'doc template link is required for scheduled and done design reviews');
                            }
                        }
                        return [4 /*yield*/, prisma_1.default.design_Review.findUnique(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 2:
                        originaldesignReview = _g.sent();
                        if (!originaldesignReview)
                            throw new errors_utils_1.NotFoundException('Design Review', designReviewId);
                        if (originaldesignReview.dateDeleted)
                            throw new errors_utils_1.DeletedException('Design Review', designReviewId);
                        if (originaldesignReview.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Design Review');
                        return [4 /*yield*/, DesignReviewsService.getSingleTeamType(teamTypeId, organization)];
                    case 3:
                        teamType = _g.sent();
                        _a = users_utils_1.getPrismaQueryUserIds;
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(requiredMembersIds)];
                    case 4:
                        updatedRequiredMembers = _a.apply(void 0, [_g.sent()]);
                        _b = users_utils_1.getPrismaQueryUserIds;
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(optionalMembersIds)];
                    case 5:
                        updatedOptionalMembers = _b.apply(void 0, [_g.sent()]);
                        _c = users_utils_1.getPrismaQueryUserIds;
                        return [4 /*yield*/, (0, users_utils_1.getUsers)(attendees)];
                    case 6:
                        updatedAttendees = _c.apply(void 0, [_g.sent()]);
                        if (!((_f = originaldesignReview.calendarEventId) !== null && _f !== void 0)) return [3 /*break*/, 7];
                        _d = _f;
                        return [3 /*break*/, 10];
                    case 7:
                        _e = teamType.calendarId;
                        if (!_e) return [3 /*break*/, 9];
                        return [4 /*yield*/, (0, google_integration_utils_1.createCalendarEvent)(teamType.calendarId, __spreadArray(__spreadArray([], requiredMembersIds, true), optionalMembersIds, true), dateScheduled, isInPerson, zoomLink, location, meetingTimes, originaldesignReview.wbsElement)];
                    case 8:
                        _e = (_g.sent());
                        _g.label = 9;
                    case 9:
                        _d = (_e);
                        _g.label = 10;
                    case 10:
                        calendarEventId = _d;
                        allRequiredMembersConfirmed = updatedRequiredMembers.every(function (member) {
                            return originaldesignReview.confirmedMembers.map(function (user) { return user.userId; }).includes(member.userId);
                        });
                        if (status === client_1.Design_Review_Status.CONFIRMED && allRequiredMembersConfirmed) {
                            status = client_1.Design_Review_Status.SCHEDULED;
                        }
                        return [4 /*yield*/, prisma_1.default.design_Review.update(__assign({ where: { designReviewId: designReviewId }, data: {
                                    designReviewId: designReviewId,
                                    dateScheduled: dateScheduled,
                                    meetingTimes: meetingTimes,
                                    status: status,
                                    teamTypeId: teamType.teamTypeId,
                                    requiredMembers: {
                                        set: updatedRequiredMembers
                                    },
                                    optionalMembers: {
                                        set: updatedOptionalMembers
                                    },
                                    location: location,
                                    isOnline: isOnline,
                                    isInPerson: isInPerson,
                                    zoomLink: zoomLink,
                                    docTemplateLink: docTemplateLink,
                                    attendees: {
                                        set: updatedAttendees
                                    },
                                    calendarEventId: calendarEventId
                                } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 11:
                        updatedDesignReview = _g.sent();
                        if (!(status === client_1.Design_Review_Status.SCHEDULED)) return [3 /*break*/, 14];
                        return [4 /*yield*/, (0, slack_utils_1.sendDRScheduledSlackNotif)(updatedDesignReview.notificationSlackThreads, updatedDesignReview)];
                    case 12:
                        _g.sent();
                        if (!(updatedDesignReview.calendarEventId && updatedDesignReview.teamType.calendarId)) return [3 /*break*/, 14];
                        return [4 /*yield*/, (0, google_integration_utils_1.updateCalendarEvent)(updatedDesignReview.teamType.calendarId, updatedDesignReview.calendarEventId, __spreadArray(__spreadArray([], requiredMembersIds, true), optionalMembersIds, true), updatedDesignReview.dateScheduled, updatedDesignReview.isInPerson, updatedDesignReview.zoomLink, updatedDesignReview.location, updatedDesignReview.meetingTimes, updatedDesignReview.wbsElement)];
                    case 13:
                        _g.sent();
                        _g.label = 14;
                    case 14: return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(updatedDesignReview)];
                }
            });
        });
    };
    /**
     * Edits a design review by confirming a given user's availability and also updating their schedule settings with the given availability
     * @param submitter the member that is being confirmed
     * @param designReviewId the id of the design review
     * @param availabilities the given member's availabilities
     * @param organizationId the organization that the user is currently in
     * @returns the modified design review with its updated confirmedMembers
     */
    DesignReviewsService.markUserConfirmed = function (designReviewId, availabilities, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var designReview, userSettings, updatedDesignReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.design_Review.findUnique(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)))];
                    case 1:
                        designReview = _a.sent();
                        if (!designReview)
                            throw new errors_utils_1.NotFoundException('Design Review', designReviewId);
                        if (designReview.dateDeleted)
                            throw new errors_utils_1.DeletedException('Design Review', designReviewId);
                        if (designReview.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Design Review');
                        if (!(0, design_reviews_utils_1.isUserOnDesignReview)(submitter, (0, design_reviews_transformer_1.designReviewTransformer)(designReview)))
                            throw new errors_utils_1.HttpException(400, 'Current user is not in the list of this design reviews members');
                        return [4 /*yield*/, prisma_1.default.schedule_Settings.findUnique(__assign({ where: { userId: submitter.userId } }, (0, user_query_args_1.getUserScheduleSettingsQueryArgs)()))];
                    case 2:
                        userSettings = _a.sent();
                        if (!!userSettings) return [3 /*break*/, 4];
                        return [4 /*yield*/, prisma_1.default.schedule_Settings.create(__assign({ data: {
                                    userId: submitter.userId,
                                    availabilities: {
                                        createMany: {
                                            data: availabilities.map(function (availability) { return ({
                                                availability: availability.availability,
                                                dateSet: availability.dateSet
                                            }); })
                                        }
                                    },
                                    personalGmail: '',
                                    personalZoomLink: ''
                                } }, (0, user_query_args_1.getUserScheduleSettingsQueryArgs)()))];
                    case 3:
                        userSettings = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, (0, users_utils_1.updateUserAvailability)(availabilities, userSettings, submitter)];
                    case 5:
                        _a.sent();
                        if (!!designReview.confirmedMembers.map(function (user) { return user.userId; }).includes(submitter.userId)) return [3 /*break*/, 11];
                        return [4 /*yield*/, prisma_1.default.design_Review.update(__assign(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)), { data: {
                                    confirmedMembers: {
                                        connect: {
                                            userId: submitter.userId
                                        }
                                    }
                                } }))];
                    case 6:
                        updatedDesignReview = _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendDRUserConfirmationToThread)(updatedDesignReview.notificationSlackThreads, submitter)];
                    case 7:
                        _a.sent();
                        if (!((0, users_utils_1.areUsersinList)(designReview.requiredMembers, updatedDesignReview.confirmedMembers) &&
                            (0, users_utils_1.areUsersinList)([submitter], designReview.requiredMembers))) return [3 /*break*/, 10];
                        return [4 /*yield*/, prisma_1.default.design_Review.update(__assign(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)), { data: {
                                    status: client_1.Design_Review_Status.CONFIRMED
                                } }))];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, (0, slack_utils_1.sendDRConfirmationToThread)(updatedDesignReview.notificationSlackThreads, updatedDesignReview.userCreated)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(updatedDesignReview)];
                    case 11: return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(designReview)];
                }
            });
        });
    };
    /**
     * Sets the status of a design review, only admin or the user who created the design review can set the status.
     * @param user the user trying to set the status
     * @param designReviewId the id of the design review
     * @param status the status to set the design review to
     * @param organizationId the organization that the user is currently in
     * @returns the modified design review
     */
    DesignReviewsService.setStatus = function (user, designReviewId, status, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var originaldesignReview, updatedDesignReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.design_Review.findUnique({
                            where: { designReviewId: designReviewId },
                            include: { wbsElement: true }
                        })];
                    case 1:
                        originaldesignReview = _a.sent();
                        if (!originaldesignReview)
                            throw new errors_utils_1.NotFoundException('Design Review', designReviewId);
                        if (originaldesignReview.dateDeleted)
                            throw new errors_utils_1.DeletedException('Design Review', designReviewId);
                        if (originaldesignReview.wbsElement.organizationId !== organization.organizationId)
                            throw new errors_utils_1.InvalidOrganizationException('Design Review');
                        return [4 /*yield*/, (0, users_utils_1.userHasPermission)(user.userId, organization.organizationId, shared_1.isAdmin)];
                    case 2:
                        // verify user is allowed to set the status of the design review
                        if (!(_a.sent()) &&
                            user.userId !== originaldesignReview.userCreatedId) {
                            throw new errors_utils_1.AccessDeniedAdminOnlyException('set the status of a design review');
                        }
                        return [4 /*yield*/, prisma_1.default.design_Review.update(__assign(__assign({ where: { designReviewId: designReviewId } }, (0, design_reviews_query_args_1.getDesignReviewQueryArgs)(organization.organizationId)), { data: {
                                    status: status
                                } }))];
                    case 3:
                        updatedDesignReview = _a.sent();
                        return [2 /*return*/, (0, design_reviews_transformer_1.designReviewTransformer)(updatedDesignReview)];
                }
            });
        });
    };
    /**
     * Gets a single team type and validates that it exists and is in the organization
     * @param teamTypeId The id of the team type to get
     * @param organizationId The organization that the user is currently in
     * @returns The retrieved Team Type
     */
    DesignReviewsService.getSingleTeamType = function (teamTypeId, organization) {
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
                        return [2 /*return*/, teamType];
                }
            });
        });
    };
    return DesignReviewsService;
}());
exports.default = DesignReviewsService;

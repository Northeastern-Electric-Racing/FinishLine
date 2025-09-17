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
exports.notifySponsorTaskAssignee = exports.sendSlackPartAssignmentNotif = exports.sendSlackPartReviewRequestNotif = exports.getUserIdFromSlackId = exports.blockToMentionedUsers = exports.blockToString = exports.addSlackThreadsToChangeRequest = exports.sendSlackCRStatusToThread = exports.sendSlackCRReviewedNotification = exports.sendDRScheduledSlackNotif = exports.sendDRConfirmationToThread = exports.sendDRUserConfirmationToThread = exports.sendSlackDRNotifications = exports.sendSlackDesignReviewNotification = exports.sendAndGetSlackCRNotifications = exports.sendSlackChangeRequestNotification = exports.sendSlackDesignReviewConfirmNotification = exports.sendSubmittedToSaboNotification = exports.sendReimbursementRequestChangesRequestedNotification = exports.sendReimbursementRequestLeadershipApprovedNotification = exports.sendReimbursementRequestPendingFinanceNotification = exports.sendThreadResponse = exports.sendReimbursementRequestDeniedNotification = exports.sendReimbursementRequestCreatedNotificationAndCreateMessageInfo = exports.sendSlackTaskAssignedNotification = exports.sendSlackRequestedReviewNotification = exports.sendSlackUpcomingDeadlineNotification = exports.buildDueString = void 0;
var shared_1 = require("shared");
var slack_1 = require("../integrations/slack");
var users_utils_1 = require("./users.utils");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
var notifications_utils_1 = require("./notifications.utils");
var design_reviews_utils_1 = require("./design-reviews.utils");
var user_transformer_1 = require("../transformers/user.transformer");
var users_services_1 = require("../services/users.services");
// build the "due" string for the upcoming deadlines slack message
var buildDueString = function (daysUntilDeadline) {
    if (daysUntilDeadline < 0)
        return "was due *".concat(daysUntilDeadline * -1, " days ago!*");
    else if (daysUntilDeadline === 0)
        return "is due today!";
    return "is due in ".concat(daysUntilDeadline, " days!");
};
exports.buildDueString = buildDueString;
// build the "user" string for the upcoming deadlines slack message
var buildUserString = function (lead, slackId) {
    if (lead && slackId)
        return "<@".concat(slackId, ">");
    if (lead && !slackId)
        return "".concat(lead.firstName, " ").concat(lead.lastName, " (<https://finishlinebyner.com/settings|set your slack id here>)");
    return '(no project lead)';
};
var sendSlackUpcomingDeadlineNotification = function (workPackage) { return __awaiter(void 0, void 0, void 0, function () {
    var endDate, _a, lead, manager, slackId, daysUntilDeadline, userString, managerString, _b, _c, _d, dueString, wbsNumber, wbsString, fullMsg, promises;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                endDate = (0, shared_1.calculateEndDate)(workPackage.startDate, workPackage.duration);
                _a = workPackage.wbsElement, lead = _a.lead, manager = _a.manager;
                return [4 /*yield*/, (0, users_utils_1.getUserSlackId)(lead === null || lead === void 0 ? void 0 : lead.userId)];
            case 1:
                slackId = _e.sent();
                daysUntilDeadline = (0, shared_1.daysBetween)(endDate, new Date());
                userString = lead ? buildUserString((0, user_transformer_1.userTransformer)(lead), slackId) : 'No Lead Set';
                if (!manager) return [3 /*break*/, 3];
                _c = buildUserString;
                _d = [(0, user_transformer_1.userTransformer)(manager)];
                return [4 /*yield*/, (0, users_utils_1.getUserSlackId)(manager.userId)];
            case 2:
                _b = _c.apply(void 0, _d.concat([_e.sent()]));
                return [3 /*break*/, 4];
            case 3:
                _b = 'No Manager Set';
                _e.label = 4;
            case 4:
                managerString = _b;
                dueString = (0, exports.buildDueString)(daysUntilDeadline);
                wbsNumber = (0, shared_1.wbsPipe)(workPackage.wbsElement);
                wbsString = "<https://finishlinebyner.com/projects/".concat(wbsNumber, "|").concat(wbsNumber, ">");
                fullMsg = "".concat(userString, " ").concat(managerString, " ").concat(wbsString, ": ").concat(workPackage.project.wbsElement.name, " - ").concat(workPackage.wbsElement.name, " ").concat(dueString);
                promises = workPackage.project.teams.map(function (team) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, slack_1.sendMessage)(team.slackId, fullMsg)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); });
                return [4 /*yield*/, Promise.all(promises)];
            case 5:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendSlackUpcomingDeadlineNotification = sendSlackUpcomingDeadlineNotification;
/**
 * Send CR requested review notification to reviewer in Slack
 * @param reviewers the user information of the reviewers
 * @param changeRequest the requested change request to be reviewed
 */
var sendSlackRequestedReviewNotification = function (reviewers, changeRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var btnText, changeRequestLink, slackPingMessage, fullMsg, threads;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                btnText = "View CR";
                changeRequestLink = "https://finishlinebyner.com/change-requests/".concat(changeRequest.crId);
                slackPingMessage = (0, notifications_utils_1.usersToSlackPings)(reviewers);
                fullMsg = "".concat(slackPingMessage, " Your review has been requested on CR #").concat(changeRequest.identifier, "!");
                return [4 /*yield*/, prisma_1.default.message_Info.findMany({ where: { changeRequestId: changeRequest.crId } })];
            case 1:
                threads = _a.sent();
                threads.forEach(function (thread) {
                    return (0, slack_1.replyToMessageInThread)(thread.channelId, thread.timestamp, fullMsg, changeRequestLink, btnText);
                });
                return [2 /*return*/];
        }
    });
}); };
exports.sendSlackRequestedReviewNotification = sendSlackRequestedReviewNotification;
/**
 * Send Task assigned notification to assignee on Slack
 * @param slackId the slack id of the assignee
 * @param task the task they were assigned to
 * @param organizationId the organization id of the current user
 */
var sendSlackTaskAssignedNotification = function (slackId, task, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var project, msg, link, linkButtonText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                return [4 /*yield*/, prisma_1.default.wBS_Element.findUnique({ where: { wbsNumber: __assign(__assign({}, task.wbsNum), { organizationId: organizationId }) } })];
            case 1:
                project = _a.sent();
                msg = "You have been assigned to a task: ".concat(task.title, " on project ").concat((0, shared_1.wbsPipe)(task.wbsNum), " - ").concat(project === null || project === void 0 ? void 0 : project.name);
                link = "https://finishlinebyner.com/projects/".concat((0, shared_1.wbsPipe)(task.wbsNum), "/tasks");
                linkButtonText = 'View Task';
                return [4 /*yield*/, (0, slack_1.sendMessage)(slackId, msg, link, linkButtonText)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendSlackTaskAssignedNotification = sendSlackTaskAssignedNotification;
/**
 * Send a notification to users that a reimbursement request is created on Slack
 * @param requestId the id if the reimbursement request
 * @param submitterId the id of the user who created the reimbursement request
 */
var sendReimbursementRequestCreatedNotificationAndCreateMessageInfo = function (requestId, requestIdentifier, submitterId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var msg, _a, link, linkButtonText, financeTeam, messageInfo, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                _a = "".concat;
                return [4 /*yield*/, (0, users_utils_1.getUserFullName)(submitterId)];
            case 1:
                msg = _a.apply("", [_b.sent(), " created a reimbursement request (ID#: "]).concat(requestIdentifier, ") \uD83D\uDCB2");
                link = "https://finishlinebyner.com/finance/reimbursement-requests/".concat(requestId);
                linkButtonText = 'View Reimbursement Request';
                return [4 /*yield*/, prisma_1.default.team.findFirst({
                        where: { financeTeam: true, organizationId: organizationId }
                    })];
            case 2:
                financeTeam = _b.sent();
                if (!financeTeam)
                    throw new errors_utils_1.HttpException(500, 'Finance team does not exist!');
                _b.label = 3;
            case 3:
                _b.trys.push([3, 6, , 7]);
                return [4 /*yield*/, (0, slack_1.sendMessage)(financeTeam.slackId, msg, link, linkButtonText)];
            case 4:
                messageInfo = _b.sent();
                if (!messageInfo)
                    return [2 /*return*/]; // Not on prod
                return [4 /*yield*/, prisma_1.default.message_Info.create({
                        data: {
                            reimbursementRequestId: requestId,
                            channelId: messageInfo.channelId,
                            timestamp: messageInfo.ts
                        }
                    })];
            case 5:
                _b.sent();
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                if (error_1 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(error_1.message));
                }
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.sendReimbursementRequestCreatedNotificationAndCreateMessageInfo = sendReimbursementRequestCreatedNotificationAndCreateMessageInfo;
/**
 * Send a notification to users that reimbursement request is denied on Slack
 * @param slackId the slack id of the assignee
 * @param denial the denial if the reimbursement request
 */
var sendReimbursementRequestDeniedNotification = function (slackId, requestId) { return __awaiter(void 0, void 0, void 0, function () {
    var msg, link, linkButtonText, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                msg = "Your reimbursement request has been denied.";
                link = "https://finishlinebyner.com/finance/reimbursement-requests/".concat(requestId);
                linkButtonText = 'View Reimbursement Request';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, slack_1.sendMessage)(slackId, msg, link, linkButtonText)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                if (error_2 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(error_2.message));
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendReimbursementRequestDeniedNotification = sendReimbursementRequestDeniedNotification;
var sendThreadResponse = function (threads, message) { return __awaiter(void 0, void 0, void 0, function () {
    var msgs, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!(threads && threads.length !== 0)) return [3 /*break*/, 3];
                msgs = threads.map(function (thread) { return (0, slack_1.replyToMessageInThread)(thread.channelId, thread.timestamp, message); });
                return [4 /*yield*/, Promise.all(msgs)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                if (err_1 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notifications: ".concat(err_1.message));
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.sendThreadResponse = sendThreadResponse;
var sendReimbursementRequestPendingFinanceNotification = function (threads) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, (0, exports.sendThreadResponse)(threads, "This Reimbursement Request is now pending finance :moneybag:")];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.sendReimbursementRequestPendingFinanceNotification = sendReimbursementRequestPendingFinanceNotification;
var sendReimbursementRequestLeadershipApprovedNotification = function (threads) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.sendThreadResponse)(threads, "This Reimbursment Request has been approved by leadership, you may now purchase the items and add the receipts, then mark the reimbursement request as pending finance.")];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.sendReimbursementRequestLeadershipApprovedNotification = sendReimbursementRequestLeadershipApprovedNotification;
var sendReimbursementRequestChangesRequestedNotification = function (threads) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.sendThreadResponse)(threads, 'The finance team has requested changes on this reimbursement request, please make the changes and remark as pending finance.')];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.sendReimbursementRequestChangesRequestedNotification = sendReimbursementRequestChangesRequestedNotification;
var sendSubmittedToSaboNotification = function (threads) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.sendThreadResponse)(threads, 'This reimbursement request has been submitted to sabo!')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendSubmittedToSaboNotification = sendSubmittedToSaboNotification;
var sendSlackDesignReviewConfirmNotification = function (slackId, designReviewId, designReviewName) { return __awaiter(void 0, void 0, void 0, function () {
    var isProduction, msg, fullLink, linkButtonText, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isProduction = process.env.NODE_ENV === 'production';
                if (!isProduction)
                    return [2 /*return*/]; // don't send msgs unless in prod
                msg = "You have been invited to the ".concat(designReviewName, " Design Review!");
                fullLink = isProduction
                    ? "https://finishlinebyner.com/settings/preferences?drId=".concat(designReviewId)
                    : "http://localhost:3000/settings/preferences?drId=".concat(designReviewId);
                linkButtonText = 'Confirm Availability';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, slack_1.sendMessage)(slackId, msg, fullLink, linkButtonText)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                if (error_3 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(error_3.message));
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendSlackDesignReviewConfirmNotification = sendSlackDesignReviewConfirmNotification;
/**
 * Sends slack notifications to teams for new CRs and returns the messages sent in slack
 *
 * @param team the teams of the cr to notify
 * @param message the message to send to the teams
 * @param crId the cr id
 * @param identifier the cr identifier
 * @returns the channelId and timestamp of the messages sent in slack
 */
var sendSlackChangeRequestNotification = function (team, message, crId, identifier) { return __awaiter(void 0, void 0, void 0, function () {
    var msgs, fullMsg, fullLink, btnText, notification;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/, []]; // don't send msgs unless in prod
                msgs = [];
                fullMsg = ":tada: New Change Request! :tada: ".concat(message);
                fullLink = "https://finishlinebyner.com/cr/".concat(crId);
                btnText = "View CR #".concat(identifier);
                return [4 /*yield*/, (0, slack_1.sendMessage)(team.slackId, fullMsg, fullLink, btnText)];
            case 1:
                notification = _a.sent();
                if (notification)
                    msgs.push(notification);
                return [2 /*return*/, msgs];
        }
    });
}); };
exports.sendSlackChangeRequestNotification = sendSlackChangeRequestNotification;
var sendAndGetSlackCRNotifications = function (teams, changeRequest, submitter, wbsElement, projectWbsName, category, accoundCode) { return __awaiter(void 0, void 0, void 0, function () {
    var notifications, message, completion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                notifications = [];
                message = '';
                switch (changeRequest.type) {
                    case 'ACTIVATION':
                        message = "".concat(submitter.firstName, " ").concat(submitter.lastName, " is activating ").concat(wbsElement === null || wbsElement === void 0 ? void 0 : wbsElement.name, " in ").concat(projectWbsName);
                        break;
                    case 'STAGE_GATE':
                        message = "".concat(submitter.firstName, " ").concat(submitter.lastName, " is stage gating ").concat(wbsElement === null || wbsElement === void 0 ? void 0 : wbsElement.name, " in ").concat(projectWbsName);
                        break;
                    case 'BUDGET':
                        message = "".concat(submitter.firstName, " ").concat(submitter.lastName, " wants to change the budget of ").concat(category ? category.name : accoundCode === null || accoundCode === void 0 ? void 0 : accoundCode.name);
                        break;
                    default:
                        message = "".concat(changeRequest.type, " CR submitted by ").concat(submitter.firstName, " ").concat(submitter.lastName, " for the ").concat(projectWbsName, " project");
                }
                completion = teams.map(function (team) { return __awaiter(void 0, void 0, void 0, function () {
                    var sentNotifications;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, exports.sendSlackChangeRequestNotification)(team, message, changeRequest.crId, changeRequest.identifier)];
                            case 1:
                                sentNotifications = _a.sent();
                                if (sentNotifications)
                                    notifications.push.apply(notifications, sentNotifications);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(completion)];
            case 1:
                _a.sent();
                return [2 /*return*/, notifications];
        }
    });
}); };
exports.sendAndGetSlackCRNotifications = sendAndGetSlackCRNotifications;
var sendSlackDesignReviewNotification = function (team, message) { return __awaiter(void 0, void 0, void 0, function () {
    var msgs, fullMsg, fullLink, btnText, notification;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/, []]; // don't send msgs unless in prod
                msgs = [];
                fullMsg = "".concat(message);
                fullLink = "https://finishlinebyner.com/design-review-calendar";
                btnText = "View Calendar";
                return [4 /*yield*/, (0, slack_1.sendMessage)(team.slackId, fullMsg, fullLink, btnText)];
            case 1:
                notification = _a.sent();
                if (notification)
                    msgs.push(notification);
                return [2 /*return*/, msgs];
        }
    });
}); };
exports.sendSlackDesignReviewNotification = sendSlackDesignReviewNotification;
var sendSlackDRNotifications = function (teams, designReview, submitter, workPackageName) { return __awaiter(void 0, void 0, void 0, function () {
    var notifications, message, completion, promises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                notifications = [];
                message = ":spiral_calendar_pad: Design Review for *".concat(workPackageName, "* is being scheduled by ").concat(submitter.firstName, " ").concat(submitter.lastName);
                completion = teams.map(function (team) { return __awaiter(void 0, void 0, void 0, function () {
                    var sentNotifications;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, exports.sendSlackDesignReviewNotification)(team, message)];
                            case 1:
                                sentNotifications = _a.sent();
                                if (sentNotifications)
                                    notifications.push.apply(notifications, sentNotifications);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(completion)];
            case 1:
                _a.sent();
                promises = notifications.map(function (notification) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.message_Info.create({
                                    data: {
                                        designReviewId: designReview.designReviewId,
                                        channelId: notification.channelId,
                                        timestamp: notification.ts
                                    },
                                    include: {
                                        designReview: true
                                    }
                                })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                _a.sent();
                return [2 /*return*/, notifications];
        }
    });
}); };
exports.sendSlackDRNotifications = sendSlackDRNotifications;
var sendDRUserConfirmationToThread = function (threads, submitter) { return __awaiter(void 0, void 0, void 0, function () {
    var slackPing, fullMsg, msgs, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                slackPing = (0, notifications_utils_1.userToSlackPing)(submitter);
                fullMsg = "".concat(slackPing, " confirmed their availability!");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!(threads && threads.length !== 0)) return [3 /*break*/, 3];
                msgs = threads.map(function (thread) { return (0, slack_1.replyToMessageInThread)(thread.channelId, thread.timestamp, fullMsg); });
                return [4 /*yield*/, Promise.all(msgs)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                if (err_2 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(err_2.message));
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.sendDRUserConfirmationToThread = sendDRUserConfirmationToThread;
var sendDRConfirmationToThread = function (threads, submitter) { return __awaiter(void 0, void 0, void 0, function () {
    var slackPing, fullMsg, msgs, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                slackPing = (0, notifications_utils_1.userToSlackPing)(submitter);
                fullMsg = "".concat(slackPing, " All of the required attendees have confirmed their availability!");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!(threads && threads.length !== 0)) return [3 /*break*/, 3];
                msgs = threads.map(function (thread) { return (0, slack_1.replyToMessageInThread)(thread.channelId, thread.timestamp, fullMsg); });
                return [4 /*yield*/, Promise.all(msgs)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                if (err_3 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(err_3.message));
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.sendDRConfirmationToThread = sendDRConfirmationToThread;
var sendDRScheduledSlackNotif = function (threads, designReview) { return __awaiter(void 0, void 0, void 0, function () {
    var drName, dateScheduled, drTime, drSubmitter, zoomLink, location, msg, docLink, threadMsg, msgs, threadMsgs, reactions, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                drName = designReview.wbsElement.name;
                dateScheduled = designReview.dateScheduled;
                drTime = "".concat((0, design_reviews_utils_1.addHours)(dateScheduled, 12).toLocaleDateString(), " at ").concat((0, shared_1.meetingStartTimePipe)(designReview.meetingTimes));
                drSubmitter = "".concat(designReview.userCreated.firstName, " ").concat(designReview.userCreated.lastName);
                zoomLink = designReview.isOnline && designReview.zoomLink && "on <".concat(designReview.zoomLink, "|Zoom>");
                location = zoomLink && designReview.isInPerson
                    ? "in ".concat(designReview.location, " and ").concat(zoomLink)
                    : designReview.isInPerson
                        ? "in ".concat(designReview.location)
                        : zoomLink;
                msg = ":spiral_calendar_pad: Design Review for *".concat(drName, "* has been scheduled for *").concat(drTime, "* ").concat(location, " by ").concat(drSubmitter);
                docLink = designReview.docTemplateLink ? "<".concat(designReview.docTemplateLink, "|Doc Link>") : '';
                threadMsg = "The Design Review has been Scheduled! \n" + docLink;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                if (!(threads && threads.length !== 0)) return [3 /*break*/, 5];
                msgs = threads.map(function (thread) { return (0, slack_1.editMessage)(thread.channelId, thread.timestamp, msg); });
                return [4 /*yield*/, Promise.all(msgs)];
            case 2:
                _a.sent();
                threadMsgs = threads.map(function (thread) { return (0, slack_1.replyToMessageInThread)(thread.channelId, thread.timestamp, threadMsg); });
                return [4 /*yield*/, Promise.all(threadMsgs)];
            case 3:
                _a.sent();
                reactions = threads.map(function (thread) { return (0, slack_1.reactToMessage)(thread.channelId, thread.timestamp, 'calendar'); });
                return [4 /*yield*/, Promise.all(reactions)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                err_4 = _a.sent();
                if (err_4 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(err_4.message));
                }
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.sendDRScheduledSlackNotif = sendDRScheduledSlackNotif;
var sendSlackCRReviewedNotification = function (slackId, crId, identifier, comments) { return __awaiter(void 0, void 0, void 0, function () {
    var msgs, fullMsg, fullLink, btnText, notification;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                msgs = [];
                fullMsg = ":tada: Your Change Request was just reviewed!".concat(comments ? "\n Comments: ".concat(comments) : '', "\nClick the link to view! :tada:");
                fullLink = "https://finishlinebyner.com/cr/".concat(crId);
                btnText = "View CR#".concat(identifier);
                return [4 /*yield*/, (0, slack_1.sendMessage)(slackId, fullMsg, fullLink, btnText)];
            case 1:
                notification = _a.sent();
                if (notification)
                    msgs.push(notification);
                return [2 /*return*/, Promise.all(msgs)];
        }
    });
}); };
exports.sendSlackCRReviewedNotification = sendSlackCRReviewedNotification;
/**
 * Replies and reacts to slack messages with the new change request status
 *
 * @param threads the threads of cr slack notifications to reply/react to
 * @param crId the cr id
 * @param identifier the cr identifier
 * @param approved is the cr approved
 */
var sendSlackCRStatusToThread = function (threads, crId, identifier, approved) { return __awaiter(void 0, void 0, void 0, function () {
    var fullMsg, fullLink, btnText, msgs, reactions, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                fullMsg = "This Change Request was ".concat(approved ? 'approved! :tada:' : 'denied.', " Click the link to view.");
                fullLink = "https://finishlinebyner.com/cr/".concat(crId);
                btnText = "View CR#".concat(identifier);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!(threads && threads.length !== 0)) return [3 /*break*/, 3];
                msgs = threads.map(function (thread) {
                    return (0, slack_1.replyToMessageInThread)(thread.channelId, thread.timestamp, fullMsg, fullLink, btnText);
                });
                reactions = threads.map(function (thread) {
                    return (0, slack_1.reactToMessage)(thread.channelId, thread.timestamp, approved ? 'white_check_mark' : 'x');
                });
                return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], msgs, true), reactions, true))];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                err_5 = _a.sent();
                if (err_5 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to send slack notification: ".concat(err_5.message));
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.sendSlackCRStatusToThread = sendSlackCRStatusToThread;
/**
 * Adds the relevant slack notifications for a change request to the change request
 *
 * @param crId the change request to add the slack threads to
 * @param notifications the slack threads to add to the change request
 */
var addSlackThreadsToChangeRequest = function (crId, threads) { return __awaiter(void 0, void 0, void 0, function () {
    var promises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                promises = threads.map(function (notification) {
                    return prisma_1.default.message_Info.create({
                        data: {
                            changeRequestId: crId,
                            channelId: notification.channelId,
                            timestamp: notification.ts
                        },
                        include: {
                            changeRequest: true
                        }
                    });
                });
                return [4 /*yield*/, Promise.all(promises)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.addSlackThreadsToChangeRequest = addSlackThreadsToChangeRequest;
/**
 * Converts a SlackRichTextBlock into a string representation for an announcement.
 * @param block the block of information from slack
 * @returns the string that will be combined with other block's strings to create the announcement
 */
var blockToString = function (block) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, channelName, userName;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _a = block.type;
                switch (_a) {
                    case 'broadcast': return [3 /*break*/, 1];
                    case 'color': return [3 /*break*/, 2];
                    case 'channel': return [3 /*break*/, 3];
                    case 'date': return [3 /*break*/, 5];
                    case 'emoji': return [3 /*break*/, 6];
                    case 'link': return [3 /*break*/, 7];
                    case 'text': return [3 /*break*/, 8];
                    case 'user': return [3 /*break*/, 9];
                    case 'usergroup': return [3 /*break*/, 11];
                }
                return [3 /*break*/, 12];
            case 1: return [2 /*return*/, '@' + block.range];
            case 2: return [2 /*return*/, (_b = block.value) !== null && _b !== void 0 ? _b : ''];
            case 3: return [4 /*yield*/, (0, slack_1.getChannelName)((_c = block.channel_id) !== null && _c !== void 0 ? _c : '')];
            case 4:
                channelName = (_d = (_k.sent())) !== null && _d !== void 0 ? _d : "ISSUE PARSING CHANNEL:".concat(block.channel_id);
                return [2 /*return*/, '#' + channelName];
            case 5: return [2 /*return*/, new Date((_e = block.timestamp) !== null && _e !== void 0 ? _e : 0).toISOString()];
            case 6:
                //if the emoji is a unicode emoji, convert the unicode to a string,
                //if it is a slack emoji just use the name of the emoji
                if (block.unicode) {
                    return [2 /*return*/, String.fromCodePoint(parseInt(block.unicode, 16))];
                }
                return [2 /*return*/, 'emoji:' + block.name];
            case 7:
                if (block.text) {
                    return [2 /*return*/, "".concat(block.text, ":(").concat(block.url, ")")];
                }
                return [2 /*return*/, (_f = block.url) !== null && _f !== void 0 ? _f : ''];
            case 8: return [2 /*return*/, (_g = block.text) !== null && _g !== void 0 ? _g : ''];
            case 9: return [4 /*yield*/, (0, slack_1.getUserName)((_h = block.user_id) !== null && _h !== void 0 ? _h : '')];
            case 10:
                userName = (_j = (_k.sent())) !== null && _j !== void 0 ? _j : "Unknown User:".concat(block.user_id);
                return [2 /*return*/, '@' + userName];
            case 11: return [2 /*return*/, "usergroup:".concat(block.usergroup_id)];
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.blockToString = blockToString;
/**
 * Gets the users notified in a specific SlackRichTextBlock.
 * @param block the block that may contain mentioned user/users
 * @param orgainzationId the id of the organization corresponding to this slack channel
 * @param channelId the id of the channel that the block is being sent in
 * @returns an array of prisma user ids of users to be notified
 */
var blockToMentionedUsers = function (block, organizationId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, usersInOrg, slackIds, prismaIds, prismaId;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = block.type;
                switch (_a) {
                    case 'broadcast': return [3 /*break*/, 1];
                    case 'user': return [3 /*break*/, 8];
                }
                return [3 /*break*/, 10];
            case 1:
                _b = block.range;
                switch (_b) {
                    case 'everyone': return [3 /*break*/, 2];
                    case 'channel': return [3 /*break*/, 4];
                    case 'here': return [3 /*break*/, 4];
                }
                return [3 /*break*/, 7];
            case 2: return [4 /*yield*/, users_services_1.default.getAllUsers(organizationId)];
            case 3:
                usersInOrg = _d.sent();
                return [2 /*return*/, usersInOrg.map(function (user) { return user.userId; })];
            case 4: return [4 /*yield*/, (0, slack_1.getUsersInChannel)(channelId)];
            case 5:
                slackIds = _d.sent();
                return [4 /*yield*/, Promise.all(slackIds.map(exports.getUserIdFromSlackId))];
            case 6:
                prismaIds = _d.sent();
                return [2 /*return*/, prismaIds.filter(function (id) { return id !== undefined; })];
            case 7: return [2 /*return*/, []];
            case 8: return [4 /*yield*/, (0, exports.getUserIdFromSlackId)((_c = block.user_id) !== null && _c !== void 0 ? _c : '')];
            case 9:
                prismaId = _d.sent();
                return [2 /*return*/, prismaId ? [prismaId] : []];
            case 10: 
            //only broadcasts and specific user mentions add recievers to announcements
            return [2 /*return*/, []];
        }
    });
}); };
exports.blockToMentionedUsers = blockToMentionedUsers;
/**
 * given a slack id, produce the user id of the corresponding user
 * @param slackId the slack id in the settings of the user
 * @returns the user id, or undefined if no users were found
 */
var getUserIdFromSlackId = function (slackId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findFirst({
                    where: {
                        userSettings: {
                            slackId: slackId
                        }
                    }
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, undefined];
                return [2 /*return*/, user.userId];
        }
    });
}); };
exports.getUserIdFromSlackId = getUserIdFromSlackId;
var sendSlackPartReviewRequestNotif = function (slackId, projectName, partName, partLink) { return __awaiter(void 0, void 0, void 0, function () {
    var msg, link, linkButtonText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                msg = "Your review has been requested on part: ".concat(partName, " for project: ").concat(projectName);
                link = "https://finishlinebyner.com".concat(partLink);
                linkButtonText = 'View Part';
                return [4 /*yield*/, (0, slack_1.sendMessage)(slackId, msg, link, linkButtonText)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendSlackPartReviewRequestNotif = sendSlackPartReviewRequestNotif;
var sendSlackPartAssignmentNotif = function (slackId, projectName, partName, partLink) { return __awaiter(void 0, void 0, void 0, function () {
    var msg, link, linkButtonText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                msg = "You have been assigned to part: ".concat(partName, " on project: ").concat(projectName);
                link = "https://finishlinebyner.com".concat(partLink);
                linkButtonText = 'View Part';
                return [4 /*yield*/, (0, slack_1.sendMessage)(slackId, msg, link, linkButtonText)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendSlackPartAssignmentNotif = sendSlackPartAssignmentNotif;
/**
 * Sends a notification to the assignee of a sponsor task
 * @param assignee the user to notify
 * @param sponsorTask the sponsor task to notify about
 * @param sponsor the name of the sponsor
 */
var notifySponsorTaskAssignee = function (assignee, sponsorTask, sponsor) { return __awaiter(void 0, void 0, void 0, function () {
    var msg, link, linkButtonText;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/]; // don't send msgs unless in prod
                if (!((_a = assignee.userSettings) === null || _a === void 0 ? void 0 : _a.slackId))
                    return [2 /*return*/];
                msg = "You have been assigned a task for ".concat(sponsor, ": ").concat(sponsorTask.notes);
                link = "https://finishlinebyner.com/finance/companies/sponsors";
                linkButtonText = "View Tasks for ".concat(sponsor);
                return [4 /*yield*/, (0, slack_1.sendMessage)((_b = assignee.userSettings) === null || _b === void 0 ? void 0 : _b.slackId, msg, link, linkButtonText)];
            case 1:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.notifySponsorTaskAssignee = notifySponsorTaskAssignee;

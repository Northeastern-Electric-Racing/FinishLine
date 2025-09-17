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
var prisma_1 = require("../prisma/prisma");
var announcements_query_args_1 = require("../prisma-query-args/announcements.query.args");
var announcements_transformer_1 = require("../transformers/announcements.transformer");
var errors_utils_1 = require("../utils/errors.utils");
var users_utils_1 = require("../utils/users.utils");
var AnnouncementService = /** @class */ (function () {
    function AnnouncementService() {
    }
    /**
     * Creates an announcement that is sent to users
     * this data is populated from slack events
     * @param text slack message text
     * @param usersReceivedIds users to send announcements to
     * @param dateMessageSent date created of slack message
     * @param senderName name of user who sent slack message
     * @param slackEventId id of slack event (provided by slack api)
     * @param slackChannelName name of channel message was sent in
     * @param organizationId id of organization of users
     * @returns the created announcement
     */
    AnnouncementService.createAnnouncement = function (text, usersReceivedIds, dateMessageSent, senderName, slackEventId, slackChannelName, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var usersToSend, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, users_utils_1.getUsers)(usersReceivedIds)];
                    case 1:
                        usersToSend = _a.sent();
                        return [4 /*yield*/, prisma_1.default.announcement.create(__assign({ data: {
                                    text: text,
                                    usersReceived: {
                                        connect: usersToSend.map(function (user) { return ({
                                            userId: user.userId
                                        }); })
                                    },
                                    dateMessageSent: dateMessageSent,
                                    senderName: senderName,
                                    slackEventId: slackEventId,
                                    slackChannelName: slackChannelName,
                                    organizationId: organizationId
                                } }, (0, announcements_query_args_1.getAnnouncementQueryArgs)(organizationId)))];
                    case 2:
                        announcement = _a.sent();
                        return [2 /*return*/, (0, announcements_transformer_1.default)(announcement)];
                }
            });
        });
    };
    AnnouncementService.updateAnnouncement = function (text, usersReceivedIds, senderName, slackEventId, slackChannelName, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var originalAnnouncement, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.announcement.findUnique({
                            where: {
                                slackEventId: slackEventId
                            }
                        })];
                    case 1:
                        originalAnnouncement = _a.sent();
                        if (!originalAnnouncement)
                            throw new errors_utils_1.NotFoundException('Announcement', slackEventId);
                        if (originalAnnouncement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Announcement', slackEventId);
                        if (originalAnnouncement.organizationId !== organizationId)
                            throw new errors_utils_1.HttpException(400, "Announcement is not apart of the current organization");
                        return [4 /*yield*/, prisma_1.default.announcement.update(__assign({ where: { announcementId: originalAnnouncement.announcementId }, data: {
                                    text: text,
                                    usersReceived: {
                                        set: usersReceivedIds.map(function (id) { return ({
                                            userId: id
                                        }); })
                                    },
                                    slackEventId: slackEventId,
                                    senderName: senderName,
                                    slackChannelName: slackChannelName
                                } }, (0, announcements_query_args_1.getAnnouncementQueryArgs)(organizationId)))];
                    case 2:
                        announcement = _a.sent();
                        return [2 /*return*/, (0, announcements_transformer_1.default)(announcement)];
                }
            });
        });
    };
    AnnouncementService.deleteAnnouncement = function (slackEventId, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var originalAnnouncement, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.announcement.findUnique({
                            where: {
                                slackEventId: slackEventId
                            }
                        })];
                    case 1:
                        originalAnnouncement = _a.sent();
                        if (!originalAnnouncement)
                            throw new errors_utils_1.NotFoundException('Announcement', slackEventId);
                        if (originalAnnouncement.dateDeleted)
                            throw new errors_utils_1.DeletedException('Announcement', slackEventId);
                        if (originalAnnouncement.organizationId !== organizationId)
                            throw new errors_utils_1.HttpException(400, "Announcement is not apart of the current organization");
                        return [4 /*yield*/, prisma_1.default.announcement.update(__assign({ where: { slackEventId: slackEventId }, data: {
                                    dateDeleted: new Date(),
                                    usersReceived: {
                                        set: []
                                    }
                                } }, (0, announcements_query_args_1.getAnnouncementQueryArgs)(organizationId)))];
                    case 2:
                        announcement = _a.sent();
                        return [2 /*return*/, (0, announcements_transformer_1.default)(announcement)];
                }
            });
        });
    };
    /**
     * Gets all of a user's unread announcements
     * @param userId id of the current user
     * @param organization the user's orgainzation
     * @returns the unread announcements of the user
     */
    AnnouncementService.getUserUnreadAnnouncements = function (userId, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var unreadAnnouncements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.announcement.findMany(__assign({ where: {
                                dateDeleted: null,
                                usersReceived: {
                                    some: { userId: userId }
                                },
                                organizationId: organizationId
                            } }, (0, announcements_query_args_1.getAnnouncementQueryArgs)(organizationId)))];
                    case 1:
                        unreadAnnouncements = _a.sent();
                        if (!unreadAnnouncements)
                            throw new errors_utils_1.HttpException(404, 'User Unread Announcements Not Found');
                        return [2 /*return*/, unreadAnnouncements.map(announcements_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Removes a announcement from the user's unread announcement
     * @param userId id of the user to remove announcement from
     * @param announcementId id of the announcement to remove
     * @param organization the user's organization
     * @returns the user's updated unread announcement
     */
    AnnouncementService.removeUserAnnouncement = function (userId, announcementId, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedUser, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                            where: { userId: userId }
                        })];
                    case 1:
                        requestedUser = _a.sent();
                        if (!requestedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        return [4 /*yield*/, prisma_1.default.user.update({
                                where: { userId: userId },
                                data: {
                                    unreadAnnouncements: {
                                        disconnect: {
                                            announcementId: announcementId
                                        }
                                    }
                                },
                                include: { unreadAnnouncements: (0, announcements_query_args_1.getAnnouncementQueryArgs)(organizationId) }
                            })];
                    case 2:
                        updatedUser = _a.sent();
                        return [2 /*return*/, updatedUser.unreadAnnouncements.map(announcements_transformer_1.default)];
                }
            });
        });
    };
    return AnnouncementService;
}());
exports.default = AnnouncementService;

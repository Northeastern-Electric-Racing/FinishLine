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
var slack_1 = require("../integrations/slack");
var announcement_services_1 = require("./announcement.services");
var prisma_1 = require("../prisma/prisma");
var slack_utils_1 = require("../utils/slack.utils");
var errors_utils_1 = require("../utils/errors.utils");
var SlackServices = /** @class */ (function () {
    function SlackServices() {
    }
    /**
     * Given a slack event representing a message in a channel,
     * make the appropriate announcement change in prisma.
     * @param event the slack event that will be processed
     * @param organizationId the id of the organization represented by the slack api
     * @returns an annoucement if an announcement was processed and created/modified/deleted
     */
    SlackServices.processMessageSent = function (event, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var slackChannelName, dateCreated, eventMessage, messageText, userIdsToNotify, userName, userWithThatSlackId, _a, richTextBlocks, _i, _b, element, _c, _d, _e, error_1;
            var _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, (0, slack_1.getChannelName)(event.channel)];
                    case 1:
                        slackChannelName = (_f = (_j.sent())) !== null && _f !== void 0 ? _f : "Unknown_Channel:".concat(event.channel);
                        dateCreated = new Date(1000 * Number(event.event_ts));
                        if (event.subtype) {
                            switch (event.subtype) {
                                case 'message_deleted':
                                    //delete the message using the client_msg_id
                                    eventMessage = event.previous_message;
                                    return [2 /*return*/, announcement_services_1.default.deleteAnnouncement(eventMessage.client_msg_id, organizationId)];
                                case 'message_changed':
                                    eventMessage = event.message;
                                    break;
                                default:
                                    //other events that do not effect announcements
                                    return [2 /*return*/];
                            }
                        }
                        else {
                            eventMessage = event;
                        }
                        messageText = '';
                        userIdsToNotify = [];
                        return [4 /*yield*/, (0, slack_1.getUserName)(eventMessage.user)];
                    case 2:
                        userName = (_g = (_j.sent())) !== null && _g !== void 0 ? _g : '';
                        if (!!userName) return [3 /*break*/, 6];
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, prisma_1.default.user.findFirst({ where: { userSettings: { slackId: eventMessage.user } } })];
                    case 4:
                        userWithThatSlackId = _j.sent();
                        userName = "".concat(userWithThatSlackId === null || userWithThatSlackId === void 0 ? void 0 : userWithThatSlackId.firstName, " ").concat(userWithThatSlackId === null || userWithThatSlackId === void 0 ? void 0 : userWithThatSlackId.lastName);
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _j.sent();
                        userName = 'Unknown_User:' + eventMessage.user;
                        return [3 /*break*/, 6];
                    case 6:
                        richTextBlocks = (_h = eventMessage.blocks) === null || _h === void 0 ? void 0 : _h.filter(function (eventBlock) { return eventBlock.type === 'rich_text'; });
                        if (!(richTextBlocks && richTextBlocks.length > 0 && richTextBlocks[0].elements.length > 0)) return [3 /*break*/, 12];
                        _i = 0, _b = richTextBlocks[0].elements[0].elements;
                        _j.label = 7;
                    case 7:
                        if (!(_i < _b.length)) return [3 /*break*/, 11];
                        element = _b[_i];
                        _c = messageText;
                        return [4 /*yield*/, (0, slack_utils_1.blockToString)(element)];
                    case 8:
                        messageText = _c + _j.sent();
                        _e = (_d = userIdsToNotify).concat;
                        return [4 /*yield*/, (0, slack_utils_1.blockToMentionedUsers)(element, organizationId, event.channel)];
                    case 9:
                        userIdsToNotify = _e.apply(_d, [_j.sent()]);
                        _j.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 7];
                    case 11: return [3 /*break*/, 13];
                    case 12: return [2 /*return*/];
                    case 13:
                        //get rid of duplicates within the users to notify
                        userIdsToNotify = __spreadArray([], new Set(userIdsToNotify), true);
                        //if no users are notified, disregard the message
                        if (userIdsToNotify.length === 0) {
                            return [2 /*return*/];
                        }
                        if (!(event.subtype === 'message_changed')) return [3 /*break*/, 17];
                        _j.label = 14;
                    case 14:
                        _j.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, announcement_services_1.default.updateAnnouncement(messageText, userIdsToNotify, userName, eventMessage.client_msg_id, slackChannelName, organizationId)];
                    case 15: return [2 /*return*/, _j.sent()];
                    case 16:
                        error_1 = _j.sent();
                        //if couldn't find the announcement to edit, create a new one below
                        if (!(error_1 instanceof errors_utils_1.NotFoundException)) {
                            throw error_1;
                        }
                        return [3 /*break*/, 17];
                    case 17: return [4 /*yield*/, announcement_services_1.default.createAnnouncement(messageText, userIdsToNotify, dateCreated, userName, eventMessage.client_msg_id, slackChannelName, organizationId)];
                    case 18: return [2 /*return*/, _j.sent()];
                }
            });
        });
    };
    return SlackServices;
}());
exports.default = SlackServices;

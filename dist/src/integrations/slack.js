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
exports.getWorkspaceId = exports.getUserName = exports.getChannelName = exports.getUsersInChannel = exports.reactToMessage = exports.editMessage = exports.replyToMessageInThread = exports.sendMessage = void 0;
var web_api_1 = require("@slack/web-api");
var errors_utils_1 = require("../utils/errors.utils");
var slack = new web_api_1.WebClient(process.env.SLACK_BOT_TOKEN);
/**
 * Send a slack message
 * @param slackId - the channel id of the channel to send to or the slack id of the person you want to DM
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 * @returns the channel id and timestamp of the created slack message
 */
var sendMessage = function (slackId, message, link, linkButtonText) { return __awaiter(void 0, void 0, void 0, function () {
    var SLACK_BOT_TOKEN, block, response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
                if (!SLACK_BOT_TOKEN)
                    return [2 /*return*/];
                block = generateSlackTextBlock(message, link, linkButtonText);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, slack.chat.postMessage({
                        token: SLACK_BOT_TOKEN,
                        channel: slackId,
                        text: message,
                        blocks: [block],
                        unfurl_links: false
                    })];
            case 2:
                response = _a.sent();
                return [2 /*return*/, response && response.channel && response.ts && { channelId: response.channel, ts: response.ts }];
            case 3:
                error_1 = _a.sent();
                throw new errors_utils_1.HttpException(500, 'Error sending slack message, reason: ' + error_1.data.error);
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendMessage = sendMessage;
/**
 * Sends a slack message as a reply in a thread
 * @param slackId - the channel id of the channel of the message to reply to
 * @param parentTimestamp - the timestamp of the message to reply to in a thread
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
var replyToMessageInThread = function (slackId, parentTimestamp, message, link, linkButtonText) { return __awaiter(void 0, void 0, void 0, function () {
    var SLACK_BOT_TOKEN, block, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
                if (!SLACK_BOT_TOKEN)
                    return [2 /*return*/];
                block = generateSlackTextBlock(message, link, linkButtonText);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, slack.chat.postMessage({
                        token: SLACK_BOT_TOKEN,
                        channel: slackId,
                        thread_ts: parentTimestamp,
                        text: message,
                        blocks: [block]
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                throw new errors_utils_1.HttpException(500, 'Error sending slack reply to thread, reason: ' + error_2.data.error);
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.replyToMessageInThread = replyToMessageInThread;
/**
 * Edits an existing slack message
 * @param slackId - the channel id of the channel of the message to edit
 * @param timestamp - the timestamp of the message to edit
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
var editMessage = function (slackId, timestamp, message, link, linkButtonText) { return __awaiter(void 0, void 0, void 0, function () {
    var SLACK_BOT_TOKEN, block, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
                if (!SLACK_BOT_TOKEN)
                    return [2 /*return*/];
                block = generateSlackTextBlock(message, link, linkButtonText);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, slack.chat.update({
                        token: SLACK_BOT_TOKEN,
                        channel: slackId,
                        ts: timestamp,
                        text: message,
                        blocks: [block]
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                throw new errors_utils_1.HttpException(500, 'Error sending slack reply to thread, reason: ' + error_3.data.error);
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.editMessage = editMessage;
/**
 * Reacts to a slack message
 * @param slackId - the channel id of the channel of the message to reply to
 * @param parentTimestamp - the timestamp of the message to reply to in a thread
 * @param emoji - the emoji to react with
 */
var reactToMessage = function (slackId, parentTimestamp, emoji) { return __awaiter(void 0, void 0, void 0, function () {
    var SLACK_BOT_TOKEN, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
                if (!SLACK_BOT_TOKEN)
                    return [2 /*return*/];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, slack.reactions.add({
                        token: SLACK_BOT_TOKEN,
                        channel: slackId,
                        timestamp: parentTimestamp,
                        name: emoji
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                throw new errors_utils_1.HttpException(500, 'Error reacting to slack message, reason: ' + error_4.data.error);
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.reactToMessage = reactToMessage;
/**
 * Generates a slack text block with message and optional button
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 * @returns the slack text block
 */
var generateSlackTextBlock = function (message, link, linkButtonText) {
    // if link and link button are provided, add the button to the message, otherwise just send the markdown block
    return link && linkButtonText
        ? {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    emoji: true,
                    text: linkButtonText
                },
                url: link
            }
        }
        : {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message
            }
        };
};
/**
 * Given an id of a channel, produces the slack ids of all the users in that channel.
 * @param channelId the id of the channel
 * @returns an array of strings of all the slack ids of the users in the given channel
 */
var getUsersInChannel = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var members, cursor, response, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                members = [];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                _b.label = 2;
            case 2: return [4 /*yield*/, slack.conversations.members({
                    channel: channelId,
                    cursor: cursor,
                    limit: 200
                })];
            case 3:
                response = _b.sent();
                if (response.ok && response.members) {
                    members = members.concat(response.members);
                    cursor = (_a = response.response_metadata) === null || _a === void 0 ? void 0 : _a.next_cursor;
                }
                else {
                    throw new Error("Failed to fetch members: ".concat(response.error));
                }
                _b.label = 4;
            case 4:
                if (cursor) return [3 /*break*/, 2];
                _b.label = 5;
            case 5: return [2 /*return*/, members];
            case 6:
                error_5 = _b.sent();
                return [2 /*return*/, members];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getUsersInChannel = getUsersInChannel;
/**
 * Given a slack channel id, produces the name of the channel
 * @param channelId the id of the slack channel
 * @returns the name of the channel or undefined if it cannot be found
 */
var getChannelName = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channelRes, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, slack.conversations.info({ channel: channelId })];
            case 1:
                channelRes = _b.sent();
                return [2 /*return*/, (_a = channelRes.channel) === null || _a === void 0 ? void 0 : _a.name];
            case 2:
                error_6 = _b.sent();
                return [2 /*return*/, undefined];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getChannelName = getChannelName;
/**
 * Given a slack user id, prood.uces the name of the channel
 * @param userId the id of the slack user
 * @returns the name of the user (real name if no display name), undefined if cannot be found
 */
var getUserName = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var userRes, error_7;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, slack.users.info({ user: userId })];
            case 1:
                userRes = _d.sent();
                return [2 /*return*/, ((_b = (_a = userRes.user) === null || _a === void 0 ? void 0 : _a.profile) === null || _b === void 0 ? void 0 : _b.display_name) || ((_c = userRes.user) === null || _c === void 0 ? void 0 : _c.real_name)];
            case 2:
                error_7 = _d.sent();
                return [2 /*return*/, undefined];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUserName = getUserName;
/**
 * Get the workspace id of the workspace this slack api is registered with
 * @returns the id of the workspace
 */
var getWorkspaceId = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, slack.auth.test()];
            case 1:
                response = _a.sent();
                if (response.ok) {
                    return [2 /*return*/, response.team_id];
                }
                throw new Error(response.error);
            case 2:
                error_8 = _a.sent();
                throw new errors_utils_1.HttpException(500, 'Error getting slack workspace id: ' + error_8.data.error);
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getWorkspaceId = getWorkspaceId;
exports.default = slack;

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
exports.PopUpService = void 0;
var pop_up_query_args_1 = require("../prisma-query-args/pop-up.query-args");
var prisma_1 = require("../prisma/prisma");
var pop_up_transformer_1 = require("../transformers/pop-up.transformer");
var errors_utils_1 = require("../utils/errors.utils");
var PopUpService = /** @class */ (function () {
    function PopUpService() {
    }
    /**
     * Gets all of a user's unread pop up
     * @param userId id of user to get unread pop up from
     * @param organization the user's orgainzation
     * @returns the unread pop up of the user
     */
    PopUpService.getUserUnreadPopUps = function (userId, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var unreadPopUps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.popUp.findMany(__assign({ where: {
                                usersReceived: {
                                    some: { userId: userId }
                                },
                                organizationId: organizationId
                            } }, (0, pop_up_query_args_1.getPopUpQueryArgs)(organizationId)))];
                    case 1:
                        unreadPopUps = _a.sent();
                        if (!unreadPopUps)
                            throw new errors_utils_1.HttpException(404, 'User Unread Notifications Not Found');
                        return [2 /*return*/, unreadPopUps.map(pop_up_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Removes a pop up from the user's unread pop up
     * @param userId id of the current user
     * @param popUpId id of the pop up to remove
     * @param organization the user's organization
     * @returns the user's updated unread pop up
     */
    PopUpService.removeUserPopUp = function (userId, popUpId, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var popUp, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.popUp.findUnique({
                            where: { popUpId: popUpId }
                        })];
                    case 1:
                        popUp = _a.sent();
                        if (!popUp)
                            throw new errors_utils_1.NotFoundException('Pop Up', popUpId);
                        return [4 /*yield*/, prisma_1.default.user.update({
                                where: { userId: userId },
                                data: {
                                    unreadPopUps: {
                                        disconnect: {
                                            popUpId: popUpId
                                        }
                                    }
                                },
                                include: { unreadPopUps: (0, pop_up_query_args_1.getPopUpQueryArgs)(organizationId) }
                            })];
                    case 2:
                        updatedUser = _a.sent();
                        if (!updatedUser)
                            throw new errors_utils_1.HttpException(404, "Failed to remove notication: ".concat(popUpId));
                        return [2 /*return*/, updatedUser.unreadPopUps.map(pop_up_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Creates and sends a pop up to all users with the given userIds
     * @param text writing in the pop up
     * @param iconName icon that appears in the pop up
     * @param userIds ids of users to send the pop up to
     * @param organizationId
     * @param eventLink link the pop up will go to when clicked
     * @returns the created notification
     */
    PopUpService.sendPopUpToUsers = function (text, iconName, userIds, organizationId, eventLink) {
        return __awaiter(this, void 0, void 0, function () {
            var createdPopUp, popUpPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.popUp.create(__assign({ data: {
                                text: text,
                                iconName: iconName,
                                eventLink: eventLink,
                                organizationId: organizationId
                            } }, (0, pop_up_query_args_1.getPopUpQueryArgs)(organizationId)))];
                    case 1:
                        createdPopUp = _a.sent();
                        if (!createdPopUp)
                            throw new errors_utils_1.HttpException(500, 'Failed to create notification');
                        popUpPromises = userIds.map(function (userId) { return __awaiter(_this, void 0, void 0, function () {
                            var requestedUser;
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
                                                where: { userId: requestedUser.userId },
                                                data: {
                                                    unreadPopUps: {
                                                        connect: { popUpId: createdPopUp.popUpId }
                                                    }
                                                }
                                            })];
                                    case 2: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(popUpPromises)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, (0, pop_up_transformer_1.default)(createdPopUp)];
                }
            });
        });
    };
    return PopUpService;
}());
exports.PopUpService = PopUpService;

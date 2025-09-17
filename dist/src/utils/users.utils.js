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
exports.updateUserAvailability = exports.areUsersinList = exports.userHasPermission = exports.userHasPermissionNew = exports.getUsersWithSettings = exports.getPrismaQueryUserIds = exports.getUsers = exports.getUserRole = exports.getUserSlackId = exports.getUserFullName = void 0;
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
var shared_1 = require("shared");
var getUserFullName = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!userId)
                    return [2 /*return*/, 'no one'];
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId } })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, 'no one'];
                return [2 /*return*/, "".concat(user.firstName, " ").concat(user.lastName)];
        }
    });
}); };
exports.getUserFullName = getUserFullName;
var getUserSlackId = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!userId)
                    return [2 /*return*/, undefined];
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId }, include: { userSettings: true } })];
            case 1:
                user = _b.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                return [2 /*return*/, (_a = user.userSettings) === null || _a === void 0 ? void 0 : _a.slackId];
        }
    });
}); };
exports.getUserSlackId = getUserSlackId;
var getUserRole = function (userId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId }, include: { roles: true } })];
            case 1:
                user = _c.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                return [2 /*return*/, (_b = (_a = user.roles.find(function (role) { return role.organizationId === organizationId; })) === null || _a === void 0 ? void 0 : _a.roleType) !== null && _b !== void 0 ? _b : shared_1.RoleEnum.GUEST];
        }
    });
}); };
exports.getUserRole = getUserRole;
/**
 * Produce a array of User with given userIds
 * @param userIds array of userIds as an array of integers
 * @returns array of User
 * @throws if any user does not exist
 */
var getUsers = function (userIds) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findMany({
                    where: { userId: { in: userIds } }
                })];
            case 1:
                users = _a.sent();
                validateFoundUsers(users, userIds);
                return [2 /*return*/, users];
        }
    });
}); };
exports.getUsers = getUsers;
/**
 * Produce a array of primsa formated userIds, given the array of User
 * @param userIds the userIds to get as users
 * @returns userIds in prisma format
 */
var getPrismaQueryUserIds = function (users) {
    var userIds = users.map(function (user) {
        return {
            userId: user.userId
        };
    });
    return userIds;
};
exports.getPrismaQueryUserIds = getPrismaQueryUserIds;
/**
 * Gets the users for the given Ids with their user settings
 * @param userIds the userIds to get as users
 * @returns the found users with their user settings
 * @throws if any user does not exist
 */
var getUsersWithSettings = function (userIds) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findMany({
                    where: { userId: { in: userIds } },
                    include: {
                        userSettings: true
                    }
                })];
            case 1:
                users = _a.sent();
                validateFoundUsers(users, userIds);
                return [2 /*return*/, users];
        }
    });
}); };
exports.getUsersWithSettings = getUsersWithSettings;
/**
 * Validates that the users found in the database match the given userIds
 * @param users the users found in the database
 * @param userIds the requested usersIds to retrieve
 */
var validateFoundUsers = function (users, userIds) {
    if (users.length !== userIds.length) {
        var prismaUserIds_1 = users.map(function (user) { return user.userId; });
        var missingUserIds = userIds.filter(function (id) { return !prismaUserIds_1.includes(id); });
        throw new errors_utils_1.HttpException(404, "User(s) with the following ids not found: ".concat(missingUserIds.join(', ')));
    }
};
var getUserWithPermissions = function (userId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                    where: { userId: userId },
                    include: {
                        roles: {
                            where: {
                                organizationId: organizationId
                            }
                        }
                    }
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                if (user.roles.length === 0)
                    throw new errors_utils_1.InvalidOrganizationException('User');
                return [2 /*return*/, __assign(__assign({}, user), { permissions: user.additionalPermissions.concat((0, shared_1.getPermissionsForRoleType)(user.roles[0].roleType)) })];
        }
    });
}); };
var userHasPermissionNew = function (userId, organizationId, permissionsToCheckFor) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getUserWithPermissions(userId, organizationId)];
            case 1:
                user = _a.sent();
                return [2 /*return*/, (0, shared_1.isSubset)(permissionsToCheckFor, user.permissions)];
        }
    });
}); };
exports.userHasPermissionNew = userHasPermissionNew;
var userHasPermission = function (userId, organizationId, permissionCheck) { return __awaiter(void 0, void 0, void 0, function () {
    var user, organization;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId }, include: { roles: true } })];
            case 1:
                user = _b.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                return [4 /*yield*/, prisma_1.default.organization.findUnique({ where: { organizationId: organizationId } })];
            case 2:
                organization = _b.sent();
                if (!organization)
                    throw new errors_utils_1.NotFoundException('Organization', organizationId);
                return [2 /*return*/, permissionCheck((_a = user.roles.find(function (role) { return role.organizationId === organizationId; })) === null || _a === void 0 ? void 0 : _a.roleType)];
        }
    });
}); };
exports.userHasPermission = userHasPermission;
var areUsersinList = function (users, userList) {
    return users.every(function (user) { return userList.some(function (u) { return u.userId === user.userId; }); });
};
exports.areUsersinList = areUsersinList;
var updateUserAvailability = function (availabilities, userSettings, submitter) { return __awaiter(void 0, void 0, void 0, function () {
    var _loop_1, _i, availabilities_1, availability;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _loop_1 = function (availability) {
                    var availabilityAlreadyExists;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (availability.availability.some(function (time) { return time < 0 || time > 11; })) {
                                    throw new errors_utils_1.HttpException(400, 'Availability times have to be in range 0-11');
                                }
                                availabilityAlreadyExists = userSettings.availabilities.filter(function (existingAvailability) {
                                    return (0, shared_1.isSameDay)(existingAvailability.dateSet, availability.dateSet);
                                })[0];
                                if (!availabilityAlreadyExists) return [3 /*break*/, 2];
                                return [4 /*yield*/, prisma_1.default.availability.update({
                                        where: { availabilityId: availabilityAlreadyExists.availabilityId },
                                        data: {
                                            availability: availability.availability,
                                            dateSet: availability.dateSet
                                        }
                                    })];
                            case 1:
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, prisma_1.default.availability.create({
                                    data: {
                                        availability: availability.availability,
                                        dateSet: availability.dateSet,
                                        scheduleSettings: {
                                            connect: {
                                                userId: submitter.userId
                                            }
                                        }
                                    }
                                })];
                            case 3:
                                _b.sent();
                                _b.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, availabilities_1 = availabilities;
                _a.label = 1;
            case 1:
                if (!(_i < availabilities_1.length)) return [3 /*break*/, 4];
                availability = availabilities_1[_i];
                return [5 /*yield**/, _loop_1(availability)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateUserAvailability = updateUserAvailability;

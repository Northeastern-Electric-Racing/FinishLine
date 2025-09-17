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
var oauth2client_1 = require("google-auth-library/build/src/auth/oauth2client");
var shared_1 = require("shared");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("../utils/errors.utils");
var auth_utils_1 = require("../utils/auth.utils");
var projects_transformer_1 = require("../transformers/projects.transformer");
var projects_query_args_1 = require("../prisma-query-args/projects.query-args");
var user_secure_settings_transformer_1 = require("../transformers/user-secure-settings.transformer");
var user_schedule_settings_transformer_1 = require("../transformers/user-schedule-settings.transformer");
var user_transformer_1 = require("../transformers/user.transformer");
var users_utils_1 = require("../utils/users.utils");
var user_query_args_1 = require("../prisma-query-args/user.query-args");
var auth_user_query_args_1 = require("../prisma-query-args/auth-user.query-args");
var auth_user_transformer_1 = require("../transformers/auth-user.transformer");
var tasks_query_args_1 = require("../prisma-query-args/tasks.query-args");
var tasks_transformer_1 = require("../transformers/tasks.transformer");
var reimbursement_requests_utils_1 = require("../utils/reimbursement-requests.utils");
var UsersService = /** @class */ (function () {
    function UsersService() {
    }
    /**
     * Gets all of the users from the database
     * @param organizationId the id of the organization to get the users for
     * @returns a list of all the users
     */
    UsersService.getAllUsers = function (organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var users_1, organization, users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!organizationId) return [3 /*break*/, 2];
                        return [4 /*yield*/, prisma_1.default.user.findMany({
                                include: {
                                    roles: true,
                                    userSettings: true,
                                    drScheduleSettings: (0, user_query_args_1.getUserScheduleSettingsQueryArgs)(),
                                    organizations: true
                                }
                            })];
                    case 1:
                        users_1 = _a.sent();
                        return [2 /*return*/, users_1.map(user_transformer_1.userWithScheduleSettingsTransformer)];
                    case 2: return [4 /*yield*/, prisma_1.default.organization.findUnique({
                            where: { organizationId: organizationId },
                            include: {
                                users: (0, user_query_args_1.getUserWithSettingsQueryArgs)(organizationId)
                            }
                        })];
                    case 3:
                        organization = _a.sent();
                        if (!organization)
                            throw new errors_utils_1.NotFoundException('Organization', organizationId);
                        users = organization.users;
                        users.sort(function (a, b) { return a.firstName.localeCompare(b.firstName); });
                        return [2 /*return*/, users.map(user_transformer_1.userWithScheduleSettingsTransformer)];
                }
            });
        });
    };
    UsersService.getCurrentUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var userWithOrgs, organization, authUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: user.userId }, include: { organizations: true } })];
                    case 1:
                        userWithOrgs = _a.sent();
                        if (!userWithOrgs) {
                            throw new errors_utils_1.NotFoundException('User', user.userId);
                        }
                        organization = userWithOrgs.organizations[0];
                        if (!organization)
                            throw new errors_utils_1.HttpException(500, 'User is not apart of any organizations');
                        return [4 /*yield*/, prisma_1.default.user.findUnique(__assign({ where: { userId: user.userId } }, (0, auth_user_query_args_1.getAuthUserQueryArgs)(organization.organizationId)))];
                    case 2:
                        authUser = _a.sent();
                        if (!authUser) {
                            throw new errors_utils_1.NotFoundException('User', user.userId);
                        }
                        return [2 /*return*/, (0, auth_user_transformer_1.default)(authUser, organization.organizationId)];
                }
            });
        });
    };
    /**
     * Gets the user with the specified id
     * @param userId the id of the user that's returned
     * @param organizationId the id of the organization the current user is in
     * @returns the user with the specified id
     * @throws if the given user doesn't exist
     */
    UsersService.getSingleUser = function (userId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique(__assign({ where: { userId: userId } }, (0, user_query_args_1.getUserQueryArgs)(organization.organizationId)))];
                    case 1:
                        requestedUser = _a.sent();
                        if (!requestedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        if (!requestedUser.organizations.map(function (org) { return org.organizationId; }).includes(organization.organizationId))
                            throw new errors_utils_1.AccessDeniedException('User not in organization');
                        return [2 /*return*/, (0, user_transformer_1.userTransformer)(requestedUser)];
                }
            });
        });
    };
    /**
     * Gets the user settings for a specified user
     * @param userId the id of the user who's settings are requested
     * @returns the user settings object
     * @throws if the given user doesn't exist, or the given user's settings don't exist
     */
    UsersService.getUserSettings = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedUser, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId } })];
                    case 1:
                        requestedUser = _a.sent();
                        if (!requestedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        return [4 /*yield*/, prisma_1.default.user_Settings.upsert({
                                where: { userId: userId },
                                update: {},
                                create: { userId: userId }
                            })];
                    case 2:
                        settings = _a.sent();
                        return [2 /*return*/, settings];
                }
            });
        });
    };
    /**
     * Gets the user secure settings for the current usr
     * @param user the id of the user who's secure settings are requested
     * @returns the user's secure settings object
     */
    UsersService.getCurrentUserSecureSettings = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var secureSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user_Secure_Settings.findUnique({
                            where: { userId: user.userId }
                        })];
                    case 1:
                        secureSettings = _a.sent();
                        if (!secureSettings)
                            throw new errors_utils_1.HttpException(404, 'User Secure Settings Not Found');
                        return [2 /*return*/, (0, user_secure_settings_transformer_1.default)(secureSettings)];
                }
            });
        });
    };
    /**
     * Get the given user's favorite projects for the current organization.
     * @param userId the user to get the projects for
     * @param organizationId the id of the organization the user is in
     * @returns the user's favorite projects
     */
    UsersService.getUsersFavoriteProjects = function (userId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedUser, projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { userId: userId } })];
                    case 1:
                        requestedUser = _a.sent();
                        if (!requestedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        return [4 /*yield*/, prisma_1.default.project.findMany(__assign({ where: {
                                    favoritedBy: {
                                        some: {
                                            userId: userId
                                        }
                                    },
                                    wbsElement: {
                                        organizationId: organization.organizationId
                                    }
                                } }, (0, projects_query_args_1.getProjectManyQueryArgs)(organization.organizationId)))];
                    case 2:
                        projects = _a.sent();
                        return [2 /*return*/, projects.map(projects_transformer_1.projectPreviewTransformer)];
                }
            });
        });
    };
    /**
     * Edits a user's settings in the database
     * @param user the user who's settings are being updated
     * @param defaultTheme the defaultTheme of the user - a setting
     * @param slackId the user's slackId - a setting
     * @returns the updated settings
     * @throws if the user does not exist
     */
    UsersService.updateUserSettings = function (user, defaultTheme, slackId) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, updatedSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = user.userId;
                        return [4 /*yield*/, prisma_1.default.user_Settings.upsert({
                                where: { userId: userId },
                                update: { defaultTheme: defaultTheme, slackId: slackId },
                                create: { userId: userId, defaultTheme: defaultTheme, slackId: slackId }
                            })];
                    case 1:
                        updatedSettings = _a.sent();
                        return [2 /*return*/, updatedSettings];
                }
            });
        });
    };
    /**
     * Logs a user in on production
     * @param idToken the idToken of the user logging in
     * @param header additional information used to register a login
     * @returns the user that has been signed in, and an access token
     * @throws if the auth server response payload is invalid
     */
    UsersService.logUserIn = function (idToken, header) {
        return __awaiter(this, void 0, void 0, function () {
            var client, ticket, payload, userId, user, emailId, organization, firstName, lastName, nonHuskyEmail, createdUser, token, defaultOrganization, authenticatedUser;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        client = new oauth2client_1.OAuth2Client(process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID);
                        return [4 /*yield*/, client.verifyIdToken({
                                idToken: idToken,
                                audience: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID
                            })];
                    case 1:
                        ticket = _c.sent();
                        payload = ticket.getPayload();
                        if (!payload)
                            throw new Error('Auth server response payload invalid');
                        userId = payload.sub;
                        return [4 /*yield*/, prisma_1.default.user.findUnique({
                                where: { googleAuthId: userId },
                                include: {
                                    organizations: true,
                                    userSettings: true
                                }
                            })];
                    case 2:
                        user = _c.sent();
                        if (!payload['email']) {
                            throw new errors_utils_1.HttpException(400, 'Email was not Found on Google Account');
                        }
                        if (!!user) return [3 /*break*/, 7];
                        emailId = payload['email'].includes('@husky.neu.edu') ? payload['email'].split('@')[0] : null;
                        return [4 /*yield*/, prisma_1.default.organization.findFirst()];
                    case 3:
                        organization = _c.sent();
                        firstName = (_a = payload['given_name']) !== null && _a !== void 0 ? _a : payload['email'].split('@')[0];
                        lastName = (_b = payload['family_name']) !== null && _b !== void 0 ? _b : '';
                        nonHuskyEmail = payload['email'].includes('@husky.neu.edu')
                            ? payload['email'].replace(/@husky\.neu\.edu/i, '@northeastern.edu')
                            : payload['email'];
                        return [4 /*yield*/, prisma_1.default.user.create({
                                data: {
                                    firstName: firstName,
                                    lastName: lastName,
                                    googleAuthId: userId,
                                    email: nonHuskyEmail,
                                    emailId: emailId,
                                    userSettings: { create: {} }
                                },
                                include: {
                                    organizations: true,
                                    userSettings: true
                                }
                            })];
                    case 4:
                        createdUser = _c.sent();
                        user = createdUser;
                        if (!organization) return [3 /*break*/, 7];
                        return [4 /*yield*/, prisma_1.default.organization.update({
                                where: { organizationId: organization.organizationId },
                                data: {
                                    users: {
                                        connect: {
                                            userId: createdUser.userId
                                        }
                                    }
                                }
                            })];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, prisma_1.default.role.create({
                                data: {
                                    userId: createdUser.userId,
                                    organizationId: organization.organizationId,
                                    roleType: shared_1.RoleEnum.GUEST
                                }
                            })];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: 
                    // register a login
                    return [4 /*yield*/, prisma_1.default.session.create({
                            data: {
                                userId: user.userId,
                                deviceInfo: header
                            }
                        })];
                    case 8:
                        // register a login
                        _c.sent();
                        token = (0, auth_utils_1.generateAccessToken)({ userId: user.userId, firstName: user.firstName, lastName: user.lastName });
                        if (!(user.organizations.length > 0)) return [3 /*break*/, 10];
                        defaultOrganization = user.organizations[0];
                        return [4 /*yield*/, prisma_1.default.user.findUnique(__assign({ where: { userId: user.userId } }, (0, auth_user_query_args_1.getAuthUserQueryArgs)(defaultOrganization.organizationId)))];
                    case 9:
                        authenticatedUser = _c.sent();
                        if (!authenticatedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        return [2 /*return*/, { user: (0, auth_user_transformer_1.default)(authenticatedUser), token: token }];
                    case 10: return [2 /*return*/, {
                            user: (0, auth_user_transformer_1.default)(__assign(__assign({}, user), { organizations: [], favoriteProjects: [], changeRequestsToReview: [], teamsAsHead: [], teamsAsLead: [], teamsAsMember: [], roles: [], onboardingTeamTypes: [], onboardedTeamTypes: [] })),
                            token: token
                        }];
                }
            });
        });
    };
    /**
     * Logs a user in on the development version of the app
     * @param userId the user id of the user being logged in
     * @param header additional information used to register a login
     * @returns the user that has been logged in
     * @throws if the user with the specified id doesn't exist in the database
     */
    UsersService.logUserInDev = function (userId, header) {
        return __awaiter(this, void 0, void 0, function () {
            var user, defaultOrganization, authenticatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                            where: { userId: userId },
                            include: {
                                organizations: true,
                                userSettings: true
                            }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        // register a login
                        return [4 /*yield*/, prisma_1.default.session.create({
                                data: {
                                    userId: user.userId,
                                    deviceInfo: header
                                }
                            })];
                    case 2:
                        // register a login
                        _a.sent();
                        if (!(user.organizations.length > 0)) return [3 /*break*/, 4];
                        defaultOrganization = user.organizations[0];
                        return [4 /*yield*/, prisma_1.default.user.findUnique(__assign({ where: { userId: userId } }, (0, auth_user_query_args_1.getAuthUserQueryArgs)(defaultOrganization.organizationId)))];
                    case 3:
                        authenticatedUser = _a.sent();
                        if (!authenticatedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        return [2 /*return*/, (0, auth_user_transformer_1.default)(authenticatedUser)];
                    case 4: return [2 /*return*/, (0, auth_user_transformer_1.default)(__assign(__assign({}, user), { organizations: [], favoriteProjects: [], changeRequestsToReview: [], teamsAsHead: [], teamsAsLead: [], teamsAsMember: [], roles: [], onboardingTeamTypes: [], onboardedTeamTypes: [] }))];
                }
            });
        });
    };
    /**
     * Edits a user's role
     * @param targetUserId the user who's role is being changed
     * @param user the user who is changing the role
     * @param role the role that the user is being updated to
     * @param organizationId the id of the organization the user is in
     * @returns the user whose role has been updated
     * @throws if the targeted user doesn't exist, the user who's changing the role doesn't exist,
     *         a user is trying to change the role of a user with an equal or higher role, or a user is trying to
     *         promote a user to higher role than themself
     */
    UsersService.updateUserRole = function (targetUserId, user, role, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var targetUser, userRole, targetUserRole, userRankedRole, targetUserRankedRole;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique(__assign({ where: { userId: targetUserId } }, (0, user_query_args_1.getUserQueryArgs)(organization.organizationId)))];
                    case 1:
                        targetUser = _a.sent();
                        if (!targetUser)
                            throw new errors_utils_1.NotFoundException('User', targetUserId);
                        if (!targetUser.organizations.map(function (org) { return org.organizationId; }).includes(organization.organizationId))
                            throw new errors_utils_1.InvalidOrganizationException('User');
                        return [4 /*yield*/, (0, users_utils_1.getUserRole)(user.userId, organization.organizationId)];
                    case 2:
                        userRole = _a.sent();
                        return [4 /*yield*/, (0, users_utils_1.getUserRole)(targetUserId, organization.organizationId)];
                    case 3:
                        targetUserRole = _a.sent();
                        userRankedRole = (0, shared_1.rankUserRole)(userRole);
                        targetUserRankedRole = (0, shared_1.rankUserRole)(targetUserRole);
                        if (!(0, shared_1.isHead)(userRole)) {
                            throw new errors_utils_1.AccessDeniedException('Guests, members, and leadership cannot update user roles!');
                        }
                        if (targetUserRankedRole >= userRankedRole) {
                            throw new errors_utils_1.AccessDeniedException('Cannot change the role of a user with an equal or higher role than you');
                        }
                        if (!(userRole === shared_1.RoleEnum.HEAD && (0, shared_1.rankUserRole)(role) >= userRankedRole)) return [3 /*break*/, 4];
                        throw new errors_utils_1.AccessDeniedException('Heads can only promote to leadership or below');
                    case 4:
                        if ((0, shared_1.rankUserRole)(role) > userRankedRole) {
                            throw new errors_utils_1.AccessDeniedException('Cannot promote user to a higher role than yourself');
                        }
                        return [4 /*yield*/, prisma_1.default.role.upsert({
                                where: { uniqueRole: { userId: targetUserId, organizationId: organization.organizationId } },
                                update: { roleType: role },
                                create: { userId: targetUserId, organizationId: organization.organizationId, roleType: role }
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, (0, user_transformer_1.userTransformer)(targetUser)];
                }
            });
        });
    };
    /**
     * Gets a user's secure settings
     * @param userId the id of user who's secure settings are being returned
     * @param submitter the user who is requesting the user's secure settings
     * @param organizationId the id of the organization the user is in
     */
    UsersService.getUserSecureSetting = function (userId, submitter, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var secureSettings, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, reimbursement_requests_utils_1.validateUserIsPartOfFinanceTeamOrHead)(submitter, organization.organizationId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma_1.default.user_Secure_Settings.findUnique({
                                where: { userId: userId },
                                include: {
                                    user: {
                                        include: {
                                            organizations: true
                                        }
                                    }
                                }
                            })];
                    case 2:
                        secureSettings = _a.sent();
                        if (!secureSettings)
                            throw new errors_utils_1.HttpException(404, 'User Secure Settings Not Found');
                        user = secureSettings.user;
                        if (!user)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        if (!user.organizations.map(function (org) { return org.organizationId; }).includes(organization.organizationId))
                            throw new errors_utils_1.AccessDeniedException('This user is not in your organization!');
                        return [2 /*return*/, (0, user_secure_settings_transformer_1.default)(secureSettings)];
                }
            });
        });
    };
    /**
     * Sets the user's secure settings
     * @param user the user to set the secure settings for
     * @param nuid the users nuid
     * @param street the users street address
     * @param city the users city
     * @param state the users state
     * @param zipcode the users zipcode
     * @returns the id of the user's secure settings
     */
    UsersService.setUserSecureSettings = function (user, nuid, street, city, state, zipcode, phoneNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var newUserSecureSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user_Secure_Settings.upsert({
                            where: { userId: user.userId },
                            update: {
                                nuid: nuid,
                                street: street,
                                city: city,
                                state: state,
                                zipcode: zipcode,
                                phoneNumber: phoneNumber
                            },
                            create: {
                                userId: user.userId,
                                nuid: nuid,
                                street: street,
                                city: city,
                                state: state,
                                zipcode: zipcode,
                                phoneNumber: phoneNumber
                            }
                        })];
                    case 1:
                        newUserSecureSettings = _a.sent();
                        return [2 /*return*/, newUserSecureSettings.userSecureSettingsId];
                }
            });
        });
    };
    /**
     * Gets a user's schedule settings
     * @param userId the id of the user who's schedule settings are being returned
     * @param submitter the user who's requesting the schedule settings
     * @returns the user's schedule settings
     * @throws if the user doesn't have schedule settings
     */
    UsersService.getUserScheduleSettings = function (userId, submitter) {
        return __awaiter(this, void 0, void 0, function () {
            var scheduleSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (submitter.userId !== userId)
                            throw new errors_utils_1.AccessDeniedException('You can only access your own schedule settings');
                        return [4 /*yield*/, prisma_1.default.schedule_Settings.findUnique(__assign({ where: { userId: userId } }, (0, user_query_args_1.getUserScheduleSettingsQueryArgs)()))];
                    case 1:
                        scheduleSettings = _a.sent();
                        if (!scheduleSettings)
                            throw new errors_utils_1.HttpException(404, 'User Schedule Settings Not Found');
                        return [2 /*return*/, (0, user_schedule_settings_transformer_1.default)(scheduleSettings)];
                }
            });
        });
    };
    /**
     *
     * @param user the user to set the schedule settings for
     * @param personalGmail the user's personal gmail
     * @param personalZoomLink the user's personal zoom link
     * @param availabilities the user's availibility
     * @returns the id of the user's schedule settings
     */
    UsersService.setUserScheduleSettings = function (user, personalGmail, personalZoomLink, availabilities) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, newUserScheduleSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(personalGmail !== '')) return [3 /*break*/, 2];
                        return [4 /*yield*/, prisma_1.default.schedule_Settings.findFirst({
                                where: { personalGmail: personalGmail, userId: { not: user.userId } } // excludes the current user from check
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new errors_utils_1.HttpException(400, 'Email already in use');
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, prisma_1.default.schedule_Settings.upsert(__assign({ where: { userId: user.userId }, update: {
                                personalGmail: personalGmail,
                                personalZoomLink: personalZoomLink
                            }, create: {
                                userId: user.userId,
                                personalGmail: personalGmail,
                                personalZoomLink: personalZoomLink
                            } }, (0, user_query_args_1.getUserScheduleSettingsQueryArgs)()))];
                    case 3:
                        newUserScheduleSettings = _a.sent();
                        return [4 /*yield*/, (0, users_utils_1.updateUserAvailability)(availabilities, newUserScheduleSettings, user)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, (0, user_schedule_settings_transformer_1.default)(newUserScheduleSettings)];
                }
            });
        });
    };
    /**
     * Get's a user's assigned tasks
     * @param userId the id of the user who's tasks are being returned
     * @param organization the user's organization
     * @returns a list of the user's assigned tasks
     */
    UsersService.getUserTasks = function (userId, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                            where: { userId: userId },
                            include: {
                                assignedTasks: __assign({ where: { dateDeleted: null } }, (0, tasks_query_args_1.getTaskQueryArgs)(organization.organizationId)),
                                organizations: true
                            }
                        })];
                    case 1:
                        requestedUser = _a.sent();
                        if (!requestedUser)
                            throw new errors_utils_1.NotFoundException('User', userId);
                        if (!requestedUser.organizations.map(function (org) { return org.organizationId; }).includes(organization.organizationId))
                            throw new errors_utils_1.HttpException(400, "User ".concat(userId, " is not apart of the current organization"));
                        return [2 /*return*/, requestedUser.assignedTasks.map(tasks_transformer_1.default)];
                }
            });
        });
    };
    /**
     * Get all tasks from a list of userIds
     * @param userIds list of users to get the tasks from
     * @param organization the users' organization
     * @returns a list of tasks of the given users
     */
    UsersService.getManyUserTasks = function (userIds, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var tasksPromises, resolvedTasks;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasksPromises = userIds.map(function (userId) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, UsersService.getUserTasks(userId, organization)];
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(tasksPromises)];
                    case 1:
                        resolvedTasks = _a.sent();
                        return [2 /*return*/, resolvedTasks.flat()];
                }
            });
        });
    };
    return UsersService;
}());
exports.default = UsersService;

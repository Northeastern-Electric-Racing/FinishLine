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
exports.getUserAndOrganization = exports.getCurrentUserWithUserSettings = exports.getOrganization = exports.getCurrentUser = exports.requireJwtDev = exports.requireJwtProd = exports.prodHeaders = exports.generateAccessToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
var TOKEN_SECRET = process.env.TOKEN_SECRET || 'i<3security';
// generate a jwt using the user's first and last name
var generateAccessToken = function (user) {
    return jsonwebtoken_1.default.sign(user, TOKEN_SECRET, { expiresIn: '12h' });
};
exports.generateAccessToken = generateAccessToken;
// headers needed for production
exports.prodHeaders = [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'XMLHttpRequest',
    'X-Auth-Token',
    'Client-Security-Token',
    'organizationId'
];
// middleware function for production that will enforce jwt authorization
var requireJwtProd = function (req, res, next) {
    if (req.path === '/users/auth/login' || // logins dont have cookies yet
        req.path === '/' || // base route is available so aws can listen and check the health
        req.method === 'OPTIONS' || // this is a pre-flight request and those don't send cookies
        req.path === '/slack' // slack http endpoint is only used from slack api
    ) {
        return next();
    }
    else if (req.path.startsWith('/notifications') // task deadline notification endpoint
    ) {
        notificationEndpointAuth(req, res, next);
    }
    else {
        var token = req.cookies.token;
        if (!token)
            res.status(401).json({ message: 'Authentication Failed: Cookie not found!' });
        else {
            jsonwebtoken_1.default.verify(token, TOKEN_SECRET, function (err, decoded) {
                if (err)
                    res.status(401).json({ message: 'Authentication Failed: Invalid JWT!' });
                else if (!decoded || typeof decoded === 'string') {
                    res.status(401).json({ message: 'Authentication Failed: Invalid JWT payload!' });
                }
                else {
                    res.locals.userId = decoded.userId;
                    next();
                }
            });
        }
    }
};
exports.requireJwtProd = requireJwtProd;
// middleware function for development that will enforce jwt authorization
var requireJwtDev = function (req, res, next) {
    if (req.path === '/users/auth/login/dev' || // logins dont have cookies yet
        req.path === '/' || // base route is available so aws can listen and check the health
        req.method === 'OPTIONS' || // this is a pre-flight request and those don't send cookies
        req.path === '/users' || // dev login needs the list of users to log in
        req.path === '/slack' // slack http endpoint is only used from slack api
    ) {
        next();
    }
    else if (req.path.startsWith('/notifications') // task deadline notification endpoint
    ) {
        notificationEndpointAuth(req, res, next);
    }
    else {
        var devUserId = req.headers.authorization;
        if (!devUserId)
            res.status(401).json({ message: 'Authentication Failed: Not logged in (dev)!' });
        else {
            res.locals.userId = devUserId;
            next();
        }
    }
};
exports.requireJwtDev = requireJwtDev;
var notificationEndpointAuth = function (req, res, next) {
    var authorization = req.headers.authorization;
    var NOTIFICATION_ENDPOINT_SECRET = process.env.NOTIFICATION_ENDPOINT_SECRET;
    if (!NOTIFICATION_ENDPOINT_SECRET)
        throw new errors_utils_1.HttpException(500, 'Notification endpoint secret not found!');
    if (!authorization)
        return res.status(401).json({ message: 'Authentication Failed: Secret not found!' });
    if (authorization !== NOTIFICATION_ENDPOINT_SECRET)
        return res.status(401).json({ message: 'Authentication Failed: Invalid secret!' });
    return next();
};
/**
 * get the user making the request.
 * @param res - we use the response because that's where we stored the userId data during jwt validation
 * @returns the user
 * @throws if no user with the userId exists
 */
var getCurrentUser = function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = res.locals.userId;
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: { userId: userId }
                    })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                return [2 /*return*/, user];
        }
    });
}); };
exports.getCurrentUser = getCurrentUser;
var getOrganization = function (headers, currentUser) { return __awaiter(void 0, void 0, void 0, function () {
    var organizationid, isProd, organization;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                organizationid = headers.organizationid;
                isProd = process.env.NODE_ENV === 'production';
                if (organizationid === undefined && !isProd) {
                    organizationid = process.env.DEV_ORGANIZATION_ID;
                }
                if (organizationid === undefined) {
                    throw new errors_utils_1.AccessDeniedException('Organization not provided');
                }
                if (typeof organizationid !== 'string') {
                    throw new errors_utils_1.AccessDeniedException('Invalid organization ID');
                }
                return [4 /*yield*/, prisma_1.default.organization.findUnique({
                        where: { organizationId: organizationid },
                        include: {
                            advisor: true,
                            usefulLinks: true,
                            users: true
                        }
                    })];
            case 1:
                organization = _a.sent();
                if (!organization) {
                    throw new errors_utils_1.NotFoundException('Organization', organizationid);
                }
                if (organization.dateDeleted) {
                    throw new errors_utils_1.DeletedException('Organization', organization.organizationId);
                }
                if (!organization.users.some(function (user) { return user.userId === currentUser.userId; })) {
                    throw new errors_utils_1.AccessDeniedException('Cannot access this organization');
                }
                return [2 /*return*/, organization];
        }
    });
}); };
exports.getOrganization = getOrganization;
/**
 * Gets the user making the request and includes their user settings
 * @param res - we use the response because that's where we stored the userId data during jwt validation
 * @returns the user with their user settings
 * @throws if no user with the userId exists
 */
var getCurrentUserWithUserSettings = function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = res.locals.userId;
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: { userId: userId },
                        include: { userSettings: true, userSecureSettings: true }
                    })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new errors_utils_1.NotFoundException('User', userId);
                return [2 /*return*/, user];
        }
    });
}); };
exports.getCurrentUserWithUserSettings = getCurrentUserWithUserSettings;
var getUserAndOrganization = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, organization, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.path === '/users/auth/login' || // logins dont have cookies yet
                    req.path === '/users/auth/login/dev' ||
                    req.path === '/' || // base route is available so aws can listen and check the health
                    req.method === 'OPTIONS' || // this is a pre-flight request and those don't send cookies
                    req.path === '/users' || // dev login needs the list of users to log in
                    req.path === '/slack' || // slack http endpoint is only used from slack api
                    req.path.startsWith('/notifications') // Notifications route has its own auth, only called from gh
                ) {
                    return [2 /*return*/, next()];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, exports.getCurrentUser)(res)];
            case 2:
                user = _a.sent();
                return [4 /*yield*/, (0, exports.getOrganization)(req.headers, user)];
            case 3:
                organization = _a.sent();
                req.currentUser = user;
                req.organization = organization;
                return [2 /*return*/, next()];
            case 4:
                error_1 = _a.sent();
                return [2 /*return*/, next(error_1)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getUserAndOrganization = getUserAndOrganization;

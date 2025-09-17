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
var vitest_1 = require("vitest");
var client_1 = require("@prisma/client");
var calendar_services_1 = require("../../src/services/calendar.services");
var test_utils_1 = require("../test-utils");
var shared_1 = require("shared");
var prisma = new client_1.PrismaClient();
(0, vitest_1.describe)('Calendar Service', function () {
    var adminUser;
    var regularUser;
    var testOrganization;
    (0, vitest_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var adminParams, userParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, test_utils_1.resetUsers)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.createTestOrganization)()];
                case 2:
                    testOrganization = _a.sent();
                    adminParams = {
                        firstName: 'Test',
                        lastName: 'Admin',
                        email: 'test-admin@test.com',
                        googleAuthId: 'test-admin-google-id',
                        role: shared_1.RoleEnum.APP_ADMIN
                    };
                    userParams = {
                        firstName: 'Test',
                        lastName: 'User',
                        email: 'test-user@test.com',
                        googleAuthId: 'test-user-google-id',
                        role: shared_1.RoleEnum.MEMBER
                    };
                    return [4 /*yield*/, (0, test_utils_1.createTestUser)(adminParams, testOrganization.organizationId)];
                case 3:
                    adminUser = _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.createTestUser)(userParams, testOrganization.organizationId)];
                case 4:
                    regularUser = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, cleanupTestData()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.$disconnect()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.calendar.deleteMany({
                        where: {
                            name: {
                                contains: 'Test Calendar'
                            }
                        }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.describe)('createCalendar', function () {
        (0, vitest_1.it)('should create calendar successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var calendarData, calendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        calendarData = {
                            name: 'Test Calendar Success',
                            description: 'Test calendar description',
                            colorHexCode: '#ff0000',
                            userCreatedId: adminUser.userId
                        };
                        return [4 /*yield*/, calendar_services_1.default.createCalendar(calendarData)];
                    case 1:
                        calendar = _a.sent();
                        (0, vitest_1.expect)(calendar).toHaveProperty('calendarId');
                        (0, vitest_1.expect)(calendar.name).toBe(calendarData.name);
                        (0, vitest_1.expect)(calendar.description).toBe(calendarData.description);
                        (0, vitest_1.expect)(calendar.colorHexCode).toBe(calendarData.colorHexCode);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should create calendar with special characters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var calendarData, calendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        calendarData = {
                            name: 'Test Calendar with Special chars: !@#$%',
                            description: 'Description with special chars',
                            colorHexCode: '#purple',
                            userCreatedId: adminUser.userId
                        };
                        return [4 /*yield*/, calendar_services_1.default.createCalendar(calendarData)];
                    case 1:
                        calendar = _a.sent();
                        (0, vitest_1.expect)(calendar.name).toBe(calendarData.name);
                        (0, vitest_1.expect)(calendar.description).toBe(calendarData.description);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('getAllCalendars', function () {
        (0, vitest_1.it)('should get all calendars', function () { return __awaiter(void 0, void 0, void 0, function () {
            var calendars, calendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, calendar_services_1.default.createCalendar({
                            name: 'Test GET Calendar',
                            description: 'Calendar for GET testing',
                            colorHexCode: '#123456',
                            userCreatedId: adminUser.userId
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, calendar_services_1.default.getAllCalendars()];
                    case 2:
                        calendars = _a.sent();
                        (0, vitest_1.expect)(Array.isArray(calendars)).toBe(true);
                        (0, vitest_1.expect)(calendars.length).toBeGreaterThan(0);
                        calendar = calendars.find(function (cal) { return cal.name === 'Test GET Calendar'; });
                        (0, vitest_1.expect)(calendar).toBeDefined();
                        (0, vitest_1.expect)(calendar).toHaveProperty('calendarId');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('getSingleCalendar', function () {
        (0, vitest_1.it)('should get single calendar by id', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createdCalendar, calendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, calendar_services_1.default.createCalendar({
                            name: 'Test Single Calendar',
                            description: 'Calendar for single GET testing',
                            colorHexCode: '#654321',
                            userCreatedId: adminUser.userId
                        })];
                    case 1:
                        createdCalendar = _a.sent();
                        return [4 /*yield*/, calendar_services_1.default.getSingleCalendar(createdCalendar.calendarId)];
                    case 2:
                        calendar = _a.sent();
                        (0, vitest_1.expect)(calendar).toHaveProperty('calendarId', createdCalendar.calendarId);
                        (0, vitest_1.expect)(calendar.name).toBe('Test Single Calendar');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should throw error for non-existent calendar', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, vitest_1.expect)(calendar_services_1.default.getSingleCalendar('non-existent-id')).rejects.toThrow('Calendar not found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('editCalendar', function () {
        (0, vitest_1.it)('should edit calendar successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createdCalendar, updateData, updatedCalendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, calendar_services_1.default.createCalendar({
                            name: 'Test Edit Calendar',
                            description: 'Calendar for edit testing',
                            colorHexCode: '#111111',
                            userCreatedId: adminUser.userId
                        })];
                    case 1:
                        createdCalendar = _a.sent();
                        updateData = {
                            name: 'Updated Test Calendar',
                            description: 'Updated description',
                            colorHexCode: '#222222'
                        };
                        return [4 /*yield*/, calendar_services_1.default.editCalendar(createdCalendar.calendarId, updateData)];
                    case 2:
                        updatedCalendar = _a.sent();
                        (0, vitest_1.expect)(updatedCalendar.name).toBe(updateData.name);
                        (0, vitest_1.expect)(updatedCalendar.description).toBe(updateData.description);
                        (0, vitest_1.expect)(updatedCalendar.colorHexCode).toBe(updateData.colorHexCode);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('deleteCalendar', function () {
        (0, vitest_1.it)('should delete calendar successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createdCalendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, calendar_services_1.default.createCalendar({
                            name: 'Test Delete Calendar',
                            description: 'Calendar for delete testing',
                            colorHexCode: '#333333',
                            userCreatedId: adminUser.userId
                        })];
                    case 1:
                        createdCalendar = _a.sent();
                        return [4 /*yield*/, calendar_services_1.default.deleteCalendar(createdCalendar.calendarId, adminUser.userId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, vitest_1.expect)(calendar_services_1.default.getSingleCalendar(createdCalendar.calendarId)).rejects.toThrow('Calendar not found')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
function cleanupTestData() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.calendar.deleteMany({
                        where: {
                            name: { contains: 'Test Calendar' }
                        }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}

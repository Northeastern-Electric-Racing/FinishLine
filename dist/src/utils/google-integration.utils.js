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
exports.deleteCalendarEvent = exports.updateCalendarEvent = exports.createCalendarEvent = exports.createCalendar = exports.downloadFile = exports.uploadFile = exports.sendMailToAdvisor = void 0;
var nodemailer_1 = require("nodemailer");
var googleapis_1 = require("googleapis");
var errors_utils_1 = require("./errors.utils");
var stream_1 = require("stream");
var concat_stream_1 = require("concat-stream");
var datetime_utils_1 = require("./datetime.utils");
var design_reviews_utils_1 = require("./design-reviews.utils");
var users_utils_1 = require("./users.utils");
var OAuth2 = googleapis_1.google.auth.OAuth2;
var _a = process.env, GOOGLE_DRIVE_FOLDER_ID = _a.GOOGLE_DRIVE_FOLDER_ID, GOOGLE_CLIENT_ID = _a.GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET = _a.GOOGLE_CLIENT_SECRET, EMAIL_REFRESH_TOKEN = _a.EMAIL_REFRESH_TOKEN, USER_EMAIL = _a.USER_EMAIL, DRIVE_REFRESH_TOKEN = _a.DRIVE_REFRESH_TOKEN, CALENDAR_REFRESH_TOKEN = _a.CALENDAR_REFRESH_TOKEN;
var oauth2Client = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
var createTransporter = function () { return __awaiter(void 0, void 0, void 0, function () {
    var accessToken_1, transporter;
    return __generator(this, function (_a) {
        try {
            oauth2Client.setCredentials({
                refresh_token: EMAIL_REFRESH_TOKEN
            });
            oauth2Client.getAccessToken(function (_err, token) {
                accessToken_1 = token;
            });
            transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: USER_EMAIL,
                    accessToken: accessToken_1 === null || accessToken_1 === void 0 ? void 0 : accessToken_1.toString(),
                    clientId: GOOGLE_CLIENT_ID,
                    clientSecret: GOOGLE_CLIENT_SECRET,
                    refreshToken: EMAIL_REFRESH_TOKEN
                }
            });
            return [2 /*return*/, transporter];
        }
        catch (err) {
            console.log('ERROR: ' + err);
            if (err instanceof Error)
                throw new errors_utils_1.HttpException(500, 'Failed to Create Transporter ' + err.message);
            throw err;
        }
        return [2 /*return*/];
    });
}); };
var sendMailToAdvisor = function (subject, text, advisor) { return __awaiter(void 0, void 0, void 0, function () {
    var mailOptions, emailTransporter, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                mailOptions = {
                    from: USER_EMAIL,
                    to: advisor.email,
                    subject: subject,
                    text: text
                };
                return [4 /*yield*/, createTransporter()];
            case 1:
                emailTransporter = (_a.sent());
                return [4 /*yield*/, emailTransporter.sendMail(mailOptions)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log('Error: ' + err_1);
                if (err_1 instanceof Error)
                    throw new errors_utils_1.HttpException(500, 'Failed to send Email ' + err_1.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendMailToAdvisor = sendMailToAdvisor;
//tutorial used to set this up: https://www.labnol.org/google-drive-api-upload-220412
var uploadFile = function (fileObject) { return __awaiter(void 0, void 0, void 0, function () {
    var bufferStream, drive, response, _a, id, name_1, error_1, gError;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                bufferStream = new stream_1.default.PassThrough();
                bufferStream.end(fileObject.buffer);
                if ((fileObject.filename && ((_b = fileObject.filename) === null || _b === void 0 ? void 0 : _b.length) > 20) ||
                    (!fileObject.filename && fileObject.originalname.length > 20))
                    throw new errors_utils_1.HttpException(400, 'File name can only be at most 20 characters long');
                //The regex /^[\w.]+$/ limits the file name to the set of alphanumeric characters (\w) and dots (for file type)
                if (!/^[\w.]+$/.test(fileObject.filename || fileObject.originalname))
                    throw new errors_utils_1.HttpException(400, 'File name should only contain letters and numbers');
                oauth2Client.setCredentials({
                    refresh_token: DRIVE_REFRESH_TOKEN
                });
                _d.label = 1;
            case 1:
                _d.trys.push([1, 4, , 5]);
                drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
                return [4 /*yield*/, drive.files.create({
                        media: {
                            mimeType: fileObject.mimetype,
                            body: bufferStream
                        },
                        requestBody: {
                            name: (_c = fileObject.filename) !== null && _c !== void 0 ? _c : fileObject.originalname,
                            parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : undefined
                        },
                        fields: 'id,name'
                    })];
            case 2:
                response = _d.sent();
                if (!response.data.id)
                    throw new errors_utils_1.HttpException(500, 'Error while uploading file');
                return [4 /*yield*/, drive.permissions.create({
                        fileId: response.data.id,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone'
                        }
                    })];
            case 3:
                _d.sent();
                _a = response.data, id = _a.id, name_1 = _a.name;
                return [2 /*return*/, { id: id, name: name_1 }];
            case 4:
                error_1 = _d.sent();
                if (error_1.errors) {
                    gError = error_1;
                    throw new errors_utils_1.HttpException(gError.code, "Failed to Upload : ".concat(gError.message, ", ").concat(gError.errors.reduce(function (acc, curr) {
                        return acc + ' ' + curr.message + ' ' + curr.reason;
                    }, '')));
                }
                else if (error_1 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to Upload : ".concat(error_1.message));
                }
                console.log('error' + error_1);
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.uploadFile = uploadFile;
//converts a Readable to a Buffer
var readableToBuffer = function (readable) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var concatStream = (0, concat_stream_1.default)(function (data) {
                    resolve(data);
                });
                readable.on('error', reject);
                readable.pipe(concatStream);
            })];
    });
}); };
//given the google file id, downloads the file data and return it as a Buffer along with the file type
var downloadFile = function (fileId) { return __awaiter(void 0, void 0, void 0, function () {
    var drive, res, bufferData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                oauth2Client.setCredentials({
                    refresh_token: DRIVE_REFRESH_TOKEN
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
                return [4 /*yield*/, drive.files.get({
                        fileId: fileId,
                        alt: 'media'
                    }, { responseType: 'stream' })];
            case 2:
                res = _a.sent();
                return [4 /*yield*/, readableToBuffer(res.data)];
            case 3:
                bufferData = _a.sent();
                return [2 /*return*/, { buffer: bufferData, type: res.headers['content-type'] }];
            case 4:
                error_2 = _a.sent();
                if (error_2 instanceof Error) {
                    throw new errors_utils_1.HttpException(500, "Failed to Download File(".concat(fileId, "): ").concat(error_2.message));
                }
                throw error_2;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.downloadFile = downloadFile;
/**
 * Creates a new google calendar on the NER google calendar
 * @param name
 * @returns the calendar id
 */
var createCalendar = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var calendar, createdCalendar, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                oauth2Client.setCredentials({
                    refresh_token: CALENDAR_REFRESH_TOKEN
                });
                calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                return [4 /*yield*/, calendar.calendars.insert({
                        requestBody: { summary: "".concat(name, " System Meetings") }
                    })];
            case 2:
                createdCalendar = _a.sent();
                return [2 /*return*/, createdCalendar.data.id];
            case 3:
                error_3 = _a.sent();
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createCalendar = createCalendar;
/**
 * Creates A Google Calendar Event on the NER Google Calendar
 * @param members required and optional members
 * @param calendarId the id of the calendar to add the event
 * @param dateScheduled
 * @param isInPerson
 * @param zoomLink
 * @param location
 * @param meetingTimes
 * @param wbsElement
 * @returns the id of the calendar event
 */
var createCalendarEvent = function (calendarId, memberIds, dateScheduled, isInPerson, zoomLink, location, meetingTimes, wbsElement) { return __awaiter(void 0, void 0, void 0, function () {
    var calendar, startTime, eventInput, calendarEvent, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.NODE_ENV !== 'production')
                    return [2 /*return*/];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                oauth2Client.setCredentials({
                    refresh_token: CALENDAR_REFRESH_TOKEN
                });
                calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                startTime = (0, design_reviews_utils_1.transformStartTime)(meetingTimes);
                _a = {
                    location: isInPerson ? location : zoomLink,
                    summary: "Design Review - ".concat(wbsElement.projectNumber, " ").concat(wbsElement.name),
                    start: {
                        dateTime: "".concat((0, datetime_utils_1.transformDate)(new Date(dateScheduled)), "T").concat(startTime, ":00:00-04:00"),
                        timeZone: 'America/New_York'
                    },
                    end: {
                        dateTime: "".concat((0, datetime_utils_1.transformDate)(new Date(dateScheduled)), "T").concat(startTime + 1, ":00:00-04:00"),
                        timeZone: 'America/New_York'
                    }
                };
                return [4 /*yield*/, (0, users_utils_1.getUsers)(memberIds)];
            case 2:
                eventInput = (_a.attendees = (_b.sent()).map(function (user) {
                    return { email: user.email };
                }),
                    _a.reminders = {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 10 }
                        ]
                    },
                    _a);
                return [4 /*yield*/, calendar.events.insert({
                        calendarId: calendarId,
                        requestBody: eventInput
                    })];
            case 3:
                calendarEvent = _b.sent();
                return [2 /*return*/, calendarEvent.data.id];
            case 4:
                error_4 = _b.sent();
                throw error_4;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createCalendarEvent = createCalendarEvent;
/**
 * Updates a Google Calendar Event
 * @param calendarId Id of the calendar the event is on
 * @param eventId Id of the calendar event
 * @param members required and optional members
 * @param designReview
 * @returns the id of the updated calendar event
 */
var updateCalendarEvent = function (calendarId, eventId, memberIds, dateScheduled, isInPerson, zoomLink, location, meetingTimes, wbsElement) { return __awaiter(void 0, void 0, void 0, function () {
    var calendar, startTime, eventInput, calendarEvent, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                oauth2Client.setCredentials({
                    refresh_token: CALENDAR_REFRESH_TOKEN
                });
                calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                startTime = (0, design_reviews_utils_1.transformStartTime)(meetingTimes);
                _a = {
                    location: isInPerson ? location : zoomLink,
                    summary: "Design Review - ".concat(wbsElement.projectNumber, " ").concat(wbsElement.name),
                    start: {
                        dateTime: "".concat((0, datetime_utils_1.transformDate)(dateScheduled), "T").concat(startTime, ":00:00-04:00"),
                        timeZone: 'America/New_York'
                    },
                    end: {
                        dateTime: "".concat((0, datetime_utils_1.transformDate)(dateScheduled), "T").concat(startTime + 1, ":00:00-04:00"),
                        timeZone: 'America/New_York'
                    }
                };
                return [4 /*yield*/, (0, users_utils_1.getUsers)(memberIds)];
            case 1:
                eventInput = (_a.attendees = (_b.sent()).map(function (user) {
                    return { email: user.email };
                }),
                    _a.reminders = {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 10 }
                        ]
                    },
                    _a);
                return [4 /*yield*/, calendar.events.update({
                        calendarId: calendarId,
                        eventId: eventId,
                        requestBody: eventInput
                    })];
            case 2:
                calendarEvent = _b.sent();
                return [2 /*return*/, calendarEvent.data.id];
            case 3:
                error_5 = _b.sent();
                throw error_5;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateCalendarEvent = updateCalendarEvent;
/**
 * deletes a Google Calendar Event
 * @param calendarId id of the calendar the event is on
 * @param eventId the id of the calendar event
 * @returns the deleted calendar event
 */
var deleteCalendarEvent = function (calendarId, eventId) { return __awaiter(void 0, void 0, void 0, function () {
    var calendar, calendarEvent, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                oauth2Client.setCredentials({
                    refresh_token: CALENDAR_REFRESH_TOKEN
                });
                calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                return [4 /*yield*/, calendar.events.delete({
                        calendarId: calendarId,
                        eventId: eventId
                    })];
            case 1:
                calendarEvent = _a.sent();
                return [2 /*return*/, calendarEvent];
            case 2:
                error_6 = _a.sent();
                throw error_6;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteCalendarEvent = deleteCalendarEvent;

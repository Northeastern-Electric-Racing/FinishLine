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
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderwomanMarkedWithScheduleSettings = exports.wonderwomanWithScheduleSettings = exports.wonderwomanMarkedScheduleSettings = exports.wonderwomanScheduleSettings = exports.batmanUserScheduleSettings = exports.batmanWithScheduleSettings = exports.batmanScheduleSettings = exports.supermanWithUserSettings = exports.batmanWithUserSettings = exports.alfred = exports.batmanSecureSettings = exports.sharedBatman = exports.batmanSettings = exports.member = exports.financeMember = exports.aquamanLeadership = exports.greenlanternHead = exports.flashAdmin = exports.wonderwomanSettings = exports.wonderwomanGuest = exports.supermanSettings = exports.supermanAdmin = exports.theVisitorGuest = exports.batmanAppAdmin = void 0;
var client_1 = require("@prisma/client");
var shared_1 = require("shared");
exports.batmanAppAdmin = {
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'notbatman@gmail.com',
    emailId: 'notbatman',
    role: shared_1.RoleEnum.APP_ADMIN,
    googleAuthId: 'b'
};
exports.theVisitorGuest = {
    firstName: 'The',
    lastName: 'Visitor',
    email: 'oooscary@gmail.com',
    emailId: 'oooscary',
    role: shared_1.RoleEnum.GUEST,
    googleAuthId: 't'
};
exports.supermanAdmin = {
    firstName: 'Clark',
    lastName: 'Kent',
    email: 'clark.kent@thedailyplanet.com',
    emailId: 'clark.kent',
    role: shared_1.RoleEnum.ADMIN,
    googleAuthId: 's',
    permissions: [shared_1.Permission.CREATE_GRAPH]
};
exports.supermanSettings = {
    id: 'sm',
    userId: '2',
    defaultTheme: client_1.Theme.LIGHT,
    slackId: 'slackSM'
};
exports.wonderwomanGuest = {
    firstName: 'Wonder',
    lastName: 'Woman',
    email: 'amazonian1@savingtheday.com',
    emailId: 'amazonian1',
    role: shared_1.RoleEnum.GUEST,
    googleAuthId: 'w'
};
exports.wonderwomanSettings = {
    id: 'ww',
    userId: '4',
    defaultTheme: client_1.Theme.LIGHT,
    slackId: 'slackWW'
};
exports.flashAdmin = {
    firstName: 'Barry',
    lastName: 'Allen',
    email: 'b.allen@fast.com',
    emailId: 'barry.allen',
    role: shared_1.RoleEnum.ADMIN,
    googleAuthId: 'f'
};
exports.greenlanternHead = {
    firstName: 'Hal',
    lastName: 'Jordan',
    email: 'h.jordam@pilot.com',
    emailId: 'hal.jordan',
    role: shared_1.RoleEnum.HEAD,
    googleAuthId: 'g'
};
exports.aquamanLeadership = {
    firstName: 'Arthur',
    lastName: 'Curry',
    email: 'a.curry@water.com',
    emailId: 'arhur.curry',
    role: shared_1.RoleEnum.LEADERSHIP,
    googleAuthId: 'a'
};
exports.financeMember = {
    firstName: 'Johnny',
    lastName: 'Bravo',
    googleAuthId: '25',
    email: 'jbravo@gmail.com',
    emailId: 'jbravo',
    role: shared_1.RoleEnum.MEMBER
};
exports.member = {
    firstName: 'Johnny',
    lastName: 'Bravo',
    googleAuthId: '25',
    email: 'jbravo@gmail.com',
    emailId: 'jbravo',
    role: shared_1.RoleEnum.MEMBER
};
exports.batmanSettings = {
    id: 'bm',
    userId: '1',
    defaultTheme: client_1.Theme.DARK,
    slackId: 'slack'
};
exports.sharedBatman = {
    userId: '1',
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'notbatman@gmail.com',
    emailId: 'notbatman',
    role: 'APP_ADMIN',
    permissions: [shared_1.Permission.CREATE_GRAPH, shared_1.Permission.EDIT_GRAPH, shared_1.Permission.VIEW_GRAPH, shared_1.Permission.DELETE_GRAPH]
};
exports.batmanSecureSettings = {
    userSecureSettingsId: 'bm',
    userId: '1',
    nuid: '001234567',
    phoneNumber: '1234567890',
    street: '123 Gotham St.',
    city: 'Gotham',
    state: 'NY',
    zipcode: '12345'
};
exports.alfred = {
    firstName: 'Alfred',
    lastName: 'Pennyworth',
    email: 'butler@gmail.com',
    emailId: 'butler',
    role: shared_1.RoleEnum.APP_ADMIN,
    googleAuthId: 'u',
    // Do NOT put a team here! This will create a circular dependency that breaks tests.
    // Do this instead: { ...alfred, teamsAsMember: [<your team>]}
    teamsAsMember: [],
    teamsAsLead: []
};
exports.batmanWithUserSettings = __assign(__assign({}, exports.batmanAppAdmin), { userSettings: __assign({}, exports.batmanSettings) });
exports.supermanWithUserSettings = __assign(__assign({}, exports.supermanAdmin), { userSettings: __assign({}, exports.supermanSettings) });
exports.batmanScheduleSettings = {
    drScheduleSettingsId: 'bmschedule',
    personalGmail: 'brucewayne@gmail.com',
    personalZoomLink: 'https://zoom.us/j/gotham',
    userId: '69'
};
exports.batmanWithScheduleSettings = __assign(__assign({}, exports.batmanAppAdmin), { scheduleSettings: __assign({}, exports.batmanScheduleSettings) });
exports.batmanUserScheduleSettings = {
    drScheduleSettingsId: 'bmschedule',
    personalGmail: 'brucewayne@gmail.com',
    personalZoomLink: 'https://zoom.us/j/gotham',
    availabilities: []
};
exports.wonderwomanScheduleSettings = {
    drScheduleSettingsId: 'wwschedule',
    personalGmail: 'diana@gmail.com',
    personalZoomLink: 'https://zoom.us/jk/athens',
    userId: '72'
};
exports.wonderwomanMarkedScheduleSettings = {
    drScheduleSettingsId: 'wwschedule',
    personalGmail: 'diana@gmail.com',
    personalZoomLink: 'https://zoom.us/jk/athens',
    userId: '72'
};
exports.wonderwomanWithScheduleSettings = __assign(__assign({}, exports.wonderwomanGuest), { scheduleSettings: __assign({}, exports.wonderwomanScheduleSettings) });
exports.wonderwomanMarkedWithScheduleSettings = __assign(__assign({}, exports.wonderwomanGuest), { scheduleSettings: __assign({}, exports.wonderwomanMarkedScheduleSettings) });

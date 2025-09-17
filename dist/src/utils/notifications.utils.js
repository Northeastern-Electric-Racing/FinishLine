"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endOfDayTomorrow = exports.startOfDayTomorrow = exports.userToSlackPing = exports.usersToSlackPings = void 0;
var usersToSlackPings = function (users) {
    // https://api.slack.com/reference/surfaces/formatting#mentioning-users
    return users.map(exports.userToSlackPing).join(' ');
};
exports.usersToSlackPings = usersToSlackPings;
var userToSlackPing = function (user) {
    var _a;
    return "<@".concat((_a = user.userSettings) === null || _a === void 0 ? void 0 : _a.slackId, ">");
};
exports.userToSlackPing = userToSlackPing;
/**
 * Gets the beginning of the day tomorrow
 * @returns the beginning of the day tomorrow (at 12am)
 */
var startOfDayTomorrow = function () {
    return new Date(new Date().setHours(24, 0, 0, 0));
};
exports.startOfDayTomorrow = startOfDayTomorrow;
/**
 * Gets the end of the day tomorrow
 * @returns the end of the day tomorrow (i.e. 12am of the following day)
 */
var endOfDayTomorrow = function () {
    var startOfDay = (0, exports.startOfDayTomorrow)();
    var endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);
    return endOfDay;
};
exports.endOfDayTomorrow = endOfDayTomorrow;

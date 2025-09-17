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
exports.userWithScheduleSettingsTransformer = exports.userTransformer = void 0;
var shared_1 = require("shared");
var user_schedule_settings_transformer_1 = require("./user-schedule-settings.transformer");
var userTransformer = function (user) {
    return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailId: user.emailId,
        role: user.roles.length > 0 ? user.roles[0].roleType : shared_1.RoleEnum.GUEST,
        permissions: user.roles
            .map(function (role) { return (0, shared_1.getPermissionsForRoleType)(role.roleType); })
            .flat()
            .concat(user.additionalPermissions)
    };
};
exports.userTransformer = userTransformer;
var userWithScheduleSettingsTransformer = function (user) {
    return __assign(__assign({}, (0, exports.userTransformer)(user)), { scheduleSettings: user.drScheduleSettings ? (0, user_schedule_settings_transformer_1.default)(user.drScheduleSettings) : undefined });
};
exports.userWithScheduleSettingsTransformer = userWithScheduleSettingsTransformer;

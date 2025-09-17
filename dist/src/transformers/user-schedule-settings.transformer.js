"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var userScheduleSettingsTransformer = function (settings) {
    return {
        drScheduleSettingsId: settings.drScheduleSettingsId,
        personalGmail: settings.personalGmail,
        personalZoomLink: settings.personalZoomLink,
        availabilities: settings.availabilities
    };
};
exports.default = userScheduleSettingsTransformer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var userSecureSettingsTransformer = function (settings) {
    return {
        userSecureSettingsId: settings.userSecureSettingsId,
        nuid: settings.nuid,
        street: settings.street,
        city: settings.city,
        state: settings.state,
        zipcode: settings.zipcode,
        phoneNumber: settings.phoneNumber
    };
};
exports.default = userSecureSettingsTransformer;

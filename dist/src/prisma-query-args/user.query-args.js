"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserScheduleSettingsQueryArgs = exports.getUserWithSettingsQueryArgs = exports.getUserQueryArgs = void 0;
var client_1 = require("@prisma/client");
// DO NOT CALL ANY OTHER QUERY ARGS FROM HERE TO AVOID CIRCULAR DEPENDENCIES
var getUserQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            roles: {
                where: {
                    organizationId: organizationId
                }
            },
            organizations: true
        }
    });
};
exports.getUserQueryArgs = getUserQueryArgs;
var getUserWithSettingsQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: {
            roles: {
                where: {
                    organizationId: organizationId
                }
            },
            drScheduleSettings: (0, exports.getUserScheduleSettingsQueryArgs)(),
            userSettings: true,
            organizations: true
        }
    });
};
exports.getUserWithSettingsQueryArgs = getUserWithSettingsQueryArgs;
var getUserScheduleSettingsQueryArgs = function () {
    return client_1.Prisma.validator()({
        include: {
            availabilities: true
        }
    });
};
exports.getUserScheduleSettingsQueryArgs = getUserScheduleSettingsQueryArgs;

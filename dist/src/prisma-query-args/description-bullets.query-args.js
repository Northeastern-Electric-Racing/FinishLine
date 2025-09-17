"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescriptionBulletQueryArgs = void 0;
var client_1 = require("@prisma/client");
var user_query_args_1 = require("./user.query-args");
var getDescriptionBulletQueryArgs = function (organizationId) {
    return client_1.Prisma.validator()({
        include: { userChecked: (0, user_query_args_1.getUserQueryArgs)(organizationId), descriptionBulletType: true }
    });
};
exports.getDescriptionBulletQueryArgs = getDescriptionBulletQueryArgs;

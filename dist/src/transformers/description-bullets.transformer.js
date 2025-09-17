"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user_transformer_1 = require("./user.transformer");
var descriptionBulletTransformer = function (descBullet) {
    var _a, _b;
    return {
        id: descBullet.descriptionId,
        detail: descBullet.detail,
        dateAdded: descBullet.dateAdded,
        type: descBullet.descriptionBulletType.name,
        dateDeleted: (_a = descBullet.dateDeleted) !== null && _a !== void 0 ? _a : undefined,
        userChecked: descBullet.userChecked ? (0, user_transformer_1.userTransformer)(descBullet.userChecked) : undefined,
        dateChecked: (_b = descBullet.dateTimeChecked) !== null && _b !== void 0 ? _b : undefined
    };
};
exports.default = descriptionBulletTransformer;

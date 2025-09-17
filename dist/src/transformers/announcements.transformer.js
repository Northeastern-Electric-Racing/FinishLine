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
var user_transformer_1 = require("./user.transformer");
var announcementTransformer = function (announcement) {
    var _a;
    return __assign(__assign({}, announcement), { usersReceived: announcement.usersReceived.map(user_transformer_1.userTransformer), dateDeleted: (_a = announcement.dateDeleted) !== null && _a !== void 0 ? _a : undefined });
};
exports.default = announcementTransformer;

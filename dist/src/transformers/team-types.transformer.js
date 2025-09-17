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
exports.teamTypeTransformer = void 0;
var teamTypeTransformer = function (teamType) {
    var _a, _b;
    return __assign(__assign({}, teamType), { dateDeleted: (_a = teamType.dateDeleted) !== null && _a !== void 0 ? _a : undefined, deletedById: (_b = teamType.deletedById) !== null && _b !== void 0 ? _b : undefined });
};
exports.teamTypeTransformer = teamTypeTransformer;

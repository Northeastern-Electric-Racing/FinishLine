"use strict";
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDate = void 0;
/**
 * Transforms a date into a string in the format 'YYYY-MM-DD'
 * @param date The date to transform
 * @returns the date as a string in the format 'YYYY-MM-DD'
 */
var transformDate = function (date) {
    var month = date.getMonth() + 1 < 10 ? "0".concat(date.getMonth() + 1) : (date.getMonth() + 1).toString();
    var day = date.getDate() < 10 ? "0".concat(date.getDate()) : date.getDate().toString();
    return "".concat(date.getFullYear().toString(), "-").concat(month, "-").concat(day);
};
exports.transformDate = transformDate;

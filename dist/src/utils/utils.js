"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStatus = exports.wbsNumOf = void 0;
var shared_1 = require("shared");
var wbsNumOf = function (element) { return ({
    carNumber: element.carNumber,
    projectNumber: element.projectNumber,
    workPackageNumber: element.workPackageNumber
}); };
exports.wbsNumOf = wbsNumOf;
var convertStatus = function (status) {
    return ({
        INACTIVE: shared_1.WbsElementStatus.Inactive,
        ACTIVE: shared_1.WbsElementStatus.Active,
        COMPLETE: shared_1.WbsElementStatus.Complete
    })[status];
};
exports.convertStatus = convertStatus;

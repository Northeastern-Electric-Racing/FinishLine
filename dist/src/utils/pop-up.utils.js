"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPartAssignmentPopUp = exports.sendPartReviewRequestPopUp = exports.sendCrRequestReviewPopUp = exports.sendCrReviewedPopUp = exports.sendDrPopUp = void 0;
var pop_up_services_1 = require("../services/pop-up.services");
/**
 * Sends a pop up that a design review was scheduled
 * @param designReview dr that was created
 * @param members optional and required members of the dr
 * @param submitter the user who created the dr
 * @param workPackageName the name of the work package associated witht the dr
 * @param organizationId  id of the organization of the dr
 */
var sendDrPopUp = function (designReview, members, submitter, workPackageName, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var designReviewLink, msg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                designReviewLink = "/settings/preferences?drId=".concat(designReview.designReviewId);
                msg = "Design Review for ".concat(workPackageName, " is being scheduled by ").concat(submitter.firstName, " ").concat(submitter.lastName);
                return [4 /*yield*/, pop_up_services_1.PopUpService.sendPopUpToUsers(msg, 'calendar_month', members.map(function (member) { return member.userId; }), organizationId, designReviewLink)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendDrPopUp = sendDrPopUp;
/**
 * Sends a pop up that a change request was reviewed
 * @param changeRequest cr that was requested review
 * @param submitter the user who submitted the cr
 * @param accepted true if the cr changes were accepted, false if denied
 * @param organizationId id of the organization of the cr
 */
var sendCrReviewedPopUp = function (changeRequest, submitter, accepted, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var changeRequestLink;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                changeRequestLink = "/change-requests/".concat(changeRequest.crId);
                return [4 /*yield*/, pop_up_services_1.PopUpService.sendPopUpToUsers("CR #".concat(changeRequest.identifier, " has been ").concat(accepted ? 'approved!' : 'denied.'), accepted ? 'check_circle' : 'cancel', [submitter.userId], organizationId, changeRequestLink)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendCrReviewedPopUp = sendCrReviewedPopUp;
/**
 * Sends a finishline pop up to all requested reviewers of a change request
 * @param changeRequest cr that was requested review
 * @param reviewers user's reviewing the cr
 * @param organizationId id of the organization of the cr
 */
var sendCrRequestReviewPopUp = function (changeRequest, reviewers, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var changeRequestLink;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                changeRequestLink = "/change-requests/".concat(changeRequest.crId);
                return [4 /*yield*/, pop_up_services_1.PopUpService.sendPopUpToUsers("Your review has been requested on CR #".concat(changeRequest.identifier), 'edit_note', reviewers.map(function (reviewer) { return reviewer.userId; }), organizationId, changeRequestLink)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendCrRequestReviewPopUp = sendCrRequestReviewPopUp;
/**
 * Sends a finishline pop up to a user whose review was requested on a part
 * @param partLink link to the part
 * @param partName name of the part
 * @param reviewer user whose review was requested
 * @param organizationId id of the organization of the part
 */
var sendPartReviewRequestPopUp = function (partLink, partName, reviewerId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pop_up_services_1.PopUpService.sendPopUpToUsers("Your review has been requested on ".concat(partName), 'edit_note', [reviewerId], organizationId, partLink)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendPartReviewRequestPopUp = sendPartReviewRequestPopUp;
/**
 * Sends a finishline pop up to a user who is assigned to a part
 * @param partLink link to the part
 * @param partName name of the part
 * @param assignee user who is assigned to the part
 * @param organizationId id of the organization of the part
 */
var sendPartAssignmentPopUp = function (partLink, partName, assigneeId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pop_up_services_1.PopUpService.sendPopUpToUsers("You have been assigned to ".concat(partName), 'edit_note', [assigneeId], organizationId, partLink)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendPartAssignmentPopUp = sendPartAssignmentPopUp;

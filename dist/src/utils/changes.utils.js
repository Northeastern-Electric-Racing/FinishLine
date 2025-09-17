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
exports.getDescriptionBulletChanges = exports.getWorkPackageChanges = exports.createListChanges = exports.createChange = exports.buildChangeDetail = exports.transformBlockedByToChangeListValue = exports.ChangeType = void 0;
var shared_1 = require("shared");
var users_utils_1 = require("./users.utils");
var description_bullets_utils_1 = require("./description-bullets.utils");
var ChangeType;
(function (ChangeType) {
    ChangeType["ADDED"] = "Added new";
    ChangeType["REMOVED"] = "Removed";
    ChangeType["EDITED"] = "Edited";
})(ChangeType || (exports.ChangeType = ChangeType = {}));
var transformBlockedByToChangeListValue = function (blockedBy) {
    return {
        element: blockedBy,
        comparator: "".concat(blockedBy.wbsElementId),
        displayValue: "".concat((0, shared_1.wbsPipe)(blockedBy))
    };
};
exports.transformBlockedByToChangeListValue = transformBlockedByToChangeListValue;
var buildChangeDetail = function (itemChanged, oldValue, newValue) {
    return "Changed ".concat(itemChanged, " from \"").concat(oldValue, "\" to \"").concat(newValue, "\"");
};
exports.buildChangeDetail = buildChangeDetail;
/**
 * returns a change if the old and new value are different, otherwise return undefined
 * @param nameOfField the name of the field being changed
 * @param oldValue the old value of whats being updated
 * @param newValue the new value of whats being updated
 * @param crId the change request id for the CR that is responsible for the change
 * @param implementerId the person implementing the change request
 * @param wbsElementId the wbs element id of whats being changed
 * @returns the change
 */
var createChange = function (nameOfField, oldValue, newValue, crId, implementerId, wbsElementId, categoryId, accountCodeId) {
    if (!crId)
        return undefined;
    if (oldValue == null && newValue !== null && wbsElementId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            wbsElementId: wbsElementId,
            detail: "Added ".concat(nameOfField, " \"").concat(newValue, "\"")
        };
    }
    else if (oldValue == null && newValue !== null && categoryId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            categoryId: categoryId,
            detail: "Added ".concat(nameOfField, " \"").concat(newValue, "\"")
        };
    }
    else if (oldValue == null && newValue !== null && accountCodeId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            accountCodeId: accountCodeId,
            detail: "Added ".concat(nameOfField, " \"").concat(newValue, "\"")
        };
    }
    else if (oldValue !== null && newValue == null && wbsElementId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            wbsElementId: wbsElementId,
            detail: "Deleted ".concat(nameOfField, " \"").concat(oldValue, "\"")
        };
    }
    else if (oldValue !== null && newValue == null && categoryId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            categoryId: categoryId,
            detail: "Deleted ".concat(nameOfField, " \"").concat(oldValue, "\"")
        };
    }
    else if (oldValue !== null && newValue == null && accountCodeId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            accountCodeId: accountCodeId,
            detail: "Deleted ".concat(nameOfField, " \"").concat(oldValue, "\"")
        };
    }
    else if (oldValue !== newValue && wbsElementId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            wbsElementId: wbsElementId,
            detail: (0, exports.buildChangeDetail)(nameOfField, "".concat(oldValue), "".concat(newValue))
        };
    }
    else if (oldValue !== newValue && categoryId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            categoryId: categoryId,
            detail: (0, exports.buildChangeDetail)(nameOfField, "".concat(oldValue), "".concat(newValue))
        };
    }
    else if (oldValue !== newValue && accountCodeId !== null) {
        return {
            changeRequestId: crId,
            implementerId: implementerId,
            accountCodeId: accountCodeId,
            detail: (0, exports.buildChangeDetail)(nameOfField, "".concat(oldValue), "".concat(newValue))
        };
    }
    return undefined;
};
exports.createChange = createChange;
/**
 * this method creates changes for description bullet inputs it returns it as an object of {deletedElements[], addedElements[] changes[]} because the deletedElements are needed for the database and the addedElements are needed to make new ones
 * @param oldArray the old values to be updated
 * @param newArray the new values were updating to
 * @param crId the change request responsible for the changes
 * @param implementerId the id of the person implementing the changes
 * @param wbsElementId the wbs element of whats being affected
 * @param nameOfField the name of the field being changed
 * @returns an object of {deletedElements[], addedElements[] changes[]}
 */
var createListChanges = function (nameOfField, oldArray, newArray, crId, implementerId, wbsElementId) {
    var seenOld = new Map(oldArray.map(function (changeListValue) { return [changeListValue.comparator, changeListValue.displayValue]; }));
    var seenNew = new Map(newArray.map(function (changeListValue) { return [changeListValue.comparator, changeListValue.displayValue]; }));
    var changes = [];
    oldArray.forEach(function (changeListValue) {
        if (!seenNew.has(changeListValue.comparator)) {
            changes.push({ changeListValue: changeListValue, type: ChangeType.REMOVED });
        }
    });
    newArray.forEach(function (changeListValue) {
        if (changeListValue.comparator === '-1' || !seenOld.has(changeListValue.comparator)) {
            changes.push({ changeListValue: changeListValue, type: ChangeType.ADDED });
        }
        else if (seenOld.get(changeListValue.comparator) !== changeListValue.displayValue) {
            changes.push({ changeListValue: changeListValue, type: ChangeType.EDITED });
        }
    });
    return {
        deletedElements: changes
            .filter(function (change) { return change.type === ChangeType.REMOVED; })
            .map(function (removed) { return removed.changeListValue.element; }),
        addedElements: changes
            .filter(function (change) { return change.type === ChangeType.ADDED; })
            .map(function (added) { return added.changeListValue.element; }),
        editedElements: changes
            .filter(function (change) { return change.type === ChangeType.EDITED; })
            .map(function (edited) { return edited.changeListValue.element; }),
        changes: crId
            ? changes.map(function (change) {
                var detail = change.type === ChangeType.EDITED
                    ? (0, exports.buildChangeDetail)(nameOfField, seenOld.get(change.changeListValue.comparator) || 'null', seenNew.get(change.changeListValue.comparator) || 'null')
                    : "".concat(change.type, " ").concat(nameOfField, " \"").concat(change.changeListValue.displayValue, "\"");
                return { changeRequestId: crId, implementerId: implementerId, wbsElementId: wbsElementId, detail: detail };
            })
            : [] // if no crId dont create the changes
    };
};
exports.createListChanges = createListChanges;
var getWorkPackageChanges = function (oldName, newName, oldStage, newStage, oldStartDate, newStartDate, oldDuration, newDuration, oldBlockedBy, newBlockedBy, oldLeadId, newLeadId, oldManagerId, newManagerId, oldDescriptionBullets, newDescriptionBullets, crId, wbsElementId, submitterId) { return __awaiter(void 0, void 0, void 0, function () {
    var changes, nameChangeJson, stageChangeJson, startDateChangeJson, durationChangeJson, blockedByChangeJson, managerChange, _a, _b, leadChange, _c, _d, descriptionBulletChanges;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                changes = [];
                nameChangeJson = (0, exports.createChange)('name', oldName, newName, crId, submitterId, wbsElementId, null, null);
                stageChangeJson = (0, exports.createChange)('stage', oldStage, newStage, crId, submitterId, wbsElementId, null, null);
                startDateChangeJson = (0, exports.createChange)('start date', (oldStartDate === null || oldStartDate === void 0 ? void 0 : oldStartDate.toDateString()) || null, new Date(newStartDate).toDateString(), crId, submitterId, wbsElementId, null, null);
                durationChangeJson = (0, exports.createChange)('duration', oldDuration, newDuration, crId, submitterId, wbsElementId, null, null);
                blockedByChangeJson = (0, exports.createListChanges)('blocked by', oldBlockedBy.map(exports.transformBlockedByToChangeListValue), newBlockedBy.map(exports.transformBlockedByToChangeListValue), crId, submitterId, wbsElementId);
                _a = exports.createChange;
                _b = ['manager'];
                return [4 /*yield*/, (0, users_utils_1.getUserFullName)(oldManagerId)];
            case 1:
                _b = _b.concat([_e.sent()]);
                return [4 /*yield*/, (0, users_utils_1.getUserFullName)(newManagerId)];
            case 2:
                managerChange = _a.apply(void 0, _b.concat([_e.sent(), crId,
                    submitterId,
                    wbsElementId,
                    null,
                    null]));
                _c = exports.createChange;
                _d = ['lead'];
                return [4 /*yield*/, (0, users_utils_1.getUserFullName)(oldLeadId)];
            case 3:
                _d = _d.concat([_e.sent()]);
                return [4 /*yield*/, (0, users_utils_1.getUserFullName)(newLeadId)];
            case 4:
                leadChange = _c.apply(void 0, _d.concat([_e.sent(), crId,
                    submitterId,
                    wbsElementId,
                    null,
                    null]));
                return [4 /*yield*/, (0, exports.getDescriptionBulletChanges)(oldDescriptionBullets, newDescriptionBullets, crId, wbsElementId, submitterId)];
            case 5:
                descriptionBulletChanges = _e.sent();
                // add to changes if not undefined
                if (nameChangeJson)
                    changes.push(nameChangeJson);
                if (startDateChangeJson)
                    changes.push(startDateChangeJson);
                if (durationChangeJson)
                    changes.push(durationChangeJson);
                if (stageChangeJson)
                    changes.push(stageChangeJson);
                if (leadChange)
                    changes.push(leadChange);
                if (managerChange)
                    changes.push(managerChange);
                // add the changes for each of blockers, expected activities, and deliverables
                changes = changes.concat(blockedByChangeJson.changes).concat(descriptionBulletChanges.changes);
                return [2 /*return*/, {
                        changes: changes,
                        deletedBlockedBy: blockedByChangeJson.deletedElements,
                        addedBlockedBy: blockedByChangeJson.addedElements,
                        editedBlockedBy: blockedByChangeJson.editedElements,
                        deletedDescriptionBullets: descriptionBulletChanges.deleted,
                        addedDescriptionBullets: descriptionBulletChanges.added,
                        editedDescriptionBullets: descriptionBulletChanges.edited
                    }];
        }
    });
}); };
exports.getWorkPackageChanges = getWorkPackageChanges;
var getDescriptionBulletChanges = function (oldDescriptionBullets, newDescriptionBullets, crId, wbsElementId, submitterId) { return __awaiter(void 0, void 0, void 0, function () {
    var descriptionBulletsSeparatedByType, descriptionBulletChanges, descriptionBulletDeletions, descriptionBulletAdditions, descriptionBulletEdits, _loop_1, _i, descriptionBulletsSeparatedByType_1, _a, type, descriptionBullets;
    return __generator(this, function (_b) {
        descriptionBulletsSeparatedByType = (0, description_bullets_utils_1.separateDescriptionBulletsByType)(newDescriptionBullets);
        descriptionBulletChanges = [];
        descriptionBulletDeletions = [];
        descriptionBulletAdditions = [];
        descriptionBulletEdits = [];
        _loop_1 = function (type, descriptionBullets) {
            var descriptionBulletsChangeJson = (0, exports.createListChanges)(type, (0, description_bullets_utils_1.descriptionBulletsToChangeListValues)(oldDescriptionBullets.filter(function (ele) { return !ele.dateDeleted && ele.descriptionBulletType.name === type; })), descriptionBullets.map(description_bullets_utils_1.descriptionBulletToChangeListValue), crId, submitterId, wbsElementId);
            descriptionBulletChanges = descriptionBulletChanges.concat(descriptionBulletsChangeJson.changes);
            descriptionBulletDeletions = descriptionBulletDeletions.concat(descriptionBulletsChangeJson.deletedElements);
            descriptionBulletAdditions = descriptionBulletAdditions.concat(descriptionBulletsChangeJson.addedElements);
            descriptionBulletEdits = descriptionBulletEdits.concat(descriptionBulletsChangeJson.editedElements);
        };
        for (_i = 0, descriptionBulletsSeparatedByType_1 = descriptionBulletsSeparatedByType; _i < descriptionBulletsSeparatedByType_1.length; _i++) {
            _a = descriptionBulletsSeparatedByType_1[_i], type = _a[0], descriptionBullets = _a[1];
            _loop_1(type, descriptionBullets);
        }
        return [2 /*return*/, {
                changes: descriptionBulletChanges,
                deleted: descriptionBulletDeletions,
                added: descriptionBulletAdditions,
                edited: descriptionBulletEdits
            }];
    });
}); };
exports.getDescriptionBulletChanges = getDescriptionBulletChanges;

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
exports.linkToChangeListValue = exports.updateLinks = void 0;
var prisma_1 = require("../prisma/prisma");
var errors_utils_1 = require("./errors.utils");
/**
 * updates the given links in the database
 * @param linkChanges The changes to the links
 * @param projectId the project of the links
 * @param userId the user making the changes
 * @param organizationId the organization of the project
 */
var updateLinks = function (linkChanges, wbsElementId, userId, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var promises, editPromises, deletePromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                promises = linkChanges.addedElements.map(function (link) { return __awaiter(void 0, void 0, void 0, function () {
                    var linkType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.link_Type.findUnique({
                                    where: {
                                        uniqueLinkType: { name: link.linkTypeName, organizationId: organizationId }
                                    }
                                })];
                            case 1:
                                linkType = _a.sent();
                                if (!linkType)
                                    throw new errors_utils_1.NotFoundException('Link Type', "".concat(link.linkTypeName));
                                return [4 /*yield*/, prisma_1.default.link.create({
                                        data: {
                                            url: link.url,
                                            linkTypeId: linkType.id,
                                            creatorId: userId,
                                            wbsElementId: wbsElementId
                                        }
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                editPromises = linkChanges.editedElements.map(function (link) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.link.update({
                                    where: {
                                        linkId: link.linkId
                                    },
                                    data: __assign({}, link)
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                deletePromises = linkChanges.deletedElements.map(function (link) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prisma_1.default.link.update({
                                    where: {
                                        linkId: link.linkId
                                    },
                                    data: {
                                        dateDeleted: new Date()
                                    }
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(promises.concat(editPromises).concat(deletePromises))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.updateLinks = updateLinks;
/**
 * transforms the given link to a change list value
 * @param link the link to transform to a change list value
 * @returns the change list value
 */
var linkToChangeListValue = function (link) {
    return {
        element: link,
        comparator: link.linkId,
        displayValue: "".concat(link.linkTypeName, ", ").concat(link.url)
    };
};
exports.linkToChangeListValue = linkToChangeListValue;

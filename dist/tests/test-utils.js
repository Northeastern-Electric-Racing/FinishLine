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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMinimalPartReviewForReview = exports.createMinimalPartReview = exports.createTestPartSubmission = exports.createTestPartReview = exports.createTestPart = exports.createSlackMessageEvent = exports.createTestTaskWithOrganization = exports.createTestTask = exports.createTestTeam = exports.createTestTeamType = exports.createTestDesignReview = exports.createTestReimbursementRequest = exports.createTestProject = exports.createTestCar = exports.createTestLinkType = exports.createTestChecklist = exports.createTestMilestone = exports.createTestFaq = exports.createTestProjectTemplate = exports.createTestWorkPackageTemplate = exports.createTestOrganization = exports.createTestFAQ = exports.createFinanceTeamAndLead = exports.resetUsers = exports.createTestUser = void 0;
/* eslint-disable prefer-destructuring */
var client_1 = require("@prisma/client");
var prisma_1 = require("../src/prisma/prisma");
var users_seed_1 = require("../src/prisma/seed-data/users.seed");
var teams_services_1 = require("../src/services/teams.services");
var reimbursement_requests_services_1 = require("../src/services/reimbursement-requests.services");
var shared_1 = require("shared");
var users_test_data_1 = require("./test-data/users.test-data");
var wbs_element_template_query_args_1 = require("../src/prisma-query-args/wbs-element-template.query-args");
var design_reviews_services_1 = require("../src/services/design-reviews.services");
var tasks_services_1 = require("../src/services/tasks.services");
var projects_services_1 = require("../src/services/projects.services");
var createTestUser = function (_a, organizationId_1, userSettings_1, userSecureSettings_1, scheduleSettings_1) { return __awaiter(void 0, [_a, organizationId_1, userSettings_1, userSecureSettings_1, scheduleSettings_1], void 0, function (_b, organizationId, userSettings, userSecureSettings, scheduleSettings) {
    var createdUser;
    var firstName = _b.firstName, lastName = _b.lastName, email = _b.email, emailId = _b.emailId, googleAuthId = _b.googleAuthId, role = _b.role, permissions = _b.permissions;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.create({
                    data: {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        emailId: emailId,
                        googleAuthId: googleAuthId,
                        roles: {
                            create: {
                                roleType: role,
                                organizationId: organizationId
                            }
                        },
                        additionalPermissions: permissions,
                        organizations: { connect: { organizationId: organizationId } }
                    }
                })];
            case 1:
                createdUser = _c.sent();
                if (!userSettings) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma_1.default.user_Settings.create({
                        data: __assign(__assign({}, userSettings), { userId: createdUser.userId })
                    })];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                if (!userSecureSettings) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma_1.default.user_Secure_Settings.create({
                        data: __assign(__assign({}, userSecureSettings), { userId: createdUser.userId })
                    })];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                if (!scheduleSettings) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma_1.default.schedule_Settings.create({
                        data: __assign(__assign({}, scheduleSettings), { userId: createdUser.userId })
                    })];
            case 6:
                _c.sent();
                _c.label = 7;
            case 7: return [2 /*return*/, createdUser];
        }
    });
}); };
exports.createTestUser = createTestUser;
var resetUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.part_Review_Popup.deleteMany()];
            case 1:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Review_Request.deleteMany()];
            case 2:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Review.deleteMany()];
            case 3:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Submission.deleteMany()];
            case 4:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Review_Common_Mistake.deleteMany()];
            case 5:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Tag.deleteMany()];
            case 6:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part.deleteMany()];
            case 7:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.work_Package.deleteMany()];
            case 8:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Review_Common_Mistake.deleteMany()];
            case 9:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Tag.deleteMany()];
            case 10:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Review_Popup.deleteMany()];
            case 11:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Review.deleteMany()];
            case 12:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part_Submission.deleteMany()];
            case 13:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.part.deleteMany()];
            case 14:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.project.deleteMany()];
            case 15:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.frequentlyAskedQuestion.deleteMany()];
            case 16:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.material.deleteMany()];
            case 17:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.manufacturer.deleteMany()];
            case 18:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.material_Type.deleteMany()];
            case 19:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.assembly.deleteMany()];
            case 20:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.team.deleteMany()];
            case 21:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.user_Secure_Settings.deleteMany()];
            case 22:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.reimbursement_Product.deleteMany()];
            case 23:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.reimbursement_Status.deleteMany()];
            case 24:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.reimbursement_Request_Comment.deleteMany()];
            case 25:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.reimbursement_Request.deleteMany()];
            case 26:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.vendor.deleteMany()];
            case 27:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.account_Code.deleteMany()];
            case 28:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.car.deleteMany()];
            case 29:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.task.deleteMany()];
            case 30:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.stage_Gate_CR.deleteMany()];
            case 31:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.activation_CR.deleteMany()];
            case 32:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.change.deleteMany()];
            case 33:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.proposed_Solution.deleteMany()];
            case 34:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.scope_CR_Why.deleteMany()];
            case 35:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.scope_CR.deleteMany()];
            case 36:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.budget_CR.deleteMany()];
            case 37:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.change_Request.deleteMany()];
            case 38:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.link.deleteMany()];
            case 39:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.link_Type.deleteMany()];
            case 40:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.work_Package_Template.deleteMany()];
            case 41:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.project_Template.deleteMany()];
            case 42:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.wBS_Element_Template.deleteMany()];
            case 43:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.user_Settings.deleteMany()];
            case 44:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.session.deleteMany()];
            case 45:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.user_Secure_Settings.deleteMany()];
            case 46:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.schedule_Settings.deleteMany()];
            case 47:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.role.deleteMany()];
            case 48:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.design_Review.deleteMany()];
            case 49:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.team_Type.deleteMany()];
            case 50:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.wBS_Element.deleteMany()];
            case 51:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.milestone.deleteMany()];
            case 52:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.checklist.deleteMany()];
            case 53:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.contact.deleteMany()];
            case 54:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.graph.deleteMany()];
            case 55:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.graph_Collection.deleteMany()];
            case 56:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.announcement.deleteMany()];
            case 57:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.popUp.deleteMany()];
            case 58:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.sponsor_Task.deleteMany()];
            case 59:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.sponsor.deleteMany()];
            case 60:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.sponsor_Tier.deleteMany()];
            case 61:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.reimbursement_Product_Other_Reason.deleteMany()];
            case 62:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.account_Code.deleteMany()];
            case 63:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.refund_Source.deleteMany()];
            case 64:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.index_Code.deleteMany()];
            case 65:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.organization.deleteMany()];
            case 66:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.user.deleteMany()];
            case 67:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.resetUsers = resetUsers;
var createFinanceTeamAndLead = function (organization) { return __awaiter(void 0, void 0, void 0, function () {
    var head, lead, financeMember, team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organization) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)()];
            case 1:
                organization = _a.sent();
                _a.label = 2;
            case 2: return [4 /*yield*/, (0, exports.createTestUser)(__assign(__assign({}, users_test_data_1.batmanAppAdmin), { googleAuthId: 'financeHead', role: shared_1.RoleEnum.APP_ADMIN }), organization.organizationId, users_test_data_1.batmanSettings, users_test_data_1.batmanSecureSettings, users_test_data_1.batmanScheduleSettings)];
            case 3:
                head = _a.sent();
                return [4 /*yield*/, (0, exports.createTestUser)(__assign(__assign({}, users_seed_1.dbSeedAllUsers.aang), { googleAuthId: 'financeLead', role: shared_1.RoleEnum.LEADERSHIP, permissions: users_seed_1.dbSeedAllUsers.aang.additionalPermissions }), organization.organizationId)];
            case 4:
                lead = _a.sent();
                return [4 /*yield*/, (0, exports.createTestUser)(__assign(__assign({}, users_seed_1.dbSeedAllUsers.johnBoddy), { googleAuthId: 'financeMember', role: shared_1.RoleEnum.MEMBER, permissions: users_seed_1.dbSeedAllUsers.aang.additionalPermissions }), organization.organizationId)];
            case 5:
                financeMember = _a.sent();
                return [4 /*yield*/, teams_services_1.default.createTeam(head, 'Finance Team', head.userId, 'Finance Team', '', true, organization)];
            case 6:
                team = _a.sent();
                return [4 /*yield*/, teams_services_1.default.setTeamLeads(head, team.teamId, [lead.userId], organization)];
            case 7:
                _a.sent();
                return [4 /*yield*/, teams_services_1.default.setTeamMembers(head, team.teamId, [financeMember.userId], organization)];
            case 8:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createFinanceTeamAndLead = createFinanceTeamAndLead;
var createTestFAQ = function (orgId, faqId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.create({
                    data: {
                        firstName: 'ADMIN',
                        lastName: 'FAQ',
                        email: 'FAQCREATOR@gmail.com',
                        googleAuthId: 'FAQCREATOR'
                    }
                })];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, prisma_1.default.frequentlyAskedQuestion.create({
                        data: {
                            faqId: faqId,
                            question: 'Joe mama',
                            answer: 'Joe mama`s organization',
                            userCreated: {
                                connect: {
                                    userId: user.userId
                                }
                            },
                            regularFaqOrg: {
                                connect: {
                                    organizationId: orgId
                                }
                            }
                        }
                    })];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createTestFAQ = createTestFAQ;
var createTestOrganization = function () { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.create({
                    data: {
                        firstName: 'Admin',
                        lastName: 'User',
                        email: '',
                        googleAuthId: 'organizationCreator'
                    }
                })];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, prisma_1.default.organization.create({
                        data: {
                            name: 'Joe mama',
                            description: 'Joe mama`s organization',
                            applicationLink: '',
                            userCreated: {
                                connect: {
                                    userId: user.userId
                                }
                            }
                        }
                    })];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createTestOrganization = createTestOrganization;
var createTestWorkPackageTemplate = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var workPackageTemplate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = _a.sent();
                _a.label = 2;
            case 2:
                if (!organizationId)
                    throw new Error('Failed to create organization');
                return [4 /*yield*/, prisma_1.default.work_Package_Template.create(__assign({ data: {
                            wbsElementTemplate: {
                                create: {
                                    templateName: 'Template 1',
                                    templateNotes: 'This is a new work package template',
                                    organization: { connect: { organizationId: organizationId } },
                                    userCreated: { connect: { userId: user.userId } },
                                    wbsElementName: 'Work Package 1',
                                    dateCreated: new Date('03/25/2024')
                                }
                            }
                        } }, (0, wbs_element_template_query_args_1.getWorkPackageTemplateQueryArgs)(organizationId)))];
            case 3:
                workPackageTemplate = _a.sent();
                return [2 /*return*/, workPackageTemplate];
        }
    });
}); };
exports.createTestWorkPackageTemplate = createTestWorkPackageTemplate;
var createTestProjectTemplate = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var projectTemplate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = _a.sent();
                _a.label = 2;
            case 2:
                if (!organizationId)
                    throw new Error('Failed to create organization');
                return [4 /*yield*/, prisma_1.default.project_Template.create(__assign({ data: {
                            wbsElementTemplate: {
                                create: {
                                    templateName: 'Template 1',
                                    templateNotes: 'This is a new project template',
                                    organization: { connect: { organizationId: organizationId } },
                                    userCreated: { connect: { userId: user.userId } }
                                }
                            }
                        } }, (0, wbs_element_template_query_args_1.getProjectTemplateQueryArgs)(organizationId)))];
            case 3:
                projectTemplate = _a.sent();
                return [2 /*return*/, projectTemplate];
        }
    });
}); };
exports.createTestProjectTemplate = createTestProjectTemplate;
var createTestFaq = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var faq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = _a.sent();
                _a.label = 2;
            case 2:
                if (!organizationId)
                    throw new Error('Failed to create organization');
                return [4 /*yield*/, prisma_1.default.frequentlyAskedQuestion.create({
                        data: {
                            question: 'Who is Chief Software Engineer of NER?',
                            answer: 'Peyton McKee!',
                            regularFaqOrgId: organizationId,
                            userCreatedId: user.userId
                        }
                    })];
            case 3:
                faq = _a.sent();
                return [2 /*return*/, faq];
        }
    });
}); };
exports.createTestFaq = createTestFaq;
var createTestMilestone = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var milestone;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = _a.sent();
                _a.label = 2;
            case 2:
                if (!organizationId)
                    throw new Error('Failed to create organization');
                return [4 /*yield*/, prisma_1.default.milestone.create({
                        data: {
                            name: 'Milestone 1',
                            description: 'Description',
                            dateOfEvent: new Date('03/03/2024'),
                            organizationId: organizationId,
                            userCreatedId: user.userId
                        }
                    })];
            case 3:
                milestone = _a.sent();
                return [2 /*return*/, milestone];
        }
    });
}); };
exports.createTestMilestone = createTestMilestone;
var createTestChecklist = function (user, organizationId, name, teamTypeId, teamId, parentChecklistId) { return __awaiter(void 0, void 0, void 0, function () {
    var checklist;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = _a.sent();
                _a.label = 2;
            case 2:
                if (!organizationId)
                    throw new Error('Failed to create checklist');
                return [4 /*yield*/, prisma_1.default.checklist.create({
                        data: {
                            name: name,
                            organizationId: organizationId,
                            userCreatedId: user.userId,
                            teamTypeId: teamTypeId,
                            teamId: teamId,
                            parentChecklistId: parentChecklistId
                        },
                        include: {
                            subtasks: true,
                            teamType: true,
                            usersChecked: true
                        }
                    })];
            case 3:
                checklist = _a.sent();
                return [2 /*return*/, checklist];
        }
    });
}); };
exports.createTestChecklist = createTestChecklist;
var createTestLinkType = function (user, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var linkType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = _a.sent();
                _a.label = 2;
            case 2:
                if (!organizationId)
                    throw new Error('Failed to create organization');
                return [4 /*yield*/, prisma_1.default.link_Type.create({
                        data: {
                            name: 'Link type 1',
                            dateCreated: new Date('03/25/2024'),
                            iconName: 'youtube icon',
                            required: true,
                            creatorId: user.userId,
                            organizationId: organizationId
                        }
                    })];
            case 3:
                linkType = _a.sent();
                return [2 /*return*/, linkType];
        }
    });
}); };
exports.createTestLinkType = createTestLinkType;
var createTestCar = function (orgId, userIdentification) { return __awaiter(void 0, void 0, void 0, function () {
    var car;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!orgId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)()];
            case 1:
                orgId = (_a.sent()).organizationId;
                _a.label = 2;
            case 2:
                if (!!userIdentification) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, exports.createTestUser)(users_test_data_1.supermanAdmin, orgId)];
            case 3:
                userIdentification = (_a.sent()).userId;
                _a.label = 4;
            case 4: return [4 /*yield*/, prisma_1.default.car.create({
                    data: {
                        wbsElement: {
                            create: {
                                carNumber: 0,
                                projectNumber: 0,
                                workPackageNumber: 0,
                                dateCreated: new Date('01/01/2023'),
                                name: 'Car',
                                status: client_1.WBS_Element_Status.INACTIVE,
                                leadId: userIdentification,
                                managerId: userIdentification,
                                organizationId: orgId
                            }
                        }
                    }
                })];
            case 5:
                car = _a.sent();
                return [2 /*return*/, car];
        }
    });
}); };
exports.createTestCar = createTestCar;
var createTestProject = function (user_1, organizationId_1, teamId_1, carId_1) {
    var args_1 = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args_1[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([user_1, organizationId_1, teamId_1, carId_1], args_1, true), void 0, function (user, organizationId, teamId, carId, projectNumber, dateDeleted) {
        var genesisProject;
        if (projectNumber === void 0) { projectNumber = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!organizationId) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.createTestOrganization)()];
                case 1:
                    organizationId = (_a.sent()).organizationId;
                    _a.label = 2;
                case 2:
                    if (!!carId) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, exports.createTestCar)(organizationId, user.userId)];
                case 3:
                    carId = (_a.sent()).carId;
                    _a.label = 4;
                case 4: return [4 /*yield*/, prisma_1.default.project.create({
                        data: {
                            wbsElement: {
                                create: {
                                    carNumber: 0,
                                    projectNumber: projectNumber,
                                    workPackageNumber: 0,
                                    dateCreated: new Date('01/01/2023'),
                                    name: 'Genesis',
                                    status: client_1.WBS_Element_Status.INACTIVE,
                                    leadId: user.userId,
                                    managerId: user.userId,
                                    organizationId: organizationId,
                                    dateDeleted: dateDeleted !== null && dateDeleted !== void 0 ? dateDeleted : null
                                }
                            },
                            car: {
                                connect: {
                                    carId: carId
                                }
                            },
                            summary: 'Initial Car so that we can make change requests and projects and other stuff',
                            budget: 1000
                        }
                    })];
                case 5:
                    genesisProject = _a.sent();
                    if (!teamId) return [3 /*break*/, 7];
                    return [4 /*yield*/, prisma_1.default.project.update({
                            where: {
                                projectId: genesisProject.projectId
                            },
                            data: {
                                teams: {
                                    connect: {
                                        teamId: teamId
                                    }
                                }
                            }
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, genesisProject];
            }
        });
    });
};
exports.createTestProject = createTestProject;
var createTestReimbursementRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var organization, user, project, vendor, indexCode, accountCode, rr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.createTestOrganization)()];
            case 1:
                organization = _a.sent();
                return [4 /*yield*/, (0, exports.createFinanceTeamAndLead)(organization)];
            case 2:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: {
                            googleAuthId: 'financeHead'
                        },
                        include: {
                            userSettings: true,
                            userSecureSettings: true
                        }
                    })];
            case 3:
                user = _a.sent();
                if (!user || !user.userSecureSettings || !user.userSettings)
                    throw new Error('Failed to find user');
                return [4 /*yield*/, (0, exports.createTestProject)(user, organization.organizationId)];
            case 4:
                project = _a.sent();
                return [4 /*yield*/, reimbursement_requests_services_1.default.createVendor(user, 'Tesla', organization, true, [user.userId], 'Tax exemption status?', 'nershipping@gmail.com', 'racecar228!', 'SAVE50!')];
            case 5:
                vendor = _a.sent();
                return [4 /*yield*/, reimbursement_requests_services_1.default.createIndexCode('CASH', '830667', user, organization)];
            case 6:
                indexCode = _a.sent();
                return [4 /*yield*/, reimbursement_requests_services_1.default.createAccountCode(user, 'Equipment', 123, true, [indexCode.indexCodeId], organization)];
            case 7:
                accountCode = _a.sent();
                return [4 /*yield*/, reimbursement_requests_services_1.default.createReimbursementRequest(user, vendor.vendorId, indexCode.indexCodeId, [], [
                        {
                            name: 'GLUE',
                            reason: {
                                carNumber: 0,
                                projectNumber: 0,
                                workPackageNumber: 0
                            },
                            cost: 200000,
                            refundSources: [
                                {
                                    indexCode: indexCode,
                                    amount: 200
                                }
                            ]
                        }
                    ], accountCode.accountCodeId, 100, organization, new Date())];
            case 8:
                rr = _a.sent();
                if (!rr)
                    throw new Error('Failed to create reimbursement request');
                return [2 /*return*/, { rr: rr, organization: organization, vendor: vendor, indexCode: indexCode, accountCode: accountCode, project: project, user: user }];
        }
    });
}); };
exports.createTestReimbursementRequest = createTestReimbursementRequest;
// Always creates a new design review
var createTestDesignReview = function () { return __awaiter(void 0, void 0, void 0, function () {
    var organization, head, lead, teamType, designReviewId, dr, orgId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.createTestOrganization)()];
            case 1:
                organization = _a.sent();
                return [4 /*yield*/, (0, exports.createTestUser)(__assign(__assign({}, users_test_data_1.batmanAppAdmin), { googleAuthId: 'financeHead', role: shared_1.RoleEnum.APP_ADMIN }), organization.organizationId)];
            case 2:
                head = _a.sent();
                return [4 /*yield*/, (0, exports.createTestUser)(__assign(__assign({}, users_seed_1.dbSeedAllUsers.aang), { googleAuthId: 'financeLead', role: shared_1.RoleEnum.LEADERSHIP, permissions: users_seed_1.dbSeedAllUsers.aang.additionalPermissions }), organization.organizationId)];
            case 3:
                lead = _a.sent();
                if (!head)
                    throw new Error('Failed to find user');
                if (!lead)
                    throw new Error('Failed to find user');
                return [4 /*yield*/, (0, exports.createTestProject)(head, organization.organizationId)];
            case 4:
                _a.sent();
                return [4 /*yield*/, teams_services_1.default.createTeamType(head, 'Team1', 'Software', 'Software team', organization)];
            case 5:
                teamType = _a.sent();
                return [4 /*yield*/, design_reviews_services_1.default.createDesignReview(lead, '03/25/2027', teamType.teamTypeId, [lead.userId], [], {
                        carNumber: 0,
                        projectNumber: 0,
                        workPackageNumber: 0
                    }, [0, 1], organization)];
            case 6:
                designReviewId = (_a.sent()).designReviewId;
                return [4 /*yield*/, prisma_1.default.design_Review.findUnique({
                        where: {
                            designReviewId: designReviewId
                        },
                        include: {
                            userCreated: true
                        }
                    })];
            case 7:
                dr = _a.sent();
                if (!dr)
                    throw new Error('Failed to create design review');
                orgId = organization.organizationId;
                return [2 /*return*/, { dr: dr, organization: organization, orgId: orgId }];
        }
    });
}); };
exports.createTestDesignReview = createTestDesignReview;
var createTestTeamType = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (name, organizationId) {
        var orgId;
        if (name === void 0) { name = 'aTeam'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orgId = organizationId;
                    if (!!organizationId) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.createTestOrganization)()];
                case 1:
                    orgId = (_a.sent()).organizationId;
                    _a.label = 2;
                case 2: return [4 /*yield*/, prisma_1.default.team_Type.create({
                        data: {
                            name: name,
                            description: 'aDescription',
                            iconName: 'gear',
                            organizationId: orgId
                        }
                    })];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createTestTeamType = createTestTeamType;
var createTestTeam = function (headId, divId, orgId) { return __awaiter(void 0, void 0, void 0, function () {
    var division, team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!divId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestTeamType)(orgId)];
            case 1:
                division = _a.sent();
                divId = division.teamTypeId;
                orgId = division.organizationId;
                return [3 /*break*/, 4];
            case 2:
                if (!!orgId) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, exports.createTestOrganization)()];
            case 3:
                orgId = (_a.sent()).organizationId;
                _a.label = 4;
            case 4:
                if (!!headId) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, exports.createTestUser)(users_test_data_1.supermanAdmin, orgId)];
            case 5:
                headId = (_a.sent()).userId;
                _a.label = 6;
            case 6: return [4 /*yield*/, prisma_1.default.team.create({
                    data: {
                        teamName: 'aTeamName',
                        slackId: 'aSlackId',
                        description: 'aDescription',
                        financeTeam: false,
                        headId: headId,
                        teamTypeId: divId,
                        organizationId: orgId
                    }
                })];
            case 7:
                team = _a.sent();
                return [2 /*return*/, team];
        }
    });
}); };
exports.createTestTeam = createTestTeam;
var createTestTask = function (user, title, notes, assignees, priority, status, organizationId, deadline) { return __awaiter(void 0, void 0, void 0, function () {
    var task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organizationId) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)().then(function (org) { return org.organizationId; })];
            case 1:
                organizationId = (_a.sent());
                _a.label = 2;
            case 2: return [4 /*yield*/, prisma_1.default.task.create({
                    data: {
                        taskId: '0000000001',
                        title: title,
                        notes: notes,
                        deadline: deadline,
                        assignees: {
                            connect: assignees.map(function (user) { return ({ userId: user.userId }); })
                        },
                        priority: priority,
                        status: status,
                        dateCreated: new Date(),
                        createdBy: {
                            connect: { userId: user.userId }
                        },
                        wbsElement: {
                            create: {
                                carNumber: 0,
                                projectNumber: 0,
                                workPackageNumber: 0,
                                dateCreated: new Date('01/01/2023'),
                                name: 'Car',
                                status: client_1.WBS_Element_Status.INACTIVE,
                                leadId: user.userId,
                                managerId: user.userId,
                                organizationId: organizationId
                            }
                        }
                    }
                })];
            case 3:
                task = _a.sent();
                return [2 /*return*/, task];
        }
    });
}); };
exports.createTestTask = createTestTask;
var createTestTaskWithOrganization = function (user, organization) { return __awaiter(void 0, void 0, void 0, function () {
    var orgId, team, project, task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!organization) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.createTestOrganization)()];
            case 1:
                organization = _a.sent();
                _a.label = 2;
            case 2:
                orgId = organization.organizationId;
                return [4 /*yield*/, teams_services_1.default.createTeam(user, 'Test team', user.userId, 'Test', '', false, organization)];
            case 3:
                team = _a.sent();
                if (!team)
                    throw new Error('Failed to create team');
                return [4 /*yield*/, (0, exports.createTestProject)(user, organization.organizationId)];
            case 4:
                project = _a.sent();
                if (!project)
                    throw new Error('Failed to create project');
                return [4 /*yield*/, projects_services_1.default.setProjectTeam(user, {
                        carNumber: 0,
                        projectNumber: 1,
                        workPackageNumber: 0
                    }, team.teamId, organization)];
            case 5:
                _a.sent();
                return [4 /*yield*/, tasks_services_1.default.createTask(user, {
                        carNumber: 0,
                        projectNumber: 1,
                        workPackageNumber: 0
                    }, 'Test task', 'Test', shared_1.TaskPriority.High, shared_1.TaskStatus.IN_PROGRESS, [user.userId], organization, new Date())];
            case 6:
                task = _a.sent();
                if (!task)
                    throw new Error('Failed to create task');
                return [2 /*return*/, { task: task, organization: organization, orgId: orgId }];
        }
    });
}); };
exports.createTestTaskWithOrganization = createTestTaskWithOrganization;
var createSlackMessageEvent = function (channel, event_ts, user, client_msg_id, elements) {
    return {
        type: 'message',
        channel: channel,
        event_ts: event_ts,
        channel_type: 'channel',
        user: user,
        client_msg_id: client_msg_id,
        text: 'sample text',
        blocks: [
            {
                type: 'rich_text',
                block_id: 'block id',
                elements: [
                    {
                        type: 'rich_text_section',
                        elements: elements
                    }
                ]
            }
        ]
    };
};
exports.createSlackMessageEvent = createSlackMessageEvent;
var createTestPart = function (user, name, partId, index, projectId, dateDeleted) { return __awaiter(void 0, void 0, void 0, function () {
    var part;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.part.create({
                    data: {
                        partId: partId,
                        index: index,
                        commonName: name,
                        project: {
                            connect: { projectId: projectId }
                        },
                        userCreated: {
                            connect: { userId: user.userId }
                        },
                        dateDeleted: dateDeleted !== null && dateDeleted !== void 0 ? dateDeleted : null
                    }
                })];
            case 1:
                part = _a.sent();
                return [2 /*return*/, part];
        }
    });
}); };
exports.createTestPart = createTestPart;
var createTestPartReview = function (partReviewId, fileIds, notes, submission, popUps, userCreatedId) { return __awaiter(void 0, void 0, void 0, function () {
    var partReview;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.part_Review.create({
                    data: {
                        partReviewId: partReviewId,
                        fileIds: fileIds,
                        notes: notes,
                        submission: {
                            connect: {
                                partSubmissionId: submission.partSubmissionId
                            }
                        },
                        popUps: {
                            connect: popUps.map(function (popup) { return ({ partReviewPopupId: popup.partReviewPopupId }); })
                        },
                        userCreated: {
                            connect: { userId: userCreatedId }
                        }
                    }
                })];
            case 1:
                partReview = _a.sent();
                return [2 /*return*/, partReview];
        }
    });
}); };
exports.createTestPartReview = createTestPartReview;
var createTestPartSubmission = function (id, fileIds, name, notes, partId, userCreatedId, reviews) { return __awaiter(void 0, void 0, void 0, function () {
    var partSubmission;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.part_Submission.create({
                    data: {
                        partSubmissionId: id,
                        fileIds: fileIds,
                        name: name,
                        notes: notes,
                        part: {
                            connect: { partId: partId }
                        },
                        userCreated: {
                            connect: { userId: userCreatedId }
                        },
                        reviews: {
                            connect: reviews.map(function (review) { return ({ partReviewId: review.partReviewId }); })
                        }
                    }
                })];
            case 1:
                partSubmission = _a.sent();
                return [2 /*return*/, partSubmission];
        }
    });
}); };
exports.createTestPartSubmission = createTestPartSubmission;
var createMinimalPartReview = function (user, orgId) { return __awaiter(void 0, void 0, void 0, function () {
    var car, project, part, submission, review;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.createTestCar)(orgId, user.userId)];
            case 1:
                car = _a.sent();
                return [4 /*yield*/, (0, exports.createTestProject)(user, orgId, undefined, car.carId)];
            case 2:
                project = _a.sent();
                return [4 /*yield*/, prisma_1.default.part.create({
                        data: {
                            index: 1,
                            commonName: 'Test Part',
                            description: 'For testing popups',
                            projectId: project.projectId,
                            userCreatedId: user.userId
                        }
                    })];
            case 3:
                part = _a.sent();
                return [4 /*yield*/, (0, exports.createTestPartSubmission)('sub-id', [], 'Submission Name', 'Some notes', part.partId, user.userId, [])];
            case 4:
                submission = _a.sent();
                return [4 /*yield*/, (0, exports.createTestPartReview)('review-id', [], 'Review notes', submission, [], user.userId)];
            case 5:
                review = _a.sent();
                return [2 /*return*/, review];
        }
    });
}); };
exports.createMinimalPartReview = createMinimalPartReview;
var createMinimalPartReviewForReview = function (user, orgId) { return __awaiter(void 0, void 0, void 0, function () {
    var car, project, part, submission, review;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.createTestCar)(orgId, user.userId)];
            case 1:
                car = _a.sent();
                return [4 /*yield*/, (0, exports.createTestProject)(user, orgId, undefined, car.carId)];
            case 2:
                project = _a.sent();
                return [4 /*yield*/, prisma_1.default.part.create({
                        data: {
                            index: 1,
                            commonName: 'Test Part',
                            description: 'For testing popups',
                            projectId: project.projectId,
                            userCreatedId: user.userId
                        }
                    })];
            case 3:
                part = _a.sent();
                return [4 /*yield*/, (0, exports.createTestPartSubmission)('sub-id', [], 'Submission Name', 'Some notes', part.partId, user.userId, [])];
            case 4:
                submission = _a.sent();
                return [4 /*yield*/, (0, exports.createTestPartReview)('review-id', [], 'Review notes', submission, [], user.userId)];
            case 5:
                review = _a.sent();
                return [2 /*return*/, { review: review, partId: part.partId }];
        }
    });
}); };
exports.createMinimalPartReviewForReview = createMinimalPartReviewForReview;

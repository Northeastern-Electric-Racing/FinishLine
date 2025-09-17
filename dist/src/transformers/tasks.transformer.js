"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var tasks_utils_1 = require("../utils/tasks.utils");
var user_transformer_1 = require("./user.transformer");
var taskTransformer = function (task) {
    var _a, _b;
    var wbsNum = (0, utils_1.wbsNumOf)(task.wbsElement);
    return {
        taskId: task.taskId,
        wbsNum: wbsNum,
        title: task.title,
        notes: task.notes,
        deadline: (_a = task.deadline) !== null && _a !== void 0 ? _a : undefined,
        priority: (0, tasks_utils_1.convertTaskPriority)(task.priority),
        status: (0, tasks_utils_1.convertTaskStatus)(task.status),
        createdBy: (0, user_transformer_1.userTransformer)(task.createdBy),
        assignees: task.assignees.map(user_transformer_1.userTransformer),
        dateDeleted: (_b = task.dateDeleted) !== null && _b !== void 0 ? _b : undefined,
        dateCreated: task.dateCreated,
        deletedBy: task.deletedBy ? (0, user_transformer_1.userTransformer)(task.deletedBy) : undefined
    };
};
exports.default = taskTransformer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHours = exports.transformStartTime = exports.isUserOnDesignReview = exports.validateMeetingTimes = void 0;
var errors_utils_1 = require("./errors.utils");
/**
 * Validate meeting times
 * @param nums the meeting times
 * @returns the meeting times
 */
var validateMeetingTimes = function (nums) {
    if (nums.length === 0) {
        throw new errors_utils_1.HttpException(400, 'There must be at least one meeting time');
    }
    for (var i = 0; i < nums.length; i++) {
        if (nums[i] < 0 || nums[i] > 11) {
            throw new errors_utils_1.HttpException(400, 'Meeting times have to be in range 0-11');
        }
        if (i > 0 && nums[i] !== nums[i - 1] + 1) {
            throw new errors_utils_1.HttpException(400, 'Meeting times have to be consecutive');
        }
    }
    return nums;
};
exports.validateMeetingTimes = validateMeetingTimes;
var isUserOnDesignReview = function (user, designReview) {
    var requiredMembers = designReview.requiredMembers.map(function (user) { return user.userId; });
    var optionalMembers = designReview.optionalMembers.map(function (user) { return user.userId; });
    return requiredMembers.includes(user.userId) || optionalMembers.includes(user.userId);
};
exports.isUserOnDesignReview = isUserOnDesignReview;
var transformStartTime = function (times) {
    return (times[0] % 12) + 10;
};
exports.transformStartTime = transformStartTime;
var addHours = function (date, hours) {
    var hoursToAdd = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + hoursToAdd);
    return date;
};
exports.addHours = addHours;

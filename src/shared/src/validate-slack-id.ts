/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Slack user ids start with U (or W for some older enterprise grid accounts), followed by
// 8-10 uppercase alphanumeric characters. This is a format check only -- it does not confirm
// the id actually exists in the workspace.
const SLACK_USER_ID_REGEX = /^[UW][A-Z0-9]{8,10}$/;

/**
 * Checks whether a string looks like a valid Slack user id, by format only (no Slack API call)
 * @param slackId the string to check
 */
export const isValidSlackUserIdFormat = (slackId: string): boolean => SLACK_USER_ID_REGEX.test(slackId);

import * as z from 'zod/v4';
import UsersService from '../services/users.services.js';
import { withToolErrors } from './errors.js';
import { registerReadOnlyTool, ToolRegistrar } from './tools.utils.js';

export const registerUserTools: ToolRegistrar = (server, { organization }) => {
  registerReadOnlyTool(
    server,
    'finishline_get_user_slack_id',
    {
      title: 'Get user Slack id',
      description:
        "Get a FinishLine user's Slack member id so you can mention them in Slack. Users returned by the " +
        'other tools (leads, managers, assignees, event creators) carry a userId to pass here.\n\n' +
        'Whenever you refer to a person in a Slack message, prefer mentioning them over writing their name: ' +
        'look up their slackId here and write it as <@SLACK_ID>, for example <@U0123456789>, which Slack ' +
        'renders as a mention that notifies them. Use the slackId exactly as returned, inside the angle ' +
        'brackets with the @, and never the FinishLine userId. slackId is absent when the user has not ' +
        'linked their Slack account; only then fall back to writing their first and last name as plain text.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('The userId of a user returned by another FinishLine tool.')
      })
    },
    async ({ userId }) =>
      withToolErrors('Pass a userId returned by another FinishLine tool.', async () => {
        // getSingleUser is what confirms the user is in this organization; getUserSettings alone is not scoped
        await UsersService.getSingleUser(userId, organization);
        const { slackId } = await UsersService.getUserSettings(userId);

        // slackId defaults to an empty string, which means the user never linked Slack
        return { userId, slackId: slackId || undefined };
      })
  );
};

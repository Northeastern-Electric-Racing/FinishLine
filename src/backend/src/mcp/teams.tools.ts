import * as z from 'zod/v4';
import TeamsService from '../services/teams.services.js';
import { withToolErrors } from './errors.js';
import { registerWriteTool, ToolRegistrar } from './tools.utils.js';

export const registerTeamTools: ToolRegistrar = (server, { user, organization }) => {
  registerWriteTool(
    server,
    'finishline_create_team',
    {
      title: 'Create team',
      description:
        'Create a new team in the organization. Only admins can create teams; the call fails for anyone ' +
        'else. Confirm the team name, head, and Slack channel with the user before calling, since a team ' +
        'cannot be deleted through this API. Returns the created team.',
      inputSchema: z.object({
        teamName: z
          .string()
          .min(1)
          .describe('The name of the new team. Must not match the name of an existing team in the organization.'),
        headId: z
          .string()
          .min(1)
          .describe(
            'The user id of the team head. That user must already hold the head role or higher. Ask the user ' +
              'for this id if you do not have it; do not guess one.'
          ),
        slackId: z
          .string()
          .regex(/^[CG][A-Z0-9]{8,}$/, 'slackId must be a Slack channel id, such as C0123456789')
          .describe("The Slack channel id of the team's channel, such as C0123456789. Not the channel's name."),
        description: z.string().min(1).describe('A short description of the team, under 300 words.'),
        isFinanceTeam: z
          .boolean()
          .describe('Whether this is the finance team. An organization can have only one, so this is almost always false.')
      })
    },
    { destructive: false },
    async ({ teamName, headId, slackId, description, isFinanceTeam }) =>
      withToolErrors(
        'Check that the head id belongs to a head or higher and that the team name is not already taken.',
        async () => TeamsService.createTeam(user, teamName, headId, slackId, description, isFinanceTeam, organization)
      )
  );
};

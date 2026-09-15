import { getWorkspaceId, replyToMessageInThread } from '../integrations/slack.js';
import OrganizationsService from '../services/organizations.services.js';
import SlackServices, {
  SlackBlockActionBody,
  SaboSubmissionActionValue,
  CrApprovalActionValue,
  TeamJoinRequestApprovalActionValue
} from '../services/slack.services.js';
import { tryParseJson } from '../utils/slack.utils.js';

export default class SlackController {
  static async processMessageEvent(event: any) {
    try {
      const organizations = await OrganizationsService.getAllOrganizations();
      const nerSlackWorkspaceId = await getWorkspaceId();
      const relatedOrganization = organizations.find((org) => org.slackWorkspaceId === nerSlackWorkspaceId);
      if (relatedOrganization) {
        SlackServices.processMessageSent(event, relatedOrganization.organizationId);
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }

  /**
   * Handles the Slack block action for SABO submission confirmation.
   * Performs action-specific validation and extracts relevant fields from the Slack action body.
   * If validation fails, replies to the user in Slack with an error message.
   *
   * @param body The validated Slack block action body (general structure validated in routes)
   */
  static async handleSaboSubmittedAction(body: SlackBlockActionBody) {
    const { user, container, actions } = body;
    const channelId = container.channel_id;
    const threadTs = container.thread_ts || container.message_ts;
    const [firstAction] = actions;

    try {
      // Action-specific validation: verify value format
      const parsed = tryParseJson<SaboSubmissionActionValue>(firstAction.value);
      if (!parsed.ok) {
        await replyToMessageInThread(
          channelId,
          threadTs,
          `❌ An error occurred: Invalid action data format.\n\n*Error:* ${parsed.error}\n*Value:* \`${firstAction.value}\`\n\nPlease contact the software team.`
        );
        return;
      }
      const actionValue = parsed.data;

      // Validate that reimbursementRequestId exists in the parsed value
      if (!actionValue.reimbursementRequestId || typeof actionValue.reimbursementRequestId !== 'string') {
        const actionValueStr = JSON.stringify(actionValue, null, 2);
        await replyToMessageInThread(
          channelId,
          threadTs,
          `❌ An error occurred: Missing or invalid reimbursement request ID.\n\n*Parsed value:*\n\`\`\`${actionValueStr}\`\`\`\n\nPlease contact the software team.`
        );
        return;
      }

      // Extract validated fields
      const userSlackId = user.id;
      const { reimbursementRequestId } = actionValue;

      // Pass the extracted fields to the service layer for business logic
      await SlackServices.handleSaboSubmittedAction(userSlackId, reimbursementRequestId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await replyToMessageInThread(
        channelId,
        threadTs,
        `❌ An unexpected error occurred while processing your request.\n\n*Error message:* ${errorMessage}\n\nPlease contact the software team and provide them with this information.`
      );
      throw error;
    }
  }

  static async handleApproveCRAction(
    body: SlackBlockActionBody,
    respond: (msg: {
      response_type?: 'ephemeral';
      text?: string;
      replace_original?: boolean;
      delete_original?: boolean;
    }) => Promise<unknown>
  ) {
    const { user, container, actions } = body;
    const channelId = container.channel_id;
    const threadTs = container.thread_ts || container.message_ts;
    const [firstAction] = actions;

    try {
      // Action-specific validation: verify value format
      const parsed = tryParseJson<CrApprovalActionValue>(firstAction.value);
      if (!parsed.ok) {
        await replyToMessageInThread(
          channelId,
          threadTs,
          `❌ An error occurred: Invalid action data format.\n\n*Error:* ${parsed.error}\n*Value:* \`${firstAction.value}\`\n\nPlease contact the software team.`
        );
        return;
      }
      const actionValue = parsed.data;

      // Validate that changeRequestId exists in the parsed value
      if (!actionValue.crId || typeof actionValue.crId !== 'string') {
        const actionValueStr = JSON.stringify(actionValue, null, 2);
        await replyToMessageInThread(
          channelId,
          threadTs,
          `❌ An error occurred: Missing or invalid reimbursement request ID.\n\n*Parsed value:*\n\`\`\`${actionValueStr}\`\`\`\n\nPlease contact the software team.`
        );
        return;
      }

      // Extract validated fields
      const userSlackId = user.id;
      const { crId } = actionValue;

      // Pass the extracted fields to the service layer for business logic
      await SlackServices.handleApproveCRAction(userSlackId, crId, respond);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await replyToMessageInThread(
        channelId,
        threadTs,
        `❌ An unexpected error occurred while processing your request.\n\n*Error message:* ${errorMessage}\n\nPlease contact the software team and provide them with this information.`
      );
      throw error;
    }
  }

  /**
   * Handles the Slack block action for approving a team join request.
   * Unlike handleApproveCRAction, all error reporting goes through respond() rather than
   * replyToMessageInThread -- team join request notifications are sent as fresh (non-threaded)
   * ephemerals, so there's no reliable message thread to reply into.
   *
   * @param body The validated Slack block action body (general structure validated in routes)
   * @param respond Bolt response callback bound to this interaction's response_url
   */
  static async handleApproveTeamJoinRequestAction(
    body: SlackBlockActionBody,
    respond: (msg: {
      response_type?: 'ephemeral';
      text?: string;
      replace_original?: boolean;
      delete_original?: boolean;
    }) => Promise<unknown>
  ) {
    const { user, actions } = body;
    const [firstAction] = actions;

    const parsed = tryParseJson<TeamJoinRequestApprovalActionValue>(firstAction.value);
    if (!parsed.ok) {
      await respond({
        response_type: 'ephemeral',
        text: `❌ An error occurred: Invalid action data format.\n\n*Error:* ${parsed.error}`
      });
      return;
    }
    const actionValue = parsed.data;

    if (!actionValue.teamJoinRequestId || typeof actionValue.teamJoinRequestId !== 'string') {
      await respond({
        response_type: 'ephemeral',
        text: `❌ An error occurred: Missing or invalid team join request ID.`
      });
      return;
    }

    const userSlackId = user.id;
    const { teamJoinRequestId } = actionValue;

    await SlackServices.handleApproveTeamJoinRequestAction(userSlackId, teamJoinRequestId, respond);
  }
}

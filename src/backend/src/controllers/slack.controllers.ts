import { getWorkspaceId, replyToMessageInThread } from '../integrations/slack.js';
import OrganizationsService from '../services/organizations.services.js';
import SlackServices, {
  SlackBlockActionBody,
  SaboSubmissionActionValue,
  CrApprovalActionValue
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
}

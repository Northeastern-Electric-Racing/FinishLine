import { getWorkspaceId, replyToMessageInThread } from '../integrations/slack';
import OrganizationsService from '../services/organizations.services';
import SlackServices, { SlackBlockActionBody, SaboSubmissionActionValue } from '../services/slack.services';

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
      // Action-specific validation: verify action_id
      if (firstAction.action_id !== 'sabo_submitted_confirmation') {
        console.error('Unexpected action_id:', firstAction.action_id);
        await replyToMessageInThread(
          channelId,
          threadTs,
          `❌ An error occurred: Unexpected action type "${firstAction.action_id}". Please contact the software team.`
        );
        return;
      }

      // Action-specific validation: verify value format
      let actionValue: SaboSubmissionActionValue;
      try {
        actionValue = JSON.parse(firstAction.value);
      } catch (parseError) {
        const parseErrorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        await replyToMessageInThread(
          channelId,
          threadTs,
          `❌ An error occurred: Invalid action data format.\n\n*Error:* ${parseErrorMsg}\n*Value:* \`${firstAction.value}\`\n\nPlease contact the software team.`
        );
        return;
      }

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
}

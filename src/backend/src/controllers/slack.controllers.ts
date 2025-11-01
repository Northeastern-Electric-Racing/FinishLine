import { getWorkspaceId } from '../integrations/slack';
import OrganizationsService from '../services/organizations.services';
import SlackServices from '../services/slack.services';

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

  static async handleSaboSubmittedAction(body: any) {
    try {
      // Extract action details from Bolt's BlockAction payload
      const [action] = body.actions;

      if (action.type !== 'button') {
        // ignore non-button actions for sab submission confirmation
        return;
      }

      const payload = {
        type: body.type,
        user: {
          id: body.user.id,
          username: body.user.username,
          name: body.user.name
        },
        actions: [
          {
            action_id: action.action_id,
            value: action.value || '',
            type: action.type
          }
        ],
        response_url: body.response_url
      };

      // Handle the action using existing service
      await SlackServices.handleSaboSubmittedAction(payload);
    } catch (error: unknown) {
      console.error('Error handling Slack interactive action:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      throw error; // Re-throw to be handled by Bolt's error handler
    }
  }
}

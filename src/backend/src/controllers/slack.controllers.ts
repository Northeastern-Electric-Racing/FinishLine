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
}

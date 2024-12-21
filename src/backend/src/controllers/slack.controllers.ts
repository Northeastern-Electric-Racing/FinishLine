import { getWorkspaceId } from '../integrations/slack';
import OrganizationsService from '../services/organizations.services';
import slackServices from '../services/slack.services';

export default class SlackController {
  static async processMessageEvent(event: any) {
    try {
      const organizations = await OrganizationsService.getAllOrganizations();
      const nerSlackWorkspaceId = await getWorkspaceId();
      const orgId = organizations.find((org) => org.slackWorkspaceId === nerSlackWorkspaceId)?.organizationId;
      if (orgId) {
        slackServices.processMessageSent(event, orgId);
      }
    } catch (error: unknown) {}
  }
}

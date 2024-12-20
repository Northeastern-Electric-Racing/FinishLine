import { createEventAdapter } from '@slack/events-api';
import slackServices from '../services/slack.services';
import OrganizationsService from '../services/organizations.services';
import { getWorkspaceId } from '../integrations/slack';

export const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET || '');

slackEvents.on('message', async (event) => {
  const organizations = await OrganizationsService.getAllOrganizations();
  const nerSlackWorkspaceId = await getWorkspaceId();
  const orgId = organizations.find((org) => org.slackWorkspaceId === nerSlackWorkspaceId)?.organizationId;
  if (orgId) {
    slackServices.processMessageSent(event, orgId);
  }
});

slackEvents.on('error', (error) => {
  console.log(error.name);
});

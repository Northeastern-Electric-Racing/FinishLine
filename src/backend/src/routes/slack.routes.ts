import { createEventAdapter } from '@slack/events-api';
import slackServices from '../services/slack.services';

export const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET || '');

slackEvents.on('message', async (event) => {
  console.log('EVENT:', event);
  slackServices.processMessageSent(event, process.env.DEV_ORGANIZATION_ID ?? '');
});

slackEvents.on('error', (error) => {
  console.log(error.name);
});

import { createEventAdapter } from '@slack/events-api';
import slackServices from '../services/slack.services';

export const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET || '');

slackEvents.on('message', async (event) => {
  console.log('EVENT:', event);
  slackServices.processMessageSent(event);
});

slackEvents.on('error', (error) => {
  console.log(error.name);
});

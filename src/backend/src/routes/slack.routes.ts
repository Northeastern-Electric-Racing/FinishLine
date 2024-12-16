import { createEventAdapter } from '@slack/events-api';

export const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET || '');

slackEvents.on('message', async (event) => {
  console.log('EVENT:', event);
});

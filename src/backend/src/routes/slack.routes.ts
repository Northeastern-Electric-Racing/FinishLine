import { createEventAdapter } from '@slack/events-api';
import SlackController from '../controllers/slack.controllers';

export const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET || '');

slackEvents.on('message', async (event) => {
  SlackController.processMessageEvent(event);
});

slackEvents.on('error', (error) => {
  console.log(error.name);
});

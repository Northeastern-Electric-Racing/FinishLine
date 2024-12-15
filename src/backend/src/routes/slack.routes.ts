import { slackEvents } from '../..';

slackEvents.on('message', async (event) => {
  try {
    console.log(`Message received: ${event.text}`);
    // Respond or process the message as needed
  } catch (error) {
    console.error('Error handling message event:', error);
  }
});

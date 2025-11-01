import { slackApp } from '../integrations/slack';
import SlackController from '../controllers/slack.controllers';

// Register message event listener
slackApp.message(async ({ message, logger }: any) => {
  try {
    await SlackController.processMessageEvent(message);
  } catch (error) {
    logger.error('Error processing message event:', error);
    console.error(error);
  }
});

// Register interactive action handler for SABO submission confirmation
slackApp.action('sabo_submitted_confirmation', async ({ ack, body, logger }: any) => {
  await ack();

  try {
    await SlackController.handleSaboSubmittedAction(body);
  } catch (error) {
    logger.error('Error handling sabo_submitted_confirmation action:', error);
    console.error(error);
  }
});

// Error handler
slackApp.error(async (error: Error) => {
  console.error('Slack app error:', error);
});

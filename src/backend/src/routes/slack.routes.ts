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

/**
 * Validates the general structure of a Slack block action payload.
 * This validation is action-agnostic and only checks that the required fields exist.
 * Action-specific validation (like action_id and value format) happens in the controller.
 *
 * @param body The Slack action body to validate
 * @returns true if valid, false otherwise
 */
function validateSlackActionBody(body: any): boolean {
  // Check required top-level fields
  if (!body || typeof body !== 'object') {
    console.error('Invalid body: not an object');
    return false;
  }

  if (body.type !== 'block_actions') {
    console.error('Invalid body type:', body.type);
    return false;
  }

  // Validate user object
  if (!body.user || typeof body.user !== 'object') {
    console.error('Invalid or missing user object');
    return false;
  }

  if (!body.user.id || typeof body.user.id !== 'string') {
    console.error('Invalid or missing user.id');
    return false;
  }

  if (!body.user.team_id || typeof body.user.team_id !== 'string') {
    console.error('Invalid or missing user.team_id');
    return false;
  }

  // Validate actions array exists and has at least one action
  if (!Array.isArray(body.actions) || body.actions.length === 0) {
    console.error('Invalid or empty actions array');
    return false;
  }

  const [action] = body.actions;
  if (!action.action_id || typeof action.action_id !== 'string') {
    console.error('Invalid or missing action_id');
    return false;
  }

  if (!action.value || typeof action.value !== 'string') {
    console.error('Invalid or missing action value');
    return false;
  }

  // Validate container object (for message timestamp and channel)
  if (!body.container || typeof body.container !== 'object') {
    console.error('Invalid or missing container object');
    return false;
  }

  if (!body.container.message_ts || typeof body.container.message_ts !== 'string') {
    console.error('Invalid or missing container.message_ts');
    return false;
  }

  if (!body.container.channel_id || typeof body.container.channel_id !== 'string') {
    console.error('Invalid or missing container.channel_id');
    return false;
  }

  // Validate thread_ts if it exists (optional but if present should be string)
  if (body.container.thread_ts && typeof body.container.thread_ts !== 'string') {
    console.error('Invalid container.thread_ts type');
    return false;
  }

  return true;
}

// Register interactive action handler for SABO submission confirmation
slackApp.action('sabo_submitted_confirmation', async ({ ack, body, logger, respond }: any) => {
  await ack();

  try {
    // Validate the incoming action body structure
    if (!validateSlackActionBody(body)) {
      logger.error('Invalid Slack action body structure');
      return;
    }

    await SlackController.handleSaboSubmittedAction(body);

    // If no error, delete the original message
    await respond({ delete_original: true });
  } catch (error) {
    // Can't pass to normal middleware because not normal request
    logger.error('Error handling sabo_submitted_confirmation action:', error);
  }
});

// Error handler
slackApp.error(async (error: Error) => {
  console.error('Slack app error:', error);
});

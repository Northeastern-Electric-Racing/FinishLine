import { ChatPostMessageResponse, WebClient } from '@slack/web-api';
import { HttpException } from '../utils/errors.utils';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Send a slack message
 * @param slackId - the channel id of the channel to send to or the slack id of the person you want to DM
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 * @returns the channel id and timestamp of the created slack message
 */
export const sendMessage = async (slackId: string, message: string, link?: string, linkButtonText?: string) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    const response: ChatPostMessageResponse = await slack.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      text: message,
      blocks: [block],
      unfurl_links: false
    });

    return response && response.channel && response.ts && { channelId: response.channel, ts: response.ts };
  } catch (error) {
    throw new HttpException(500, 'Error sending slack message, reason: ' + (error as any).data.error);
  }
};

/**
 * Sends a slack message as a reply in a thread
 * @param slackId - the channel id of the channel of the message to reply to
 * @param parentTimestamp - the timestamp of the message to reply to in a thread
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
export const replyToMessageInThread = async (
  slackId: string,
  parentTimestamp: string,
  message: string,
  link?: string,
  linkButtonText?: string
) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    await slack.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      thread_ts: parentTimestamp,
      text: message,
      blocks: [block]
    });
  } catch (error) {
    throw new HttpException(500, 'Error sending slack reply to thread, reason: ' + (error as any).data.error);
  }
};

/**
 * Edits an existing slack message
 * @param slackId - the channel id of the channel of the message to edit
 * @param timestamp - the timestamp of the message to edit
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
export const editMessage = async (
  slackId: string,
  timestamp: string,
  message: string,
  link?: string,
  linkButtonText?: string
) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    await slack.chat.update({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      ts: timestamp,
      text: message,
      blocks: [block]
    });
  } catch (error) {
    throw new HttpException(500, 'Error sending slack reply to thread, reason: ' + (error as any).data.error);
  }
};

/**
 * Reacts to a slack message
 * @param slackId - the channel id of the channel of the message to reply to
 * @param parentTimestamp - the timestamp of the message to reply to in a thread
 * @param emoji - the emoji to react with
 */
export const reactToMessage = async (slackId: string, parentTimestamp: string, emoji: string) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  try {
    await slack.reactions.add({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      timestamp: parentTimestamp,
      name: emoji
    });
  } catch (error) {
    throw new HttpException(500, 'Error reacting to slack message, reason: ' + (error as any).data.error);
  }
};

/**
 * Generates a slack text block with message and optional button
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 * @returns the slack text block
 */
const generateSlackTextBlock = (message: string, link?: string, linkButtonText?: string) => {
  // if link and link button are provided, add the button to the message, otherwise just send the markdown block
  return link && linkButtonText
    ? {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: linkButtonText
          },
          url: link
        }
      }
    : {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      };
};

export default slack;

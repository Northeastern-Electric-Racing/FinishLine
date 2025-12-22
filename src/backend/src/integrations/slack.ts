import { App, ExpressReceiver } from '@slack/bolt';
import { HttpException } from '../utils/errors.utils';

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  endpoints: '/slack/events'
});

// Initialize the Bolt app
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN || '',
  receiver
});

// Get the WebClient from the Bolt app
const slack = slackApp.client;

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
    const response = await slack.chat.postMessage({
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

/**
 * Given an id of a channel, produces the slack ids of all the users in that channel.
 * @param channelId the id of the channel
 * @returns an array of strings of all the slack ids of the users in the given channel
 */
export const getUsersInChannel = async (channelId: string) => {
  let members: string[] = [];
  let cursor: string | undefined;

  try {
    do {
      const response = await slack.conversations.members({
        channel: channelId,
        cursor,
        limit: 200
      });

      if (response.ok && response.members) {
        members = members.concat(response.members);
        cursor = response.response_metadata?.next_cursor;
      } else {
        throw new Error(`Failed to fetch members: ${response.error}`);
      }
    } while (cursor);

    return members;
  } catch (error) {
    return members;
  }
};

/**
 * Given a slack channel id, produces the name of the channel
 * @param channelId the id of the slack channel
 * @returns the name of the channel or undefined if it cannot be found
 */
export const getChannelName = async (channelId: string) => {
  try {
    const channelRes = await slack.conversations.info({ channel: channelId });
    return channelRes.channel?.name;
  } catch (error) {
    return undefined;
  }
};

/**
 * Given a slack user id, prood.uces the name of the channel
 * @param userId the id of the slack user
 * @returns the name of the user (real name if no display name), undefined if cannot be found
 */
export const getUserName = async (userId: string) => {
  try {
    const userRes = await slack.users.info({ user: userId });
    return userRes.user?.profile?.display_name || userRes.user?.real_name;
  } catch (error) {
    return undefined;
  }
};

/**
 * Get the workspace id of the workspace this slack api is registered with
 * @returns the id of the workspace
 */
export const getWorkspaceId = async () => {
  try {
    const response = await slack.auth.test();
    if (response.ok) {
      return response.team_id;
    }
    throw new Error(response.error);
  } catch (error) {
    throw new HttpException(500, 'Error getting slack workspace id: ' + (error as any).data.error);
  }
};

/**
 * Sends a slack ephemeral message to a user
 * @param channelId - the channel id of the channel to send to
 * @param threadTs - the timestamp of the thread to send to
 * @param userId - the id of the user to send to
 * @param text - the text of the message to send (should always be populated in case blocks can't be rendered, but if blocks render text will not)
 * @param blocks - the blocks of the message to send
 */
export async function sendEphemeralMessage(
  channelId: string,
  threadTs: string,
  userId: string,
  text: string,
  blocks: any[]
) {
  try {
    await slack.chat.postEphemeral({
      channel: channelId,
      user: userId,
      thread_ts: threadTs,
      text,
      blocks
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack notifications: ${err.message}`);
    }
  }
}

// Export the slack client, bolt app, and receiver for any direct usage if needed
export { slack, slackApp, receiver };
export default slack;

import bolt from '@slack/bolt';
import type { App, ExpressReceiver } from '@slack/bolt';
import { LRUCache } from 'lru-cache';
import { SlackMessagePreview } from 'shared';
import { HttpException } from '../utils/errors.utils.js';

const { App: AppClass, ExpressReceiver: ExpressReceiverClass } = bolt;

let receiver: ExpressReceiver | null = null;
let slackApp: App | null = null;
let slack: any = null; // Type will be inferred from slackApp.client (WebClient from Bolt)

/**
 * Initializes the Slack Bolt app, receiver, and client if not already initialized
 * Only initializes if SLACK_BOT_TOKEN is present
 */
const initializeSlack = () => {
  const { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } = process.env;

  // Don't initialize if no token is configured (e.g., in tests)
  if (!SLACK_BOT_TOKEN) {
    return;
  }

  // Don't re-initialize if already initialized
  if (slackApp) {
    return;
  }

  // Initialize the receiver, app, and client
  receiver = new ExpressReceiverClass({
    signingSecret: SLACK_SIGNING_SECRET || '',
    endpoints: '/slack/events'
  });

  slackApp = new AppClass({
    token: SLACK_BOT_TOKEN,
    receiver
  });

  slack = slackApp.client;
};

/**
 * Get the Slack WebClient (initializes Slack if needed)
 * @returns the Slack WebClient or null if no token is configured
 */
const getSlackClient = () => {
  initializeSlack();
  return slack;
};

/**
 * Send a slack message
 * @param slackId - the channel id of the channel to send to or the slack id of the person you want to DM
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 * @returns the channel id and timestamp of the created slack message
 */
export const sendMessage = async (slackId: string, message: string, link?: string, linkButtonText?: string) => {
  const client = getSlackClient();
  if (!client) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    const response = await client.chat.postMessage({
      channel: slackId,
      text: message,
      blocks: [block],
      unfurl_links: false
    });

    return response && response.channel && response.ts && { channelId: response.channel, ts: response.ts };
  } catch (error) {
    console.error('Failed to send Slack message:', (error as any)?.data?.error ?? error);
    return undefined;
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
  const client = getSlackClient();
  if (!client) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    await client.chat.postMessage({
      channel: slackId,
      thread_ts: parentTimestamp,
      text: message,
      blocks: [block]
    });
  } catch (error) {
    console.error('Failed to send Slack thread reply:', (error as any)?.data?.error ?? error);
    return undefined;
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
  const client = getSlackClient();
  if (!client) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    await client.chat.update({
      channel: slackId,
      ts: timestamp,
      text: message,
      blocks: [block]
    });
  } catch (error) {
    console.error('Failed to edit Slack message:', (error as any)?.data?.error ?? error);
    return undefined;
  }
};

/**
 * Deletes a slack message
 * @param channelId - the channel id of the channel containing the message
 * @param timestamp - the timestamp of the message to delete
 */
export const deleteMessage = async (channelId: string, timestamp: string) => {
  const client = getSlackClient();
  if (!client) return;

  try {
    await client.chat.delete({
      channel: channelId,
      ts: timestamp
    });
  } catch (error) {
    console.error('Failed to delete Slack message:', (error as any)?.data?.error ?? error);
    return undefined;
  }
};

/**
 * Reacts to a slack message
 * @param slackId - the channel id of the channel of the message to reply to
 * @param parentTimestamp - the timestamp of the message to reply to in a thread
 * @param emoji - the emoji to react with
 */
export const reactToMessage = async (slackId: string, parentTimestamp: string, emoji: string) => {
  const client = getSlackClient();
  if (!client) return;

  try {
    await client.reactions.add({
      channel: slackId,
      timestamp: parentTimestamp,
      name: emoji
    });
  } catch (error) {
    console.error('Failed to react to Slack message:', (error as any)?.data?.error ?? error);
    return undefined;
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
 * Fetches every member of a channel from Slack, paging through the full member list.
 * Throws on any failure so that partial member lists are never returned or cached.
 * @param channelId the id of the channel
 * @returns an array of the slack ids of every user in the channel
 */
const fetchUsersInChannel = async (channelId: string): Promise<string[]> => {
  const client = getSlackClient();
  if (!client) return [];

  let members: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.conversations.members({
      channel: channelId,
      cursor,
      limit: 200
    });

    if (!response.ok || !response.members) {
      throw new Error(`Failed to fetch members: ${response.error}`);
    }

    members = members.concat(response.members);
    cursor = response.response_metadata?.next_cursor;
  } while (cursor);

  return members;
};

/**
 * Fetches a channel's name from Slack.
 * @param channelId the id of the slack channel
 * @returns the name of the channel, or undefined if slack has no name for it
 */
const fetchChannelName = async (channelId: string): Promise<string | undefined> => {
  const client = getSlackClient();
  if (!client) return undefined;

  const channelRes = await client.conversations.info({ channel: channelId });
  return channelRes.channel?.name;
};

/**
 * Caches channel names, which change very rarely, keyed by channel id.
 */
const channelNameCache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 1 day
  fetchMethod: fetchChannelName
});

/**
 * Caches channel membership, keyed by channel id.
 */
const channelMembersCache = new LRUCache<string, string[]>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
  fetchMethod: fetchUsersInChannel
});

/**
 * Given an id of a channel, produces the slack ids of all the users in that channel.
 * Results are cached, and concurrent calls for the same channel share a single slack request.
 * @param channelId the id of the channel
 * @returns an array of strings of all the slack ids of the users in the given channel
 */
export const getUsersInChannel = async (channelId: string): Promise<string[]> => {
  try {
    return (await channelMembersCache.fetch(channelId)) ?? [];
  } catch (error) {
    console.error('Failed to fetch Slack channel members:', (error as any)?.data?.error ?? error);
    return [];
  }
};

/**
 * Given a slack channel id, produces the name of the channel.
 * Results are cached, and concurrent calls for the same channel share a single slack request.
 * @param channelId the id of the slack channel
 * @returns the name of the channel or undefined if it cannot be found
 */
export const getChannelName = async (channelId: string): Promise<string | undefined> => {
  try {
    return await channelNameCache.fetch(channelId);
  } catch (error) {
    return undefined;
  }
};

const listChannelsOfTypes = async (types: string): Promise<{ id: string; name: string }[]> => {
  const client = getSlackClient();
  if (!client) return [];

  let channels: { id: string; name: string }[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.conversations.list({
      types,
      exclude_archived: true,
      cursor,
      limit: 200
    });

    if (response.ok && response.channels) {
      channels = channels.concat(
        response.channels
          .filter(
            (channel: { is_member?: boolean; id?: string; name?: string }) => channel.is_member && channel.id && channel.name
          )
          .map((channel: { id: string; name: string }) => ({ id: channel.id, name: channel.name }))
      );
      cursor = response.response_metadata?.next_cursor;
    } else {
      throw Object.assign(new Error(`Failed to fetch channels: ${response.error}`), { code: response.error });
    }
  } while (cursor);

  return channels;
};

/**
 * Caches the bot's channel list, keyed by the requested `types` string. A full workspace
 * channel listing is one of the more expensive Slack calls to repeat on every request.
 */
const botChannelsCache = new LRUCache<string, { id: string; name: string }[]>({
  max: 10,
  ttl: 1000 * 60 * 60, // 1 hour
  fetchMethod: listChannelsOfTypes
});

/**
 * Produces every channel (public or private) the bot is currently a member of, with each
 * channel's current name. One bulk call regardless of channel count, so callers should use
 * this instead of resolving names one channel at a time via getChannelName. Results are
 * cached, and concurrent calls share a single slack request. Falls back to public channels
 * only if the bot token is missing the groups:read scope needed for private channels, rather
 * than failing the whole lookup.
 * @returns an array of { id, name } for every channel the bot can see
 */
export const getBotChannels = async (): Promise<{ id: string; name: string }[]> => {
  try {
    return (await botChannelsCache.fetch('public_channel,private_channel')) ?? [];
  } catch (error) {
    const slackError = (error as { data?: { error?: string } }).data?.error;
    if (slackError === 'missing_scope') {
      try {
        return (await botChannelsCache.fetch('public_channel')) ?? [];
      } catch (fallbackError) {
        return [];
      }
    }
    return [];
  }
};

/**
 * Checks whether the bot is a member of the given channel
 * @param channelId the id of the slack channel
 * @returns true if the bot is a member of the channel, false otherwise
 */
export const checkBotInChannel = async (channelId: string): Promise<boolean> => {
  const client = getSlackClient();
  if (!client) return false;

  try {
    const channelRes = await client.conversations.info({ channel: channelId });
    return channelRes.channel?.is_member ?? false;
  } catch (error) {
    return false;
  }
};

/**
 * Fetches a user's display name from Slack.
 * @param userId the id of the slack user
 * @returns the name of the user (real name if no display name), undefined if cannot be found
 */
const fetchUserName = async (userId: string): Promise<string | undefined> => {
  const client = getSlackClient();
  if (!client) return undefined;

  const userRes = await client.users.info({ user: userId });
  return userRes.user?.profile?.display_name || userRes.user?.real_name;
};

/**
 * Caches user display names, which change very rarely, keyed by slack user id.
 */
const userNameCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24, // 1 day
  fetchMethod: fetchUserName
});

/**
 * Given a slack user id, produces the display name of the user.
 * Results are cached, and concurrent calls for the same user share a single slack request.
 * @param userId the id of the slack user
 * @returns the name of the user (real name if no display name), undefined if cannot be found
 */
export const getUserName = async (userId: string) => {
  try {
    return await userNameCache.fetch(userId);
  } catch (error) {
    return undefined;
  }
};

/**
 * Get the workspace id of the workspace this slack api is registered with
 * @returns the id of the workspace
 */
export const getWorkspaceId = async () => {
  const client = getSlackClient();
  if (!client) {
    throw new HttpException(500, 'Slack client not configured');
  }

  try {
    const response = await client.auth.test();
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
 * @param threadTs - the timestamp of the thread to send to, if this ephemeral should be a threaded reply
 * @param userId - the id of the user to send to
 * @param text - the text of the message to send (should always be populated in case blocks can't be rendered, but if blocks render text will not)
 * @param blocks - the blocks of the message to send
 */
export async function sendEphemeralMessage(
  channelId: string,
  threadTs: string | undefined,
  userId: string,
  text: string,
  blocks: any[]
) {
  const client = getSlackClient();
  if (!client) return;

  try {
    await client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      ...(threadTs ? { thread_ts: threadTs } : {}),
      text,
      blocks
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack ephemeral: ${err.message}`);
    }
  }
}

/**
 * Get the Slack Bolt app instance (initializes Slack if needed)
 * @returns the Slack Bolt App or null if no token is configured
 */
export const getSlackApp = (): App | null => {
  initializeSlack();
  return slackApp;
};

/**
 * Get the Express receiver instance (initializes Slack if needed)
 * @returns the ExpressReceiver or null if no token is configured
 */
export const getReceiver = (): ExpressReceiver | null => {
  initializeSlack();
  return receiver;
};

// Export the getters for any direct usage if needed
export { getSlackClient };
export default getSlackClient;

/**
 * Fetches the most recent real (non-system) messages posted in a Slack channel, newest first,
 * with each message's author name and a permalink back to it in Slack resolved.
 * @param channelId the id of the slack channel to fetch messages from
 * @param limit the maximum number of recent messages to fetch
 * @returns the most recent messages in the channel, newest first
 */
const fetchRecentChannelMessages = async (key: string): Promise<SlackMessagePreview[]> => {
  const [channelId, limitStr] = key.split(':');
  const limit = Number(limitStr);

  const client = getSlackClient();
  if (!client) {
    throw new HttpException(500, 'Slack integration not configured');
  }

  try {
    const historyRes = await client.conversations.history({ channel: channelId, limit });
    if (!historyRes.ok || !historyRes.messages) {
      throw new Error(historyRes.error ?? 'unknown error fetching channel history');
    }

    const realMessages = historyRes.messages.filter((message: any) => !message.subtype && message.text && message.ts);

    return await Promise.all(
      realMessages.map(async (message: any) => {
        const [userName, permalinkRes] = await Promise.all([
          message.user ? getUserName(message.user) : undefined,
          client.chat.getPermalink({ channel: channelId, message_ts: message.ts })
        ]);

        return {
          text: message.text,
          userName,
          timestamp: new Date(Number(message.ts) * 1000).toISOString(),
          permalink: permalinkRes.permalink as string
        };
      })
    );
  } catch (error) {
    throw new HttpException(
      500,
      `Failed to fetch recent Slack messages: ${(error as any)?.data?.error ?? (error as Error).message}`
    );
  }
};

/**
 * Caches recent channel messages briefly, keyed by `${channelId}:${limit}`. This is the
 * important one for widgets that poll on a timer: every viewer asking for the same channel
 * shares one Slack request per TTL window instead of hitting Slack once per viewer per poll.
 * TTL matches the frontend's poll interval so a single viewer's repeat polls hit cache too,
 * not just concurrent polls from different viewers.
 */
const recentChannelMessagesCache = new LRUCache<string, SlackMessagePreview[]>({
  max: 100,
  ttl: 1000 * 60, // 60 seconds
  fetchMethod: fetchRecentChannelMessages
});

/**
 * Fetches the most recent real (non-system) messages posted in a Slack channel, newest first,
 * with each message's author name and a permalink back to it in Slack resolved. Results are
 * cached briefly, and concurrent/near-concurrent callers for the same channel share a single
 * slack request rather than each hitting Slack independently.
 * @param channelId the id of the slack channel to fetch messages from
 * @param limit the maximum number of recent messages to fetch
 * @returns the most recent messages in the channel, newest first
 */
export const getRecentChannelMessages = async (channelId: string, limit: number): Promise<SlackMessagePreview[]> => {
  return (await recentChannelMessagesCache.fetch(`${channelId}:${limit}`)) ?? [];
};

/**
 * Validates that a given Slack user id exists in the workspace
 * All slack ids start with U. If you pass a valid user id to users.info, it returns ok: true; throws error otherwise.
 * @param slackId the Slack user id to validate
 * @returns true if the user exists, false otherwise
 */
export const validateSlackUserId = async (slackId: string): Promise<boolean> => {
  const client = getSlackClient();
  if (!client) return false;
  try {
    const res = await client.users.info({ user: slackId });
    return res.ok === true;
  } catch (error) {
    return false;
  }
};

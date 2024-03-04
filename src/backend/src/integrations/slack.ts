import { WebClient } from '@slack/web-api';
import { HttpException } from '../utils/errors.utils';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Send a slack message
 * @param slackId - the channel id of the channel to send to or the slack id of the person you want to DM
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
export const sendMessage = async (slackId: string, message: string, link?: string, linkButtonText?: string) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  // if link and link button are provided, add the button to the message, otherwise just send the markdown block
  const block =
    link && linkButtonText
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

  try {
    await slack.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      text: message,
      blocks: [block],
      unfurl_links: false
    });
  } catch (error) {
    throw new HttpException(500, 'Error sending slack message, reason: ' + (error as any).data.error);
  }
};

export default slack;

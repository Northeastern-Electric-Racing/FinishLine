import { WebClient } from '@slack/web-api';

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

  await slack.chat.postMessage({
    token: SLACK_BOT_TOKEN,
    channel: slackId,
    text: message,
    blocks: [block],
    unfurl_links: false
  });
};

export default slack;

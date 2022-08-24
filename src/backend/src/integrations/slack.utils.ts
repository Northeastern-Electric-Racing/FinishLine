import slack from '../integrations/slack';

export const sendMessage = async (channelId: string, message: string, link: string) => {
  await slack.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: message,
    blocks: [
      {
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
            text: 'View'
          },
          url: link
        }
      }
    ]
  });
};

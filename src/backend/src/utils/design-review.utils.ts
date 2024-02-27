import { sendMessage } from '../integrations/slack';

export const sendSlackCRReviewedNotification = async (slackId: string, designReviewId: string) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msgs = [];
  const fullMsg = `:tada: You have been invited to a Design Review! Fill out your availability! :tada:`;
  const fullLink = `https://finishlinebyner.com/design-reviews/${designReviewId}`;
  const btnText = `RSVP for Design Review: ${designReviewId}`;
  msgs.push(sendMessage(slackId, fullMsg, fullLink, btnText));

  return Promise.all(msgs);
};

import { daysBetween, wbsPipe, WorkPackage } from 'shared';
import { sendMessage } from '../integrations/slack';
import { getUserSlackId } from './users.utils';

export const sendSlackUpcomingDeadlineNotification = async (workPackage: WorkPackage): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod

  const { LEAD_CHANNEL_SLACK_ID } = process.env;
  if (!LEAD_CHANNEL_SLACK_ID) return;

  const lead = workPackage.projectLead;
  const slackId = await getUserSlackId(lead?.userId);
  const userString = lead
    ? slackId
      ? `<@${slackId}>`
      : `${lead.firstName} ${lead.lastName} (<https://finishlinebyner.com/settings|set your slack id here>)`
    : '(no project lead)';

  const daysUntilDeadline = daysBetween(workPackage.endDate, new Date());

  let dueString;
  if (daysUntilDeadline < 0) dueString = `was due *${daysUntilDeadline * -1} days ago!*`;
  else if (daysUntilDeadline === 0) dueString = `is due today!`;
  else dueString = `is due in ${daysUntilDeadline} days!`;

  const wbsNumber: string = wbsPipe(workPackage.wbsNum);
  const wbsString = `<https://finishlinebyner.com/projects/${wbsNumber}|${wbsNumber}>`;

  const fullMsg = `${userString} ${wbsString}: ${workPackage.projectName} - ${workPackage.name} ${dueString}`;

  await sendMessage(LEAD_CHANNEL_SLACK_ID, fullMsg);
};

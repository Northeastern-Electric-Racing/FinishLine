import { Prisma } from '@prisma/client';

export type BaseAnnouncementQueryArgs = ReturnType<typeof getBaseAnnouncementQueryArgs>;

// the minimum every consumer of an announcement needs: the Slack message and where it came from. No usersReceived: it is a
// to-many that grows with the org (an @channel reaches everyone) and no consumer reads it
export const getBaseAnnouncementQueryArgs = () =>
  Prisma.validator<Prisma.AnnouncementDefaultArgs>()({
    select: {
      announcementId: true,
      text: true,
      senderName: true,
      dateMessageSent: true,
      slackEventId: true,
      slackChannelName: true,
      dateDeleted: true
    }
  });

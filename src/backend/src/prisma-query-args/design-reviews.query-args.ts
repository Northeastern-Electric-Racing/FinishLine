import { Prisma } from '@prisma/client';

const designReviewQueryArgs = Prisma.validator<Prisma.Design_ReviewArgs>()({
  include: {
    userCreated: {
      include: {
        userSettings: true
      }
    },
    teamType: true,
    requiredMembers: true,
    optionalMembers: true,
    confirmedMembers: {
      include: {
        drScheduleSettings: true
      }
    },
    deniedMembers: true,
    attendees: true,
    userDeleted: true,
    wbsElement: true
  }
});

export default designReviewQueryArgs;

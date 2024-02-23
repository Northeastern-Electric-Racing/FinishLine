import { Prisma } from '@prisma/client';

const designReviewQueryArgs = Prisma.validator<Prisma.Design_ReviewArgs>()({
  include: {
    userCreated: true,
    teamType: true,
    requiredMembers: true,
    optionalMembers: true,
    confirmedMembers: true,
    deniedMembers: true,
    attendees: true,
    userDeleted: true,
    wbsElement: true
  }
});
export default designReviewQueryArgs;

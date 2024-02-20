import { Prisma } from '@prisma/client';
import { DesignReview } from 'shared';
import userTransformer from './user.transformer';

export const designReviewTransformer = (
  designReview: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs>
): DesignReview => {
  return {
    designReviewId: designReview.designReviewId,
    dateScheduled: designReview.dateScheduled,
    meetingTimes: designReview.meetingTimes,
    dateCreated: designReview.dateCreated,
    userCreated: userTransformer(designReview.userCreated),
    userCreatedId: designReview.userCreatedId,
    status: designReview.status,
    teamType: designReview.teamType,
    requiredMembers: designReview.requiredMembers.map(userTransformer),
    optionalMembers: designReview.optionalMembers.map(userTransformer),
    confirmedMembers: designReview.confirmedMembers.map(userTransformer),
    deniedMembers: designReview.deniedMembers.map(userTransformer),
    location: designReview.location ?? undefined,
    isOnline: designReview.isOnline,
    isInPerson: designReview.isInPerson,
    zoomLink: designReview.zoomLink ?? undefined,
    attendees: designReview.attendees.map(userTransformer),
    dateDeleted: designReview.dateDeleted ?? undefined,
    userDeleted: designReview.userDeleted ? userTransformer(designReview.userDeleted) : undefined,
    userDeletedId: designReview.userDeletedId ?? undefined,
    docTemplateLink: designReview.docTemplateLink ?? undefined,
    wbsElementId: designReview.wbsElementId,
    wbsElement: designReview.wbsElement
  };
};

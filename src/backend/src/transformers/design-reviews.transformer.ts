import { Prisma } from '@prisma/client';
import { DesignReview, DesignReviewPreview, DesignReviewStatus, isProjectWbs } from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { userTransformer, userWithScheduleSettingsTransformer } from './user.transformer.js';
import { DesignReviewPreviewQueryArgs, DesignReviewQueryArgs } from '../prisma-query-args/design-reviews.query-args.js';
import { teamTypeTransformer } from './team-types.transformer.js';

export const designReviewTransformer = (
  designReview: Prisma.Design_ReviewGetPayload<DesignReviewQueryArgs>
): DesignReview => {
  const wbsName = isProjectWbs(designReview.wbsElement)
    ? designReview.wbsElement.name
    : `${designReview.wbsElement.workPackage?.project.wbsElement.name} - ${designReview.wbsElement.name}`;
  return {
    designReviewId: designReview.designReviewId,
    dateScheduled: designReview.dateScheduled,
    meetingTimes: designReview.meetingTimes,
    dateCreated: designReview.dateCreated,
    userCreated: userTransformer(designReview.userCreated),
    requiredMembers: designReview.requiredMembers.map(userTransformer),
    optionalMembers: designReview.optionalMembers.map(userTransformer),
    confirmedMembers: designReview.confirmedMembers.map(userWithScheduleSettingsTransformer),
    deniedMembers: designReview.deniedMembers.map(userTransformer),
    location: designReview.location ?? undefined,
    isOnline: designReview.isOnline,
    isInPerson: designReview.isInPerson,
    zoomLink: designReview.zoomLink ?? undefined,
    calendarEventId: designReview.calendarEventId ?? undefined,
    attendees: designReview.attendees.map(userTransformer),
    dateDeleted: designReview.dateDeleted ?? undefined,
    userDeleted: designReview.userDeleted ? userTransformer(designReview.userDeleted) : undefined,
    docTemplateLink: designReview.docTemplateLink ?? undefined,
    status: designReview.status as DesignReviewStatus,
    teamType: teamTypeTransformer(designReview.teamType),
    wbsName,
    wbsNum: wbsNumOf(designReview.wbsElement),
    initialDate: designReview.initialDateScheduled
  };
};

export const designReviewPreviewTransformer = (
  designReview: Prisma.Design_ReviewGetPayload<DesignReviewPreviewQueryArgs>,
  wbsName: string
): DesignReviewPreview => {
  return {
    designReviewId: designReview.designReviewId,
    dateScheduled: designReview.dateScheduled,
    userCreated: userTransformer(designReview.userCreated),
    status: designReview.status as DesignReviewStatus,
    wbsName
  };
};

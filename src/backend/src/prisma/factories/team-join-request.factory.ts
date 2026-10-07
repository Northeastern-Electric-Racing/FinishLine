import { Faker } from '@faker-js/faker';
import { Prisma, Team_Join_Request_Status } from '@prisma/client';

export const TEAM_JOIN_REQUEST_COUNT = 60;

// Weighted so most requests are still sitting unreviewed, with a mix of already-resolved ones
// for the review UI and Slack notification flows to have something to show.
export const chooseJoinRequestStatus = (faker: Faker): Team_Join_Request_Status =>
  faker.helpers.weightedArrayElement([
    { weight: 60, value: Team_Join_Request_Status.PENDING },
    { weight: 25, value: Team_Join_Request_Status.APPROVED },
    { weight: 15, value: Team_Join_Request_Status.DENIED }
  ]);

const DENIAL_REASON_POOL = [
  'This team is not currently accepting new members.',
  "You'll be a better fit once you've completed onboarding for your subteam.",
  'Please reach out in Slack before requesting so a lead can walk you through expectations.'
];

export const chooseDenialReason = (faker: Faker): string => faker.helpers.arrayElement(DENIAL_REASON_POOL);

export const teamJoinRequestCreateInput = (
  userId: string,
  teamId: string,
  status: Team_Join_Request_Status,
  dateRequested: Date,
  reviewedByUserId: string | undefined,
  dateReviewed: Date | undefined,
  denialReason: string | undefined
): Prisma.Team_Join_RequestCreateInput => ({
  user: { connect: { userId } },
  team: { connect: { teamId } },
  status,
  dateRequested,
  ...(reviewedByUserId ? { reviewedBy: { connect: { userId: reviewedByUserId } } } : {}),
  ...(dateReviewed ? { dateReviewed } : {}),
  ...(status === Team_Join_Request_Status.DENIED && denialReason ? { denialReason } : {})
});

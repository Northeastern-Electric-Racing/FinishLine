/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Faker } from '@faker-js/faker';
import { Prisma, Review_Status } from '@prisma/client';
import { DateRange } from '../context.js';
import { generateRandomDate } from '../dates.js';

export type PartActor = { userId: string };
export const PART_TAGS: { name: string; colorHexCode: string }[] = [
  { name: 'Mechanical', colorHexCode: '#2563EB' },
  { name: 'Electrical', colorHexCode: '#F59E0B' },
  { name: 'Structural', colorHexCode: '#10B981' },
  { name: 'Aero', colorHexCode: '#6366F1' },
  { name: 'Machined', colorHexCode: '#EC4899' },
  { name: 'Off-the-Shelf', colorHexCode: '#0EA5E9' },
  { name: 'Composite', colorHexCode: '#14B8A6' },
  { name: 'Practice', colorHexCode: '#202025' },
  { name: 'Complex', colorHexCode: '#142099' },
  { name: 'Expensive', colorHexCode: '#FF0000' }
];

export const COMMON_MISTAKES: { title: string; description: string; starred: boolean }[] = [
  {
    title: 'Not wearing PPE',
    description:
      'Ensure proper PPE coverage before doing any work in the bay. If you are unsure about requirements, reach out to a team lead.',
    starred: true
  },
  {
    title: 'Missing tolerances on drawing',
    description:
      'Every dimension that matters for fit or function needs a tolerance callout before the part goes out for manufacturing.',
    starred: true
  },
  {
    title: 'Sharp corners on load path',
    description: 'Add fillets to internal corners on load-bearing parts to avoid stress concentrations.',
    starred: true
  },
  {
    title: 'Wrong material callout',
    description: 'Double-check the material and temper against the BOM; 6061 and 7075 are not interchangeable.',
    starred: false
  },
  {
    title: 'No deburring note',
    description: 'Waterjet and laser-cut edges must be deburred; call this out so it does not get skipped.',
    starred: false
  },
  {
    title: 'Fasteners not to spec',
    description: 'Confirm fastener grade, length, and thread pitch against the assembly they mate to.',
    starred: false
  },
  {
    title: 'Ignoring manufacturability',
    description: 'Check that features can actually be reached by the tooling in the shop before finalizing the design.',
    starred: false
  },
  {
    title: 'Stubbing toes in the bay',
    description: 'Wear closed-toe shoes and handle all parts with care.',
    starred: false
  }
];

const PART_COMMON_NAMES = [
  'Upright',
  'A-Arm',
  'Wheel Hub',
  'Brake Caliper Bracket',
  'Steering Rack Mount',
  'Pedal Box Plate',
  'Seat Mount',
  'Firewall Panel',
  'Battery Segment Plate',
  'Accumulator Bracket',
  'Motor Mount',
  'Chain Tensioner',
  'Sprocket',
  'Differential Mount',
  'Suspension Rocker',
  'Pushrod',
  'Tie Rod',
  'Bell Crank',
  'Impact Attenuator Plate',
  'Main Hoop Gusset',
  'Bearing Carrier',
  'Shock Mount',
  'Dashboard Panel',
  'Cooling Duct',
  'Radiator Bracket',
  'Wiring Harness Bracket',
  'BMS Enclosure',
  'SMD Inter-Segment Board',
  'HV Connector Housing',
  'LV PCB Standoff',
  'Sensor Mount',
  'Aero Mounting Tab',
  'Front Wing Endplate',
  'Rear Wing Element',
  'Undertray Panel',
  'Skid Plate',
  'Tow Hook',
  'Aluminum Standoff',
  'Carbon Fiber Plate',
  'Delrin Spacer'
];

const PART_DESCRIPTIONS = [
  'Machined from 6061-T6 aluminum.',
  'Requires anodizing before assembly.',
  'Load-bearing; verify FEA before manufacturing.',
  'Off-the-shelf component, check lead time.',
  'Waterjet cut, deburr all edges.',
  '3D printed prototype for fit check.',
  'Carbon fiber layup, see manufacturing plan.',
  'Tolerance-critical, inspect after machining.',
  'Interfaces with the chassis at three points.',
  'Reused from last year with minor revisions.'
];

const SUBMISSION_NAMES = [
  'Drawing Draft 1',
  'Drawing Draft 2',
  'Initial CAD',
  'Rev A',
  'Rev B',
  'Rev C',
  'Updated Drawing',
  'Final Drawing',
  'DFM Revision'
];

const SUBMISSION_NOTES = [
  'First pass, looking for feedback on the mounting interface.',
  'Updated per last review comments.',
  'Added tolerances and material callout.',
  'Reduced mass by hollowing out the center.',
  'Ready for manufacturing review.',
  'Fixed the interference with the adjacent bracket.'
];

const REVIEW_NOTES = [
  'make those changes',
  'Looks good, a couple minor comments inline.',
  'Needs tolerance callouts before this can be approved.',
  'Nice work, approved.',
  'Material choice is fine but reconsider the wall thickness.',
  'Interference with the neighboring part, see markup.',
  'Add fillets to the internal corners.',
  'Good to manufacture.'
];

const POPUP_TITLES = [
  'tolerance',
  'add fillet',
  'check clearance',
  'wrong hole size',
  'material callout',
  'deburr edge',
  'interference',
  'reduce mass',
  'verify dimension',
  'fastener spec'
];

const POPUP_DESCRIPTIONS = [
  '+- 1 degree',
  'This corner needs a fillet to reduce the stress concentration.',
  'Add a tolerance to this dimension.',
  'Not enough clearance to the adjacent part here.',
  'This hole should match the mating part pattern.',
  'Call out the material and temper.',
  'Overlaps with the bracket, move it inboard.',
  'Double-check this dimension against CAD.'
];

export const partCountForProject = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 30, value: 0 },
    { weight: 45, value: faker.number.int({ min: 1, max: 8 }) },
    { weight: 20, value: faker.number.int({ min: 9, max: 20 }) },
    { weight: 5, value: faker.number.int({ min: 21, max: 40 }) }
  ]);

const partStatus = (faker: Faker): Review_Status =>
  faker.helpers.weightedArrayElement([
    { weight: 40, value: Review_Status.IN_PROGRESS },
    { weight: 15, value: Review_Status.READY_FOR_REVIEW },
    { weight: 15, value: Review_Status.IN_REVIEW },
    { weight: 15, value: Review_Status.REVIEWED },
    { weight: 15, value: Review_Status.APPROVED }
  ]);

const assigneeCountForPart = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 70, value: 1 },
    { weight: 25, value: 2 },
    { weight: 5, value: 3 }
  ]);

const tagCountForPart = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 35, value: 0 },
    { weight: 35, value: 1 },
    { weight: 22, value: 2 },
    { weight: 8, value: 3 }
  ]);

const submissionCountForStatus = (faker: Faker, status: Review_Status): number => {
  switch (status) {
    case Review_Status.IN_PROGRESS:
      return 0;
    case Review_Status.READY_FOR_REVIEW:
    case Review_Status.IN_REVIEW:
      return faker.number.int({ min: 1, max: 2 });
    case Review_Status.REVIEWED:
    case Review_Status.APPROVED:
      return faker.number.int({ min: 1, max: 3 });
    default:
      return 0;
  }
};

const reviewRequestCountForStatus = (faker: Faker, status: Review_Status): number =>
  status === Review_Status.IN_PROGRESS
    ? faker.helpers.weightedArrayElement([
        { weight: 70, value: 0 },
        { weight: 30, value: 1 }
      ])
    : faker.helpers.weightedArrayElement([
        { weight: 20, value: 0 },
        { weight: 60, value: 1 },
        { weight: 20, value: 2 }
      ]);

const popupCountForStatus = (faker: Faker, status: Review_Status): number => {
  switch (status) {
    case Review_Status.REVIEWED:
      return faker.number.int({ min: 0, max: 5 });
    case Review_Status.IN_REVIEW:
      return faker.number.int({ min: 0, max: 3 });
    case Review_Status.APPROVED:
      return faker.number.int({ min: 0, max: 2 });
    default:
      return 0;
  }
};

const submissionFileCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 80, value: 1 },
    { weight: 20, value: 2 }
  ]);

const submissionHasReview = (status: Review_Status): boolean =>
  status === Review_Status.IN_REVIEW || status === Review_Status.REVIEWED || status === Review_Status.APPROVED;

const reviewIsComplete = (status: Review_Status, isLatestSubmission: boolean): boolean => {
  if (status === Review_Status.IN_REVIEW) return !isLatestSubmission;
  return status === Review_Status.REVIEWED || status === Review_Status.APPROVED;
};

const makeFileIds = (faker: Faker, count: number): string[] => Array.from({ length: count }, () => faker.string.uuid());

type PopupPlan = {
  xCoord: number;
  yCoord: number;
  title: string;
  fileIndex: number;
  description: string;
  createdAt: Date;
};

type ReviewPlan = {
  fileIds: string[];
  notes: string;
  createdAt: Date;
  completedAt?: Date;
  reviewerId: string;
  popups: PopupPlan[];
};

type SubmissionPlan = {
  name: string;
  notes?: string;
  fileIds: string[];
  createdAt: Date;
  authorId: string;
  review?: ReviewPlan;
};

type RequestPlan = { createdAt: Date; requesterId: string; reviewerId: string };

const buildPopups = (
  faker: Faker,
  status: Review_Status,
  submissionFileIds: string[],
  reviewCreatedAt: Date
): PopupPlan[] => {
  const count = popupCountForStatus(faker, status);

  return Array.from({ length: count }, () => ({
    xCoord: faker.number.float({ min: 0, max: 1 }),
    yCoord: faker.number.float({ min: 0, max: 1 }),
    title: faker.helpers.arrayElement(POPUP_TITLES),
    fileIndex: faker.number.int({ min: 0, max: Math.max(0, submissionFileIds.length - 1) }),
    description: faker.datatype.boolean({ probability: 0.7 }) ? faker.helpers.arrayElement(POPUP_DESCRIPTIONS) : '',
    createdAt: reviewCreatedAt
  }));
};

const buildReview = (
  faker: Faker,
  status: Review_Status,
  isLatestSubmission: boolean,
  submissionCreatedAt: Date,
  submissionFileIds: string[],
  timeline: DateRange,
  reviewers: PartActor[]
): ReviewPlan => {
  const reviewerId = faker.helpers.arrayElement(reviewers).userId;
  const createdAt = generateRandomDate(faker, submissionCreatedAt, timeline.end);
  const fileIds = faker.datatype.boolean({ probability: 0.25 })
    ? makeFileIds(faker, faker.number.int({ min: 1, max: 2 }))
    : [];
  const complete = reviewIsComplete(status, isLatestSubmission);
  const completedAt = complete ? generateRandomDate(faker, createdAt, timeline.end) : undefined;
  const popups = buildPopups(faker, status, submissionFileIds, createdAt);

  return {
    fileIds,
    notes: faker.helpers.arrayElement(REVIEW_NOTES),
    createdAt,
    ...(completedAt ? { completedAt } : {}),
    reviewerId,
    popups
  };
};

const buildSubmissions = (
  faker: Faker,
  status: Review_Status,
  partCreatedAt: Date,
  timeline: DateRange,
  authors: PartActor[],
  reviewers: PartActor[]
): SubmissionPlan[] => {
  const count = submissionCountForStatus(faker, status);
  const submissions: SubmissionPlan[] = [];
  let cursor = partCreatedAt;

  for (let i = 0; i < count; i++) {
    const createdAt = generateRandomDate(faker, cursor, timeline.end);
    cursor = createdAt;

    const authorId = faker.helpers.arrayElement(authors).userId;
    const fileIds = makeFileIds(faker, submissionFileCount(faker));
    const isLatestSubmission = i === count - 1;
    const notes = faker.datatype.boolean({ probability: 0.3 }) ? faker.helpers.arrayElement(SUBMISSION_NOTES) : undefined;
    const review = submissionHasReview(status)
      ? buildReview(faker, status, isLatestSubmission, createdAt, fileIds, timeline, reviewers)
      : undefined;

    submissions.push({ name: faker.helpers.arrayElement(SUBMISSION_NAMES), notes, fileIds, createdAt, authorId, review });
  }

  return submissions;
};

const buildRequests = (
  faker: Faker,
  status: Review_Status,
  partCreatedAt: Date,
  timeline: DateRange,
  requesters: PartActor[],
  reviewers: PartActor[]
): RequestPlan[] => {
  const count = reviewRequestCountForStatus(faker, status);

  return Array.from({ length: count }, () => ({
    // Some requests are made at part creation, others added later via updatePart.
    createdAt: generateRandomDate(faker, partCreatedAt, timeline.end),
    requesterId: faker.helpers.arrayElement(requesters).userId,
    reviewerId: faker.helpers.arrayElement(reviewers).userId
  }));
};

const latestDate = (dates: (Date | undefined)[]): Date =>
  dates.reduce<Date>((latest, d) => (d && d.getTime() > latest.getTime() ? d : latest), dates[0] as Date);

export const partTagCreateInput = (
  organizationId: string,
  tag: { name: string; colorHexCode: string }
): Prisma.Part_TagCreateInput => ({
  name: tag.name,
  colorHexCode: tag.colorHexCode,
  organization: { connect: { organizationId } }
});

export const commonMistakeCreateInput = (
  organizationId: string,
  userCreatedId: string,
  mistake: { title: string; description: string; starred: boolean }
): Prisma.Part_Review_Common_MistakeCreateInput => ({
  title: mistake.title,
  description: mistake.description,
  starred: mistake.starred,
  organization: { connect: { organizationId } },
  userCreated: { connect: { userId: userCreatedId } }
});

export const partCreateInput = (
  faker: Faker,
  projectId: string,
  index: number,
  timeline: DateRange,
  creators: PartActor[],
  reviewers: PartActor[],
  tagIds: string[]
): Prisma.PartCreateInput => {
  const status = partStatus(faker);
  const createdAt = generateRandomDate(faker, timeline.start, timeline.end);
  const commonName = faker.helpers.arrayElement(PART_COMMON_NAMES);
  const description = faker.datatype.boolean({ probability: 0.5 })
    ? faker.helpers.arrayElement(PART_DESCRIPTIONS)
    : undefined;

  const creatorId = faker.helpers.arrayElement(creators).userId;
  const assignees = faker.helpers.arrayElements(creators, Math.min(assigneeCountForPart(faker), creators.length));
  const selectedTagIds = faker.helpers.arrayElements(tagIds, Math.min(tagCountForPart(faker), tagIds.length));

  const authors = assignees.length > 0 ? assignees : [{ userId: creatorId }];
  const submissions = buildSubmissions(faker, status, createdAt, timeline, authors, reviewers);
  const requests = buildRequests(faker, status, createdAt, timeline, authors, reviewers);

  // createSubmission copies the first submission's first file into previewImageId when unset.
  const previewImageId = submissions[0]?.fileIds[0];

  // The part's updatedAt tracks its last service write (status flips on submission/review, request
  // add/remove), so it advances to the latest child activity.
  const updatedAt = latestDate([
    createdAt,
    ...submissions.map((s) => s.createdAt),
    ...submissions.flatMap((s) => [s.review?.createdAt, s.review?.completedAt]),
    ...requests.map((r) => r.createdAt)
  ]);

  const submissionsCreate: Prisma.Part_SubmissionCreateWithoutPartInput[] = submissions.map((s) => ({
    name: s.name,
    fileIds: s.fileIds,
    createdAt: s.createdAt,
    updatedAt: s.createdAt,
    ...(s.notes ? { notes: s.notes } : {}),
    userCreated: { connect: { userId: s.authorId } },
    ...(s.review
      ? {
          reviews: {
            create: [
              {
                fileIds: s.review.fileIds,
                notes: s.review.notes,
                createdAt: s.review.createdAt,
                updatedAt: s.review.completedAt ?? s.review.createdAt,
                ...(s.review.completedAt ? { completedAt: s.review.completedAt } : {}),
                userCreated: { connect: { userId: s.review.reviewerId } },
                ...(s.review.popups.length > 0
                  ? {
                      popUps: {
                        create: s.review.popups.map((p) => ({
                          xCoord: p.xCoord,
                          yCoord: p.yCoord,
                          title: p.title,
                          fileIndex: p.fileIndex,
                          description: p.description,
                          createdAt: p.createdAt,
                          updatedAt: p.createdAt
                        }))
                      }
                    }
                  : {})
              }
            ]
          }
        }
      : {})
  }));

  const requestsCreate: Prisma.Part_Review_RequestCreateWithoutPartInput[] = requests.map((r) => ({
    createdAt: r.createdAt,
    requester: { connect: { userId: r.requesterId } },
    reviewerRequested: { connect: { userId: r.reviewerId } }
  }));

  return {
    index,
    commonName,
    status,
    createdAt,
    updatedAt,
    ...(description ? { description } : {}),
    ...(previewImageId ? { previewImageId } : {}),
    project: { connect: { projectId } },
    userCreated: { connect: { userId: creatorId } },
    ...(assignees.length > 0 ? { assignees: { connect: assignees.map((a) => ({ userId: a.userId })) } } : {}),
    ...(selectedTagIds.length > 0 ? { tags: { connect: selectedTagIds.map((partTagId) => ({ partTagId })) } } : {}),
    ...(submissionsCreate.length > 0 ? { submissions: { create: submissionsCreate } } : {}),
    ...(requestsCreate.length > 0 ? { reviewRequests: { create: requestsCreate } } : {})
  };
};

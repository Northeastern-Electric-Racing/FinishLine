import { Part, PartReview, PartReviewRequest, PartSubmission, Review_Status, RoleEnum, User } from 'shared';
import { completePartHistory } from '../../utils/part.utils';

const creator: User = {
  userId: '5',
  firstName: 'Chris',
  lastName: 'Pyle',
  email: 'email',
  role: RoleEnum.ADMIN
};
const reviewer1: User = {
  userId: '8',
  firstName: 'Griffin',
  lastName: 'Cooper',
  email: 'email',
  role: RoleEnum.ADMIN
};
const reviewer2: User = {
  userId: '3',
  firstName: 'Zachary',
  lastName: 'Wen',
  email: 'email',
  role: RoleEnum.ADMIN
};

const partReview1: PartReview = {
  partReviewId: '001',
  fileIds: [],
  notes: '',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-04T01:00:00Z'),
  completedAt: new Date('2024-01-05T01:00:00Z'),
  userCreated: reviewer1
};

const partReview2: PartReview = {
  partReviewId: '002',
  fileIds: [],
  notes: '',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-08T01:00:00Z'),
  completedAt: new Date('2024-01-09T01:01:00Z'),
  userCreated: reviewer2
};

const partReviewComplete: PartReview = {
  partReviewId: '004',
  fileIds: [],
  notes: '',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-12T01:00:00Z'),
  completedAt: new Date('2024-01-13T02:00:00Z'),
  userCreated: reviewer2
};

const partSubmission1: PartSubmission = {
  partSubmissionId: '01',
  fileIds: [],
  name: 'Submission #1',
  notes: 'First Submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReview1],
  createdAt: new Date('2024-01-02T01:00:00Z')
};

const partSubmission2: PartSubmission = {
  partSubmissionId: '02',
  fileIds: [],
  name: 'Submission #2',
  notes: 'Second submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReview2],
  createdAt: new Date('2024-01-06T01:00:00Z')
};

const partSubmission3: PartSubmission = {
  partSubmissionId: '03',
  fileIds: [],
  name: 'Submission #3',
  notes: 'Final submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReviewComplete],
  createdAt: new Date('2024-01-10T01:00:00Z')
};

const reviewReq1: PartReviewRequest = {
  partReviewRequestId: '000',
  partId: '00A',
  requester: creator,
  reviewerRequested: reviewer1,
  createdAt: new Date('2024-01-03T01:00:00Z')
};

const reviewReq2: PartReviewRequest = {
  partReviewRequestId: '001',
  partId: '00A',
  requester: creator,
  reviewerRequested: reviewer1,
  createdAt: new Date('2024-01-07T01:00:00Z')
};

const reviewReq3: PartReviewRequest = {
  partReviewRequestId: '002',
  partId: '00A',
  requester: creator,
  reviewerRequested: reviewer2,
  createdAt: new Date('2024-01-07T01:00:00Z')
};

const reviewReq4: PartReviewRequest = {
  partReviewRequestId: '003',
  partId: '00A',
  requester: creator,
  reviewerRequested: reviewer2,
  createdAt: new Date('2024-01-11T01:00:00Z')
};

const part1: Part = {
  partId: '00A',
  index: 1,
  commonName: 'PROJ_PartName_0000-00A',
  description: '',
  status: Review_Status.APPROVED,
  tags: [],
  projectId: '001',
  assignees: [],
  reviewRequests: [reviewReq1, reviewReq2, reviewReq3, reviewReq4],
  createdAt: new Date('2024-01-01T01:00:00Z'),
  userCreated: creator,
  submissions: [partSubmission1, partSubmission2, partSubmission3]
};

describe('Part Submission History', () => {
  it('Part created history', () => {
    expect(completePartHistory(part1)[0]).toBe('[01/01/24] - PROJ_PartName_0000-00A was created.');
  });
  it('User uploaded first submission includes part name', () => {
    expect(completePartHistory(part1)[1]).toBe('[01/02/24] - Chris Pyle uploaded Submission #1 for PROJ_PartName_0000-00A.');
  });
  it('User requested single review', () => {
    expect(completePartHistory(part1)[2]).toBe('[01/03/24] - Chris Pyle requested a review from Griffin Cooper.');
  });
  it('Reviewer reviewed submission (same day as created so only 1 note)', () => {
    expect(completePartHistory(part1)[3]).toBe(
      '[01/05/24] - Griffin Cooper reviewed Submission #1 (in Submission #1 Review).'
    );
  });
  it('User uploaded second submission w/o part name', () => {
    expect(completePartHistory(part1)[4]).toBe('[01/06/24] - Chris Pyle uploaded Submission #2.');
  });
  it('User requested review from two people combined', () => {
    expect(completePartHistory(part1)[5]).toBe(
      '[01/07/24] - Chris Pyle re-requested a review from Griffin Cooper and requested a review from Zachary Wen.'
    );
  });
  it('User reviewed second submission', () => {
    expect(completePartHistory(part1)[6]).toBe('[01/09/24] - Zachary Wen reviewed Submission #2 (in Submission #2 Review).');
  });
  it('User uploaded third submission', () => {
    expect(completePartHistory(part1)[7]).toBe('[01/10/24] - Chris Pyle uploaded Submission #3.');
  });
  it('User re requests review', () => {
    expect(completePartHistory(part1)[8]).toBe('[01/11/24] - Chris Pyle re-requested a review from Zachary Wen.');
  });
  it('User approves part (last review and part status is approved)', () => {
    expect(completePartHistory(part1)[9]).toBe('[01/13/24] - Zachary Wen approved Submission #3.');
  });
});

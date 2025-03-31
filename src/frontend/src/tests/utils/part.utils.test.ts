import { Part, PartReview, PartSubmission, Permission, Review_Status, RoleEnum, User } from 'shared';
import { completePartHistory } from '../../utils/part.utils';

const user1: User = {
  userId: '5',
  firstName: 'Chris',
  lastName: 'Pyle',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};
const user2: User = {
  userId: '8',
  firstName: 'Griffin',
  lastName: 'Cooper',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};
const user3: User = {
  userId: '3',
  firstName: 'Zachary',
  lastName: 'Wen',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};

const partReviewUncomplete: PartReview = {
  partReviewId: '001',
  fileIds: [],
  notes: 'NOTES FOR A REVIEW',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2022-01-01T00:00:00Z'),
  userCreated: user2
};

const partReviewComplete: PartReview = {
  partReviewId: '002',
  fileIds: [],
  notes: 'NOTES FOR A REVIEW',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2022-01-03T00:00:00Z'),
  completedAt: new Date('2022-01-03T00:00:00Z'),
  userCreated: user2
};

const partSubmission1: PartSubmission = {
  partSubmissionId: '02',
  fileIds: [],
  name: 'PROJ_PartName_0000-00A',
  notes: 'NOTES FOR A SUBMISSION!',
  partId: '002',
  userCreated: user1,
  reviews: [partReviewUncomplete],
  createdAt: new Date('2000-01-02T00:00:00Z')
};

const partInProgress: Part = {
  partId: '00A',
  index: 1,
  commonName: 'Wheel',
  description: 'A wheel part',
  status: Review_Status.IN_PROGRESS,
  tags: [],
  projectId: '001',
  assignees: [user1],
  reviewRequests: [],
  createdAt: new Date('2000-01-01T00:00:00Z'),
  userCreated: user1,
  submissions: [partSubmission1]
};

describe('Part Submission History', () => {
  it('Part created history', () => {
    const response: String = '';
    expect(completePartHistory(partInProgress)).toEqual(response);
    // [01/01/24] - PROJ_PartName_0000-00A was created.
  });
  it('User uploaded first submission includes part name', () => {
    // [01/01/24] - Joseph Aoun uploaded Submission #1 for PROJ_PartName_0000-00A.
  });
  it('User uploaded second submission w/o part name', () => {
    // [01/01/24] - Joseph Aoun uploaded Submission #2
  });
  it('User requested review', () => {
    // [01/01/24] - Joseph Aoun requested a review from Jacob Brown.
  });
  it('User re-requested review', () => {
    // [01/03/24] - Joseph Aoun re-requested a review from Jacob Brown.
  });
  it('User requested review from two people combined', () => {
    // [01/01/24] - Joseph Aoun requested a review from Jacob Brown and George Miller.
  });
  it('Reviewer began reviewing submission', () => {
    // [01/01/24] - George Miller began reviewing Submission #1
  });
  it('Reviewer reviewed submission', () => {
    // [01/03/24] - George Miller reviewed Submission #1 (in Submission #1 Review)
  });
  it('Reviewer approved last submission', () => {
    // [01/05/24] - George Miller approved Submission #3
  });
});

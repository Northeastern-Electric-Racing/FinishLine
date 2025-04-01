import { Part, PartReview, PartSubmission, Review_Status, RoleEnum, User } from 'shared';
import { completePartHistory } from '../../utils/part.utils';

const creator: User = {
  userId: '5',
  firstName: 'Chris',
  lastName: 'Pyle',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};
const reviewer1: User = {
  userId: '8',
  firstName: 'Griffin',
  lastName: 'Cooper',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};
const reviewer2: User = {
  userId: '3',
  firstName: 'Zachary',
  lastName: 'Wen',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};

const partReview1: PartReview = {
  partReviewId: '001',
  fileIds: [],
  notes: 'NOTES FOR A REVIEW',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-02T12:00:00Z'),
  completedAt: new Date('2024-01-03T12:00:00Z'),
  userCreated: reviewer1
};

const partReview2: PartReview = {
  partReviewId: '002',
  fileIds: [],
  notes: 'NOTES FOR A REVIEW',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-04T12:00:00Z'),
  userCreated: reviewer1
};

const partReview3: PartReview = {
  partReviewId: '003',
  fileIds: [],
  notes: 'NOTES FOR A REVIEW',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-04T12:00:00Z'),
  userCreated: reviewer2
};

const partReviewComplete: PartReview = {
  partReviewId: '004',
  fileIds: [],
  notes: 'NOTES FOR A REVIEW',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-07T00:00:00Z'),
  completedAt: new Date('2024-01-07T00:12:00Z'),
  userCreated: reviewer1
};

const partSubmission1: PartSubmission = {
  partSubmissionId: '01',
  fileIds: [],
  name: 'Submission #1',
  notes: 'First Submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReview1],
  createdAt: new Date('2024-01-02T00:00:00Z')
};

const partSubmission2: PartSubmission = {
  partSubmissionId: '02',
  fileIds: [],
  name: 'Submission #2',
  notes: 'Second submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReview2, partReview3],
  createdAt: new Date('2024-01-04T00:00:00Z')
};

const partSubmission3: PartSubmission = {
  partSubmissionId: '03',
  fileIds: [],
  name: 'Submission #3',
  notes: 'Final submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReviewComplete],
  createdAt: new Date('2024-01-06T00:00:00Z')
};

const part1: Part = {
  partId: '00A',
  index: 1,
  commonName: 'PROJ_PartName_0000-00A',
  description: 'A wheel part',
  status: Review_Status.APPROVED,
  tags: [],
  projectId: '001',
  assignees: [creator],
  reviewRequests: [],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  userCreated: reviewer2, //any other user
  submissions: [partSubmission1, partSubmission2, partSubmission3]
};

describe('Part Submission History', () => {
  it('Part created history', () => {
    const response: string = '[01/01/24] - PROJ_PartName_0000-00A was created';
    expect(completePartHistory(part1)[0]).toBe(response);

    //Received: "[12/31/23] - PROJ_PartName_0000-00A was created"
  });
  it('User uploaded first submission includes part name', () => {
    const response: string = '[01/02/24] - Chris Pyle uploaded Submission #1 for PROJ_PartName_0000-00A';
    expect(completePartHistory(part1)[1]).toBe(response);

    //Received: "[12/31/23] - Griffin Cooper began reviewing Submission #1"
  });
  it('User requested single review', () => {
    const response: string = '[01/02/24] - Chris Pyle requested a review from Griffin Cooper';
    expect(completePartHistory(part1)[2]).toBe(response);
  });
  it('Reviewer began reviewing submission', () => {
    const response: string = '[01/02/24] - Griffin Cooper began reviewing Submission #1';
    expect(completePartHistory(part1)[3]).toBe(response);
  });
  it('Reviewer finished reviewing submission', () => {
    const response: string = '[01/02/24] - Griffin Cooper reviewed Submission #1 (in Submission #1 Review)';
    expect(completePartHistory(part1)[4]).toBe(response);
  });
  it('User requested review from two people combined', () => {
    // [01/01/24] - Joseph Aoun requested a review from Jacob Brown and George Miller.
    const response: string = '?';
    expect(completePartHistory(part1)[5]).toBe(response);
  });
  it('Reviewer began reviewing submission', () => {
    // [01/01/24] - George Miller began reviewing Submission #1
    const response: string = '?';
    expect(completePartHistory(part1)[6]).toBe(response);
  });
  it('Reviewer reviewed submission', () => {
    // [01/03/24] - George Miller reviewed Submission #1 (in Submission #1 Review)
    const response: string = '?';
    expect(completePartHistory(part1)[7]).toBe(response);
  });
  it('Reviewer approved last submission', () => {
    // [01/05/24] - George Miller approved Submission #3
    const response: string = '[01/01/24] - name approved Submission #3';
    expect(completePartHistory(part1)[8]).toBe(response);

    //undefined
  });
});

import { Part, PartReview, PartReviewRequest, PartSubmission, Review_Status, RoleEnum, User } from 'shared';
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
    const response: string = '[01/01/24] - PROJ_PartName_0000-00A was created.';
    expect(completePartHistory(part1)[0]).toBe(response);
  });
  it('User uploaded first submission includes part name', () => {
    // userCreated or assignees???
    const response: string = '[01/02/24] - Chris Pyle uploaded Submission #1 for PROJ_PartName_0000-00A.';
    expect(completePartHistory(part1)[1]).toBe(response);
  });
  it('User requested single review', () => {
    const response: string = '[01/03/24] - Chris Pyle requested a review from Griffin Cooper.';
    expect(completePartHistory(part1)[2]).toBe(response);
  });
  it('Reviewer began reviewing submission', () => {
    const response: string = '[01/04/24] - Griffin Cooper began reviewing Submission #1.';
    expect(completePartHistory(part1)[3]).toBe(response);
  });
  it('Reviewer finished reviewing submission', () => {
    const response: string = '[01/05/24] - Griffin Cooper reviewed Submission #1 (in Submission #1 Review).';
    expect(completePartHistory(part1)[4]).toBe(response);
  });
  it('User uploaded second submission w/o part name', () => {
    const response: string = '[01/06/24] - Chris Pyle uploaded Submission #2.';
    expect(completePartHistory(part1)[5]).toBe(response);
  });
  it('User requested review from two people combined', () => {
    const response: string = '[01/07/24] - Chris Pyle requested a review from Griffin Cooper and Zachary Wen.';
    expect(completePartHistory(part1)[6]).toBe(response);
  });
  it('Reviewer reviewed submission', () => {
    const response: string = '[01/08/24] - Zachary Wen began reviewing Submission #2.';
    expect(completePartHistory(part1)[7]).toBe(response);
  });
  it('Reviewer approved submission', () => {
    const response: string = '[01/09/24] - Zachary Wen reviewed Submission #2 (in Submission #2 Review).';
    expect(completePartHistory(part1)[8]).toBe(response);
  });
  it('Sub 3', () => {
    const response: string = '[01/10/24] - Chris Pyle uploaded Submission #3.';
    expect(completePartHistory(part1)[9]).toBe(response);
  });
  it('Re-Request Review', () => {
    const response: string = '[01/11/24] - Chris Pyle re-requested a review from Zachary Wen.';
    expect(completePartHistory(part1)[10]).toBe(response);
  });
  it('Began Reviewing', () => {
    const response: string = '[01/12/24] - Zachary Wen began reviewing Submission #3.';
    expect(completePartHistory(part1)[11]).toBe(response);
  });
  it('Last Review Approves?', () => {
    const response: string = '[01/13/24] - Zachary Wen reviewed Submission #3 (in Submission #3 Review).';
    expect(completePartHistory(part1)[12]).toBe(response);
  });
  it('Complete History for viewing', () => {
    const response: string = '...';
    expect(completePartHistory(part1)).toBe(response);
  });
});

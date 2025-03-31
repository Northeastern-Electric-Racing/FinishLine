import { Part, PartReviewRequest, PartSubmission, Review_Status, User } from 'shared';

type HistoryEntry = [Date, string];

/* [01/01/24] - PROJ_PartName_0000-00A was created. */
export const getPartCreationHistory = (createdAt: Date, name: String): HistoryEntry[] => {
  return [[new Date(createdAt), `${name} was created`]];
};

/* [01/01/24] - Joseph Aoun uploaded Submission #1 for PROJ_PartName_0000-00A. */
/* [01/01/24] - Joseph Aoun uploaded Submission #2 */
export const getSubmissionHistory = (user: User, submissions: PartSubmission[], name: String): HistoryEntry[] => {
  if (submissions.length === 0) return [];

  const firstSubmission = [...submissions]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .at(0);

  return submissions.map((sub) => {
    const isFirstSubmission = firstSubmission && sub.createdAt === firstSubmission.createdAt;
    const message = isFirstSubmission ? `${user} uploaded ${sub.name} for ${name}` : `${user} uploaded ${sub.name}`;

    return [new Date(sub.createdAt), message];
  });
};

/* [01/01/24] - Joseph Aoun requested a review from Jacob Brown and George Miller. */
// [Date] - [User] requested a review from [PartReviewRequest.reviewerRequested] and [PartReviewRequest.reviewerRequested]
// Two different PartReviewRequests on the same date from the same User should be combined
/* [01/03/24] - Joseph Aoun re-requested a review from George Miller. */
export const getReviewRequestHistory = (user: User, reviewRequests: PartReviewRequest[]): HistoryEntry[] => {
  if(reviewRequests.length === 0) return [];

  reviewRequests.forEach((req) => {});

  return [[new Date(reviewRequests[0].createdAt), `?`]]; // repeat for all review requests and combine if on the same date
};

/* [01/01/24] - George Miller began reviewing Submission #1 */
// [Date] - [User/PartReviewRequest.reviewerRequested] began reviewing [PartSubmission.name]

/* [01/03/24] - George Miller reviewed Submission #2(added comments) */
// [Date] -  [User/PartReviewRequest.reviewerRequested] reviewed [PartSubmission.name](added comments)

/* [01/01/24] - George Miller reviewed Submission #1 (in Submission #1 Review)*/
// [Date] - [User/PartReviewRequest.reviewerRequested] reviewed [PartSubmission.name] (in [PartReview.submissionId?])

/* [01/05/24] - George Miller approved Submission #3 */
// [Date] - [User/PartReviewRequest.reviewerRequested] approved [PartSubmission.name]
// Check for PartPreview.status.APPROVED

export const getReviewHistory = (reviewer: User, submissions: PartSubmission[]): HistoryEntry[] => {
  if (submissions.length === 0) return [];

  submissions.forEach(sub => {
    // figure out the status using submission id? NOT PartPreview.status
    // using completed at (check if approved),
    // using notes? ("added comments")
  });
  return [[new Date(submissions[0].createdAt), `?`]]; // repeat for all submissions
};

export const completePartHistory = (part: Part): HistoryEntry[] => {
  const history = [
    ...getPartCreationHistory(part.createdAt, part.commonName),
    ...getSubmissionHistory(part.userCreated, part.submissions, part.commonName),
    ...getReviewRequestHistory(part.userCreated, part.reviewRequests),
    ...getReviewHistory(part.userCreated, part.submissions)
  ];
  return history.sort((a, b) => a[0].getTime() - b[0].getTime());
};

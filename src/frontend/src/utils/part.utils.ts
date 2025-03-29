import { Part, Review_Status } from 'shared';

// return tuples of [date, data] for each of the
// different actions that need to be processed
type HistoryEntry = [Date, string];

/* [01/01/24] - PROJ_PartName_0000-00A was created. */
// [Date] - [PartPreview.commonName] was created
export const getPartCreationHistory = (part: Part): HistoryEntry[] => {
  return [[new Date(part.createdAt), `${part.commonName} was created`]];
};

/* [01/01/24] - Joseph Aoun uploaded Submission #1 for PROJ_PartName_0000-00A. */
// [Date] - [User] uploaded [PartSubmission.name] for [Part Project Name]
/* [01/01/24] - Joseph Aoun uploaded Submission #2 */
export const getSubmissionHistory = (part: Part): HistoryEntry[] => {
  return; // all uploads as tuples
};

/* [01/01/24] - Joseph Aoun requested a review from Jacob Brown and George Miller. */
// [Date] - [User] requested a review from [PartReviewRequest.reviewerRequested] and [PartReviewRequest.reviewerRequested]
// Two different PartReviewRequests on the same date from the same User should be combined

/* [01/03/24] - Joseph Aoun re-requested a review from George Miller. */
// [Date] -
export const getReviewRequestHistory = (part: Part): HistoryEntry[] => {
  return;
};

/* [01/01/24] - George Miller began reviewing Submission #1 */
// [Date] - [User/PartReviewRequest.reviewerRequested] began reviewing [PartSubmission.name]

/* [01/03/24] - George Miller reviewed Submission #2(added comments) */
// [Date] -  [User/PartReviewRequest.reviewerRequested] reviewed [PartSubmission.name](added comments)
// Check for 'added commends' by checking PartReview.notes?

/* [01/01/24] - George Miller reviewed Submission #1 (in Submission #1 Review)*/
// [Date] - [User/PartReviewRequest.reviewerRequested] reviewed [PartSubmission.name] (in [PartReview.submissionId?])
export const getReviewHistory = (part: Part): HistoryEntry[] => {
  Review_Status;
  return;
};

/* [01/05/24] - George Miller approved Submission #3 */
// [Date] - [User/PartReviewRequest.reviewerRequested] approved [PartSubmission.name]
// Check for PartPreview.status.APPROVED

export const completePartHistory = (part: Part): HistoryEntry[] => {
  const history = [
    ...getPartCreationHistory(part),
    ...getSubmissionHistory(part),
    ...getReviewRequestHistory(part),
    ...getReviewHistory(part)
  ];
  return history.sort((a, b) => a[0].getTime() - b[0].getTime());
};

import { Part, PartReview, PartReviewRequest, PartSubmission, Review_Status, User } from 'shared';

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

  // Includes part name if first submission upload
  return submissions.map((sub) => {
    const isFirstSubmission = firstSubmission && sub.createdAt === firstSubmission.createdAt;
    const message = isFirstSubmission
      ? `${user.firstName} ${user.lastName} uploaded ${sub.name} for ${name}`
      : `${user} uploaded ${sub.name}`;

    return [new Date(sub.createdAt), message];
  });
};

/* [01/01/24] - Joseph Aoun requested a review from Jacob Brown and George Miller. */
/* [01/03/24] - Joseph Aoun re-requested a review from George Miller. */
export const getReviewRequestHistory = (reviewRequests: PartReviewRequest[]): HistoryEntry[] => {
  if (reviewRequests.length === 0) return [];

  const historyEntries: HistoryEntry[] = [];
  const combinedRequests = new Map<Date, Map<User, Set<string>>>();

  reviewRequests.forEach(({ createdAt, requester, reviewerRequested }) => {
    const date = new Date(createdAt);

    if (!combinedRequests.has(date)) combinedRequests.set(date, new Map());
    const requesters = combinedRequests.get(date)!;

    if (!requesters.has(requester)) requesters.set(requester, new Set());

    const messages = requesters.get(requester)!;
    const isReRequest = [...messages].some((msg) => msg.includes(reviewerRequested.userId));

    // Re-request if already requested from the specific reviewerRequested
    messages.add(`${isReRequest ? 're-requested' : 'requested'} a review from ${reviewerRequested.userId}`);
  });

  // Two different requests on the same date from the same User should be combined
  combinedRequests.forEach((requesters, date) => {
    const messages = Array.from(requesters.entries()).map(
      ([requester, reviews]) => `${requester} ${Array.from(reviews).join(' and ')}.`
    );
    historyEntries.push([date, messages.join(' ')]);
  });

  // Sort the history entries by date
  return historyEntries.sort((a, b) => a[0].getTime() - b[0].getTime());
};

/* [01/01/24] - George Miller began reviewing Submission #1 */
/* [01/03/24] - George Miller reviewed Submission #1 (in Submission #1 Review)*/
/* [01/03/24] - George Miller reviewed Submission #2(added comments) */
/* [01/05/24] - George Miller approved Submission #3 */
export const getReviewHistory = (submissions: PartSubmission[]): HistoryEntry[] => {
  if (submissions.length === 0) return [];
  const historyEntries: HistoryEntry[] = [];

  submissions.forEach((sub) => {
    // Each reviewer gets a separate "began" and "approved"
    const reviewsForReviewer = new Map<User, PartReview[]>();
    sub.reviews.forEach((review) => {
      const reviewer = review.userCreated;
      if (!reviewsForReviewer.has(reviewer)) {
        reviewsForReviewer.set(reviewer, []);
      }
      reviewsForReviewer.get(reviewer)!.push(review);
    });

    // Process each reviewer individually
    reviewsForReviewer.forEach((reviews, reviewer) => {
      processReviewerHistory(reviews, reviewer, sub.name, historyEntries);
    });
  });
  return historyEntries;
};

// Processes an individual reviewer's history in a submission
export const processReviewerHistory = (
  reviews: PartReview[],
  reviewer: User,
  subName: string,
  historyEntries: HistoryEntry[]
) => {
  const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
  reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (reviews.length === 0) return;

  // Began reviewing first review by this reviewer
  const firstReview = reviews[0];
  historyEntries.push([new Date(firstReview.createdAt), `${reviewerName} began reviewing ${subName}`]);

  reviews.forEach((review) => {
    let message = ``;
    if (review.completedAt) {
      message += `${reviewerName} reviewed ${subName} `;
    }
    message += `(in ${subName} Review)`;

    historyEntries.push([new Date(review.createdAt), message]);
  });

  // Check if last review was approved
  const lastreview = reviews.at(-1);
  if (lastreview?.completedAt) {
    historyEntries.push([new Date(lastreview.completedAt), `${reviewerName} approved ${subName}`]);
  }
};

export const completePartHistory = (part: Part): HistoryEntry[] => {
  const history = [
    ...getPartCreationHistory(part.createdAt, part.commonName),
    ...getSubmissionHistory(part.userCreated, part.submissions, part.commonName),
    ...getReviewRequestHistory(part.reviewRequests),
    ...getReviewHistory(part.submissions)
  ];
  return history.sort((a, b) => a[0].getTime() - b[0].getTime());
};

import { Part, PartReview, PartReviewRequest, PartSubmission, Review_Status, User } from 'shared';
import { yellow, blue, purple, green, grey } from '@mui/material/colors';

type HistoryEntry = [Date, string];

export const getPartCreationHistory = (createdAt: Date, name: String): HistoryEntry[] => {
  return [[new Date(createdAt), `${name} was created`]];
};

export const getSubmissionHistory = (submissions: PartSubmission[], name: String): HistoryEntry[] => {
  if (submissions.length === 0) return [];
  const firstSubmission = [...submissions]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .at(0);

  // Includes part name if first submission upload
  return submissions.map((sub) => {
    const isFirstSubmission = firstSubmission && sub.createdAt === firstSubmission.createdAt;
    const message = isFirstSubmission
      ? `${sub.userCreated.firstName} ${sub.userCreated.lastName} uploaded ${sub.name} for ${name}`
      : `${sub.userCreated.firstName} ${sub.userCreated.lastName} uploaded ${sub.name}`;

    return [new Date(sub.createdAt), message];
  });
};

export const getReviewRequestHistory = (reviewRequests: PartReviewRequest[]): HistoryEntry[] => {
  if (reviewRequests.length === 0) return [];

  const historyEntries: HistoryEntry[] = [];
  // Tracking for ' and ' concatenation
  const combinedRequests = new Map<string, Map<User, Set<string>>>();
  // Tracking for re-request vs request
  const previousRequests = new Map<User, Set<User>>();

  reviewRequests.forEach(({ createdAt, requester, reviewerRequested }) => {
    // Reformatted date for comparisons
    const [formattedDate] = new Date(createdAt).toISOString().split('T');

    if (!combinedRequests.has(formattedDate)) combinedRequests.set(formattedDate, new Map());
    const requesters = combinedRequests.get(formattedDate)!;

    if (!requesters.has(requester)) requesters.set(requester, new Set());
    const messages = requesters.get(requester)!;

    if (!previousRequests.has(requester)) previousRequests.set(requester, new Set());
    const pastReviewers = previousRequests.get(requester)!;

    const isReRequest = pastReviewers.has(reviewerRequested);

    const action = isReRequest ? 're-requested a review from' : 'requested a review from';
    messages.add(`${action} ${reviewerRequested.firstName} ${reviewerRequested.lastName}`);

    pastReviewers.add(reviewerRequested);
  });

  // Combine multiple requests from the same requester on the same date
  combinedRequests.forEach((requesters, formattedDate) => {
    const date = new Date(formattedDate);
    const messages = Array.from(requesters.entries()).map(([requester, reviews]) => {
      const reviewMessages = Array.from(reviews);
      return `${requester.firstName} ${requester.lastName} ${reviewMessages.join(' and ')}`;
    });
    historyEntries.push([date, messages.join(' ')]);
  });

  return historyEntries.sort((a, b) => a[0].getTime() - b[0].getTime());
};

export const getReviewHistory = (submissions: PartSubmission[]): HistoryEntry[] => {
  if (submissions.length === 0) return [];
  const historyEntries: HistoryEntry[] = [];

  submissions.forEach((sub) => {
    // Each reviewer gets a separate "began reviewing" and "reviewed"
    const reviewsForReviewer = new Map<User, PartReview[]>();
    sub.reviews.forEach((review) => {
      const reviewer = review.userCreated;
      if (!reviewsForReviewer.has(reviewer)) {
        reviewsForReviewer.set(reviewer, []);
      }
      reviewsForReviewer.get(reviewer)!.push(review);
    });

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

  const [firstReview] = reviews;
  historyEntries.push([new Date(firstReview.createdAt), `${reviewerName} began reviewing ${subName}`]);

  reviews.forEach((review) => {
    if (review.completedAt) {
      const message = `${reviewerName} reviewed ${subName} (in ${subName} Review)`;
      historyEntries.push([new Date(review.completedAt), message]);
    }
  });
};

export const completePartHistory = (part: Part): string[] => {
  const history = [
    ...getPartCreationHistory(part.createdAt, part.commonName),
    ...getSubmissionHistory(part.submissions, part.commonName),
    ...getReviewRequestHistory(part.reviewRequests),
    ...getReviewHistory(part.submissions)
  ];
  const result: string[] = [];
  history
    .sort((a, b) => a[0].getTime() - b[0].getTime())
    .forEach(([date, message]) => {
      const formattedDate = date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      });
      result.push(`[${formattedDate}] - ${message}.`);
    });
  return result;
};

// converts statuses from ALL CAPS to Title Case
export const formatPartStatus = (status: Review_Status): string => {
  return status
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};

export const getStatusColor = (status: Review_Status): string => {
  switch (status) {
    case Review_Status.IN_PROGRESS:
      return yellow[700];
    case Review_Status.READY_FOR_REVIEW:
      return blue[600];
    case Review_Status.IN_REVIEW:
      return purple[600];
    case Review_Status.REVIEWED:
      return green[600];
    case Review_Status.APPROVED:
      return green[800];
    default:
      return grey[600];
  }
};

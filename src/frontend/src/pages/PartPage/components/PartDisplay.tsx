import React from 'react';
import { Box, Typography } from '@mui/material';
import { Part, Review_Status, User } from 'shared';

interface PartDisplayProps {
  part: Part;
  contentAmount: 'compact' | 'standard' | 'full';
}

// reusing someone else's function that hasn't been merged yet to maintain consistent formatting
const getReviewStatusColor = (status: Review_Status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return '#FF7700';
    case 'READY_FOR_REVIEW':
      return '#FF5500';
    case 'IN_REVIEW':
      return '#F57600';
    case 'REVIEWED':
      return '#3DA848';
    case 'APPROVED':
      return '#D633FF';
    default:
      return '#535151';
  }
};

const getReviewStatusDisplayName = (status: Review_Status): string => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'Review In Progress';
    case 'READY_FOR_REVIEW':
      return 'Ready For Review';
    case 'IN_REVIEW':
      return 'In Review';
    case 'REVIEWED':
      return 'Reviewed';
    case 'APPROVED':
      return 'Approved';
    default:
      return 'N/A';
  }
};

const getBoxWidth = (contentAmount: String) => {
  switch (contentAmount) {
    case 'small':
      return '400px';
    case 'medium':
      return '600px';
    default:
      return 'NA';
  }
};

// defined a Pill shape for the review status display
const Pill = ({ label = '', bgColor = 'background.paper' }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px',
        backgroundColor: bgColor,
        padding: '4px 12px',
        marginRight: '20px',
        minHeight: '24px',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'white',
        userSelect: 'none',
        width: '121px'
      }}
    >
      {label}
    </Box>
  );
};

const PartDisplay: React.FC<PartDisplayProps> = ({ part, contentAmount }) => {
  // Gets part name in the format shown in the ticket
  const PartName = `${part.projectId}_${part.commonName}_${part.partId}`;

  // helper that puts a users first and last name into one string with a space
  const getUserFullName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };

  //sorts submissions by date to help later with getting latest submission and latest reviewer
  const sortedSubmissions = [...part.submissions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // latest submission as a formatted string
  const latestSubmission = getUserFullName(sortedSubmissions[0].userCreated);

  // sorts reviews of the most recent submission by date
  const sortedReviews = [...sortedSubmissions[0].reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // latest reviewer
  const latestReviewer = sortedSubmissions[0].reviews.length === 0 ? 'None' : getUserFullName(sortedReviews[0].userCreated);

  // gets assignees as a formatted string
  const assigneesString =
    part.assignees.length === 0 ? 'None' : part.assignees.map((assignee) => getUserFullName(assignee)).join('\n');

  // allReviewers is a set that collects every reviewer from every submission for the purpose of avoiding duplicates
  // because the same person could review two different submissions
  const allReviewersSet =
    part.submissions.length === 0
      ? []
      : (() => {
          const reviewersSet = new Set();

          // iterate through all submissions
          part.submissions.forEach((submission) => {
            if (submission.reviews) {
              // iterate through each review
              submission.reviews.forEach((review) => {
                reviewersSet.add(getUserFullName(review.userCreated));
              });
            }
          });

          return Array.from(reviewersSet);
        })();

  // formats the output from allReviewersSet
  const allReviewersString = allReviewersSet.length === 0 ? 'None' : allReviewersSet.join('\n');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: (theme) => theme.palette.grey[800],
        borderRadius: 2,
        p: 2,
        mb: 1,
        maxWidth: getBoxWidth(contentAmount),
        width: '100%'
      }}
    >
      <Box sx={{ width: '175px', display: 'flex' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {PartName}
        </Typography>
      </Box>

      {(contentAmount === 'standard' || contentAmount === 'full') && (
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2" whiteSpace="pre-line">
            {assigneesString}
          </Typography>
        </Box>
      )}

      {(contentAmount === 'standard' || contentAmount === 'full') && (
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2" whiteSpace="pre-line">
            {allReviewersString}
          </Typography>
        </Box>
      )}

      {contentAmount === 'full' && (
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2">{latestReviewer}</Typography>
        </Box>
      )}

      {contentAmount === 'full' && (
        <Box sx={{ display: 'flex' }}>
          <Typography variant="body2">{latestSubmission}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex' }}>
        <Pill label={getReviewStatusDisplayName(part.status)} bgColor={getReviewStatusColor(part.status)} />
      </Box>
    </Box>
  );
};

export default PartDisplay;

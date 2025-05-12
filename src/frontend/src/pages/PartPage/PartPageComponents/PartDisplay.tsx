import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { Review_Status } from 'shared';
import { fullNamePipe } from '../../../utils/pipes';
import { useSinglePart } from '../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Link as RouterLink } from 'react-router-dom';

interface PartDisplayProps {
  index: number;
  wbsNum: string;
  contentAmount: 'compact' | 'standard' | 'full';
}

const getReviewStatusColor = (status: Review_Status) => {
  return {
    IN_PROGRESS: '#FF7700',
    READY_FOR_REVIEW: '#FF5500',
    IN_REVIEW: '#F57600',
    REVIEWED: '#3DA848',
    APPROVED: '#D633FF',
    default: '#535151'
  }[status];
};

const getReviewStatusDisplayName = (status: Review_Status): string => {
  return {
    IN_PROGRESS: 'In Progress',
    READY_FOR_REVIEW: 'Ready for Review',
    IN_REVIEW: 'In Review',
    REVIEWED: 'Reviewed',
    APPROVED: 'Approved',
    default: 'Unknown'
  }[status];
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
        minHeight: '24px',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'white',
        userSelect: 'none'
      }}
    >
      <Typography fontSize="12px">{label}</Typography>
    </Box>
  );
};

const PartDisplay: React.FC<PartDisplayProps> = ({ index, wbsNum, contentAmount }) => {
  const redirectUrl = `/projects/${wbsNum}/part/${index}`;
  const { data: part, isLoading, isError, error } = useSinglePart(wbsNum, index);
  if (isLoading || !part) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  // Gets part name in the format shown in the ticket
  const partName = `${part.commonName}_${part.index}`;

  //sorts submissions by date to help later with getting latest submission and latest reviewer
  const sortedSubmissions = part.submissions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // latest submission as a formatted string
  const latestSubmission = sortedSubmissions.length !== 0 ? fullNamePipe(sortedSubmissions[0].userCreated) : '';

  // sorts reviews of the most recent submission by date
  const sortedReviews =
    sortedSubmissions.length !== 0
      ? sortedSubmissions[0].reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];

  // latest reviewer
  const latestReviewer =
    sortedSubmissions.length !== 0 && sortedSubmissions[0].reviews.length !== 0
      ? sortedSubmissions[0].reviews.length === 0
        ? 'None'
        : fullNamePipe(sortedReviews[0].userCreated)
      : 'No Reviews Yet';

  // gets assignees as a formatted string
  const assigneesString =
    part.assignees.length === 0 ? 'None' : part.assignees.map((assignee) => fullNamePipe(assignee)).join('\n');

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
                reviewersSet.add(fullNamePipe(review.userCreated));
              });
            }
          });

          return Array.from(reviewersSet);
        })();

  // formats the output from allReviewersSet
  const allReviewersString = allReviewersSet.length === 0 ? 'None' : allReviewersSet.join('\n');

  return (
    <Link component={RouterLink} to={redirectUrl} sx={{ textDecoration: 'none', color: 'inherit' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: (theme) => theme.palette.grey[800],
          borderRadius: 2,
          p: 2,
          mb: 1,
          width: '100%',
          '&:hover': redirectUrl
            ? {
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            : {}
        }}
      >
        <Box
          sx={{
            width: contentAmount === 'compact' ? `60%` : contentAmount === 'standard' ? `40%` : `25%`,
            display: 'flex',
            alignItems: 'left'
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {partName}
          </Typography>
        </Box>

        {(contentAmount === 'standard' || contentAmount === 'full') && (
          <Box
            sx={{
              width: `15%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" whiteSpace="pre-line">
              {assigneesString}
            </Typography>
          </Box>
        )}

        {(contentAmount === 'standard' || contentAmount === 'full') && (
          <Box
            sx={{
              width: `15%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" whiteSpace="pre-line">
              {allReviewersString}
            </Typography>
          </Box>
        )}

        {contentAmount === 'full' && (
          <Box
            sx={{
              width: `15%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2">{latestReviewer}</Typography>
          </Box>
        )}

        {contentAmount === 'full' && (
          <Box
            sx={{
              width: `15%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2">{latestSubmission}</Typography>
          </Box>
        )}

        <Box
          sx={{
            width: contentAmount === 'compact' ? `40%` : `20%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <Pill label={getReviewStatusDisplayName(part.status)} bgColor={getReviewStatusColor(part.status)} />
        </Box>
      </Box>
    </Link>
  );
};

export default PartDisplay;

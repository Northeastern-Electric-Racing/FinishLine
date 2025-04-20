import React from 'react';
import { Box, Typography } from '@mui/material';
import { Part, Review_Status } from 'shared';

interface PartDisplayProps {
  part: Part;
  screenSize: 'small' | 'medium' | 'large';
}

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
        userSelect: 'none',
        width: '121px'
      }}
    >
      {label}
    </Box>
  );
};

const PartDisplay: React.FC<PartDisplayProps> = ({ part, screenSize }) => {
  // helper to get part name in the format shown in the ticket
  const getPartName = () => {
    const partNumber = part.partId;
    return `${part.projectId}_${part.commonName}_${partNumber}`;
  };

  // helper to get latest submission
  const getLatestSubmission = () => {
    if (part.submissions.length === 0) return 'None';

    // sorts submissions by date
    const sortedSubmissions = [...part.submissions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const [latestSubmission] = sortedSubmissions;

    return `${latestSubmission.userCreated.firstName} ${latestSubmission.userCreated.lastName}`;
  };

  // helper to get latest reviewer
  const getLatestReview = () => {
    if (part.submissions.length === 0) return 'None';

    // sort submissions by date
    const sortedSubmissions = [...part.submissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const [latestSubmission] = sortedSubmissions;

    if (latestSubmission.reviews.length > 0) {
      // sort reviews by date
      const sortedReviews = [...latestSubmission.reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const [latestReview] = sortedReviews;

      return `${latestReview.userCreated.firstName} ${latestReview.userCreated.lastName}`;
    }

    return 'None';
  };

  // helper to get assignees as a formatted string
  const getAssignees = () => {
    if (part.assignees.length > 0) {
      return part.assignees.map((assignee) => `${assignee.firstName} ${assignee.lastName}`).join('\n');
    }
    return 'None';
  };

  const getAllReviewers = () => {
    if (part.submissions.length === 0) {
      return [];
    }

    const reviewersSet = new Set();

    // iterate through all submissions
    part.submissions.forEach((submission) => {
      if (submission.reviews) {
        // iterate through each review
        submission.reviews.forEach((review) => {
          const reviewer = review.userCreated;
          const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
          reviewersSet.add(reviewerName);
        });
      }
    });

    return Array.from(reviewersSet);
  };

  // formats the output from getAllReviewers
  const getReviewers = () => {
    const allReviewers = getAllReviewers();

    if (allReviewers.length > 0) {
      return allReviewers.join('\n');
    }
    return 'None';
  };

  // small screen (1/3 of screen width)
  if (screenSize === 'small') {
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
          maxWidth: '400px',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {getPartName()}
          </Typography>
          <Typography variant="caption">Last updated by {getLatestSubmission()}</Typography>
        </Box>

        <Box sx={{ width: '35%', display: 'flex', justifyContent: 'flex-end' }}>
          <Pill label={getReviewStatusDisplayName(part.status)} bgColor={getReviewStatusColor(part.status)} />
        </Box>
      </Box>
    );
  }

  // medium screen (1/2 of screen width)
  if (screenSize === 'medium') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: (theme) => theme.palette.grey[800],
          /*bgcolor: 'background.paper', */
          borderRadius: 2,
          paddingX: 2,
          paddingY: 1,
          mb: 1,
          maxWidth: '600px',
          width: '100%'
        }}
      >
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {getPartName()}
          </Typography>
          <Typography variant="caption">Last updated by {getLatestSubmission()}</Typography>
        </Box>

        <Box sx={{ padding: '10px' }}>
          <Typography variant="body2" whiteSpace="pre-line">
            {getAssignees()}
          </Typography>
        </Box>

        <Box sx={{ padding: '10px' }}>
          <Typography variant="body2" whiteSpace="pre-line">
            {getReviewers()}
          </Typography>
        </Box>

        <Box sx={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
          <Pill label={getReviewStatusDisplayName(part.status)} bgColor={getReviewStatusColor(part.status)} />
        </Box>
      </Box>
    );
  }

  // large screen view
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: (theme) => theme.palette.grey[800],
        borderRadius: 2,
        p: 2,
        mb: 1
      }}
    >
      <Box sx={{ width: '35%', display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {getPartName()}
        </Typography>
      </Box>

      <Box sx={{ width: '16.6%', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" whiteSpace="pre-line">
          {getAssignees()}
        </Typography>
      </Box>

      <Box sx={{ width: '16.6%', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" whiteSpace="pre-line">
          {getReviewers()}
        </Typography>
      </Box>

      <Box sx={{ width: '16.6%', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">{getLatestReview()}</Typography>
      </Box>

      <Box sx={{ width: '16.6%', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">{getLatestSubmission()}</Typography>
      </Box>

      <Box sx={{ width: '16.6%', display: 'flex', alignItems: 'center' }}>
        <Pill label={getReviewStatusDisplayName(part.status)} bgColor={getReviewStatusColor(part.status)} />
      </Box>
    </Box>
  );
};

export default PartDisplay;

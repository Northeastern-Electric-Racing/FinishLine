import React from 'react';
import { Box, Typography } from '@mui/material';
import { Part, Review_Status } from 'shared';
import { useSinglePart } from '../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface PartDisplayProps {
  part: Part;
  screenSize: 'small' | 'medium' | 'large';
}

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
        width: '120px'
      }}
    >
      {label}
    </Box>
  );
};

const PartDisplay: React.FC<PartDisplayProps> = ({ part, screenSize }) => {
  const { isLoading, isError, error } = useSinglePart();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError || !part) {
    throw error;
  }

  // helper to get part name in the format shown in the ticket
  const getPartName = () => {
    const partNumber = part?.partId || '00000-00A';
    return `${part?.projectId}_${part?.commonName}_${partNumber}`;
  };

  // helper to get latest submission
  const getLatestSubmission = () => {
    if (!part?.submissions?.length) return 'None';

    // sorts submissions by date
    const sortedSubmissions = [...part.submissions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const [latestSubmission] = sortedSubmissions;

    return latestSubmission?.userCreated
      ? `${latestSubmission.userCreated.firstName} ${latestSubmission.userCreated.lastName}`
      : 'None';
  };

  // helper to get latest reviewer
  const getLatestReview = () => {
    if (!part?.submissions?.length) return 'None';

    // sort submissions by date
    const sortedSubmissions = [...part.submissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const [latestSubmission] = sortedSubmissions;

    if (latestSubmission?.reviews?.length > 0) {
      // sort reviews by date
      const sortedReviews = [...latestSubmission.reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const [latestReview] = sortedReviews;

      return latestReview?.userCreated
        ? `${latestReview.userCreated.firstName} ${latestReview.userCreated.lastName}`
        : 'None';
    }

    return 'None';
  };

  // helper to get assignees as a formatted string
  const getAssignees = () => {
    if (part?.assignees && part.assignees.length > 0) {
      return part.assignees.map((assignee) => `${assignee.firstName} ${assignee.lastName}`).join('\n');
    }
    return 'None';
  };

  const getAllReviewers = () => {
    if (!part?.submissions || !Array.isArray(part.submissions)) {
      return [];
    }

    const reviewersSet = new Set();

    // iterate through all submissions
    part.submissions.forEach((submission) => {
      if (submission?.reviews && Array.isArray(submission.reviews)) {
        // iterate through each review
        submission.reviews.forEach((review) => {
          if (review?.userCreated) {
            const reviewer = review.userCreated;
            const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
            reviewersSet.add(reviewerName);
          }
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

  // handles logic for what color to display for each review status
  const makeStatusPill = () => {
    switch (part?.status) {
      case Review_Status.REVIEWED:
        return <Pill label="Reviewed" bgColor="#43e84e"></Pill>;
      case Review_Status.APPROVED:
        return <Pill label="Approved" bgColor="#43e84e"></Pill>;
      case Review_Status.IN_PROGRESS:
        return <Pill label="In Progress" bgColor="#ff0000"></Pill>;
      case Review_Status.IN_REVIEW:
        return <Pill label="In Review" bgColor="#F89C38"></Pill>;
      case Review_Status.READY_FOR_REVIEW:
        return <Pill label="Ready for Review" bgColor="#ff0000"></Pill>;
    }
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

        <Box sx={{ width: '35%', display: 'flex', justifyContent: 'flex-end' }}>{makeStatusPill()}</Box>
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

        <Box sx={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>{makeStatusPill()}</Box>
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

      <Box sx={{ width: '16.6%', display: 'flex', alignItems: 'center' }}>{makeStatusPill()}</Box>
    </Box>
  );
};

export default PartDisplay;

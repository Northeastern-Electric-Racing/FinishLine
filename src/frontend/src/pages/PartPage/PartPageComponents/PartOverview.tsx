import { Box, Typography, IconButton, Chip, Stack } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CachedIcon from '@mui/icons-material/Cached';
import { Part, Review_Status, User } from 'shared';
import { useNotifyPartAssignee, useNotifyPartReviewer } from '../../../hooks/part-review.hooks';
import { useState } from 'react';

/**
 * gets the status color for each status case
 */
const getReviewStatusColor = (status: Review_Status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return '#0000FF';
    case 'READY_FOR_REVIEW':
      return '#FF0000';
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

/**
 * converts a status to a string name format
 */
const getReviewStatusDisplayName = (status: Review_Status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'Part In Progress';
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

const PartReviewStatusPill = (status: Review_Status) => {
  return (
    <Chip
      label={getReviewStatusDisplayName(status)}
      sx={{
        backgroundColor: getReviewStatusColor(status),
        ml: 1.5,
        width: 150
      }}
    />
  );
};

/**
 * get status color of a reviewer
 */
function getReviewerDotColor(data: Part, reviewerId: String) {
  const hasReviewed = data.submissions.some((submission) =>
    submission.reviews.some((review) => review.userCreated.userId === reviewerId && review.completedAt)
  );
  if (hasReviewed) {
    return '#33CC33';
  }
  const isWriting = data.submissions.some((submission) =>
    submission.reviews.some((review) => review.userCreated.userId === reviewerId && !review.completedAt)
  );
  if (isWriting) {
    return '#FFAA00';
  }
  return '#FF3333';
}

/**
 * interface to give part prop a type
 */
interface PartPageOverviewProps {
  part: Part;
}

const PartOverview: React.FC<PartPageOverviewProps> = ({ part }: PartPageOverviewProps) => {
  const { mutate: notifyPartAssignee } = useNotifyPartAssignee();
  const { mutate: notifyPartReviewer } = useNotifyPartReviewer();

  const [notifiedUserIds, setNotifiedUserIds] = useState<Set<string>>(new Set());

  /**
   * returns the given user's name and a notification button
   */
  function displayAssigneeOrReviewer(anyUser: User, isReviewer: boolean, status: Review_Status) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {status !== Review_Status.APPROVED && (
          <IconButton
            size="small"
            onClick={() => {
              if (isReviewer) {
                notifyPartReviewer({ partId: part.partId, reviewerId: anyUser.userId });
              } else {
                notifyPartAssignee({ partId: part.partId, assigneeId: anyUser.userId });
              }
              setNotifiedUserIds((ids) => ids.add(anyUser.userId));
            }}
            sx={{
              backgroundColor: '#444444',
              color: 'white',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#555555'
              },
              mr: 1
            }}
          >
            {notifiedUserIds.has(anyUser.userId) ? (
              <CachedIcon fontSize="inherit" />
            ) : (
              <NotificationsNoneIcon fontSize="inherit" />
            )}
          </IconButton>
        )}
        <Typography>
          {anyUser.firstName} {anyUser.lastName}
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'flex-col',
        mb: 2
      }}
    >
      <Typography variant="h4" mb={1}>
        Overview
      </Typography>
      <Typography mb={0.5}>{part.description}</Typography>
      <Typography mb={2.5}>
        {part.tags.map((tag, idx) => (
          <Chip
            key={idx}
            label={tag.name}
            size="small"
            sx={{
              backgroundColor: tag.colorHexCode,
              mr: 1
            }}
          />
        ))}
      </Typography>
      <Typography mb={1.5} sx={{ display: 'flex', alignItems: 'center' }}>
        Current Status:
        {PartReviewStatusPill(part.status)}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          mb: 2
        }}
      >
        <Stack direction={'column'} spacing={0.5} width="50%">
          <Typography>Assignees:</Typography>
          {part.assignees.map((user) => displayAssigneeOrReviewer(user, false, part.status))}
        </Stack>
        <Stack direction={'column'} spacing={0.5} width="50%">
          <Typography>Reviewers:</Typography>
          {part.reviewRequests.map((revReq) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {displayAssigneeOrReviewer(revReq.reviewerRequested, true, part.status)}
              {part.status !== Review_Status.APPROVED && (
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    ml: 0.5,
                    borderRadius: '50%',
                    backgroundColor: getReviewerDotColor(part, revReq.reviewerRequested.userId),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default PartOverview;

import { Box, Stack, Typography } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { datePipe } from '../../../utils/pipes';
import { ReimbursementRequestComment } from '../../../../../shared/src/types/reimbursement-requests-types';
import { useState } from 'react';
import TimelineCommentModal from './TimelineCommentModal';
import { Link } from '@mui/material';

interface TimelineProps {
  reimbursementRequestId: string;
  reimbursementRequestComments: ReimbursementRequestComment[];
}

interface EventSectionProps {
  comment: ReimbursementRequestComment;
  isLast: boolean;
  key: number;
}

interface FirstSectionProps {
  reimbursementRequestId: string;
  comments: ReimbursementRequestComment[];
}

const ReimbursementRequestTimeline: React.FC<TimelineProps> = ({
  reimbursementRequestId,
  reimbursementRequestComments: comments
}) => {
  return (
    <Stack direction="column" alignItems="center" spacing={0.5}>
      <FirstSection reimbursementRequestId={reimbursementRequestId} comments={comments} />
      {comments.map((comment, index) => (
        <EventSection comment={comment} isLast={comments.length - 1 === index} key={index} />
      ))}
    </Stack>
  );
};

const EventSection: React.FC<EventSectionProps> = ({ comment, isLast }) => {
  const commentTime = new Date(comment.dateCreated).toLocaleTimeString();
  const newCommentTime = commentTime.slice(0, -6) + commentTime.slice(-3);
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" width="100%">
      <Box flex={1} textAlign="right">
        <Typography fontWeight={'regular'} fontSize={18} variant="h1">
          {datePipe(comment.dateCreated)}
        </Typography>
        <Typography fontWeight={'regular'} fontSize={14} variant="h1">
          {newCommentTime}
        </Typography>
      </Box>

      <Box position="relative" display="flex" flexDirection="column" alignItems="center">
        <Circle sx={{ fontSize: 20, mb: 0.5 }} />
        {isLast ? (
          <></>
        ) : (
          <Box
            sx={{
              width: '4px',
              height: '50px',
              backgroundColor: 'white'
            }}
          />
        )}
      </Box>

      <Box flex={1}>
        <Typography fontWeight={'regular'} fontSize={18} variant="h1">
          {comment.comment}
        </Typography>
      </Box>
    </Stack>
  );
};

const FirstSection: React.FC<FirstSectionProps> = ({ reimbursementRequestId, comments }) => {
  const [timelineCommentModal, setTimelineCommentModalShow] = useState<boolean>(false);
  const commentTime = new Date().toLocaleTimeString();
  const newCommentTime = commentTime.slice(0, -6) + commentTime.slice(-3);
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" width="100%">
      <Box flex={1} textAlign="right">
        <Typography fontWeight={'regular'} fontSize={18} variant="h1">
          {datePipe(new Date())}
        </Typography>
        <Typography fontWeight={'regular'} fontSize={14} variant="h1">
          {newCommentTime}
        </Typography>
      </Box>

      <Box position="relative" display="flex" flexDirection="column" alignItems="center">
        <Circle sx={{ fontSize: 20 }} />
        <Box
          sx={{
            borderLeft: '4px dashed white',
            height: '50px',
            mt: 0.5
          }}
        />
        {comments.length === 0 ? <Circle sx={{ fontSize: 20, mt: 0.5 }} /> : <></>}
      </Box>

      <Stack flex={1} alignItems={'flex-start'}>
        <Link
          color="primary"
          onClick={() => {
            setTimelineCommentModalShow(true);
          }}
        >
          <Typography fontWeight={'regular'}>Add Timeline Comment</Typography>
        </Link>
        <TimelineCommentModal
          reimbursementRequestId={reimbursementRequestId}
          showModal={timelineCommentModal}
          handleClose={() => setTimelineCommentModalShow(false)}
        />
      </Stack>
    </Stack>
  );
};

export default ReimbursementRequestTimeline;

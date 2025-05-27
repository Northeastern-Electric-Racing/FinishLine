import { Box, Stack, Typography } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { datePipe } from '../../../utils/pipes';
import { ReimbursementRequestComment } from '../../../../../shared/src/types/reimbursement-requests-types';
import { useState } from 'react';
import { Link } from '@mui/material';
import { useCreateReimbursementRequestComment } from '../../../hooks/finance.hooks';
import CreateRRCommentModal from './CreateRRCommentModal';

interface TimelineProps {
  reimbursementRequestId: string;
  reimbursementRequestComments: ReimbursementRequestComment[];
}

interface CommentsSectionProps {
  comment: ReimbursementRequestComment;
  isLast: boolean;
  key: number;
}

interface CreateNewCommentSectionProps {
  reimbursementRequestId: string;
  comments: ReimbursementRequestComment[];
}

const ReimbursementRequestTimeline: React.FC<TimelineProps> = ({ reimbursementRequestId, reimbursementRequestComments }) => {
  const comments = reimbursementRequestComments.sort(
    (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );
  return (
    <Stack direction="column" alignItems="flex-start" marginBottom={8}>
      <Typography variant="h5" sx={{ mb: 1, mt: 5 }}>
        Reimbursement Request Timeline
      </Typography>

      <CreateNewCommentSection reimbursementRequestId={reimbursementRequestId} comments={comments} />
      {comments.map((comment, index) => (
        <CommentsSection comment={comment} isLast={comments.length - 1 === index} key={index} />
      ))}
    </Stack>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ comment, isLast }) => {
  // Reformatting time to remove seconds.
  let commentTime = new Date(comment.dateCreated).toLocaleTimeString();
  commentTime = commentTime.slice(0, -6) + commentTime.slice(-3);
  return (
    <Stack direction="row" spacing={2}>
      <Box sx={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>
        <Typography fontWeight={'regular'} fontSize={18} variant="h1">
          {datePipe(comment.dateCreated)}
        </Typography>
        <Typography fontWeight={'regular'} fontSize={14} variant="h1">
          {commentTime}
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
              minHeight: '50px',
              flex: 1,
              backgroundColor: 'white',
              mb: 0.5
            }}
          />
        )}
      </Box>

      <Box sx={{ maxWidth: '70%', wordBreak: 'break-word' }}>
        <Typography fontWeight={'regular'} fontSize={18} variant="h1" marginBottom={1}>
          {comment.comment}
        </Typography>
      </Box>
    </Stack>
  );
};

const CreateNewCommentSection: React.FC<CreateNewCommentSectionProps> = ({ reimbursementRequestId, comments }) => {
  const { mutateAsync, isLoading } = useCreateReimbursementRequestComment(reimbursementRequestId);
  const [timelineCommentModal, setTimelineCommentModalShow] = useState<boolean>(false);
  const commentTime = new Date().toLocaleTimeString();
  const newCommentTime = commentTime.slice(0, -6) + commentTime.slice(-3);
  return (
    <Stack direction="row" spacing={2}>
      <Box sx={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>
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
            width: '4px',
            minHeight: '50px',
            flex: 1,
            mt: 0.5,
            mb: 0.5
          }}
        />
        {comments.length === 0 ? <Circle sx={{ fontSize: 20, mt: 0.5 }} /> : <></>}
      </Box>
      <Stack>
        <Typography fontWeight={'regular'}>
          <Link
            sx={{ cursor: 'pointer' }}
            color="primary"
            onClick={() => {
              setTimelineCommentModalShow(true);
            }}
          >
            Send a Follow-Up Message!
          </Link>
        </Typography>
        <CreateRRCommentModal
          showModal={timelineCommentModal}
          handleClose={() => setTimelineCommentModalShow(false)}
          mutateAsync={mutateAsync}
          isLoading={isLoading}
          title="Create New Timeline Comment"
        />
      </Stack>
    </Stack>
  );
};

export default ReimbursementRequestTimeline;

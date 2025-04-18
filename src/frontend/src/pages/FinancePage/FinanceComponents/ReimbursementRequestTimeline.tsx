import { Box, Stack, Typography } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { datePipe } from '../../../utils/pipes';
import { useSingleReimbursementRequest } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { ReimbursementRequestComment } from '../../../../../shared/src/types/reimbursement-requests-types';

interface TimelineProps {
  reimbursementRequestId: string;
}

interface EventSectionProps {
  comment: ReimbursementRequestComment;
  isLast: boolean;
  isFirst: boolean;
}

const ReimbursementRequestTimeline: React.FC<TimelineProps> = ({ reimbursementRequestId }) => {
  const { data: reimbursementRequest, isError, error, isLoading } = useSingleReimbursementRequest(reimbursementRequestId);
  const Comments = reimbursementRequest?.comments;

  if (isLoading || !Comments) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <Stack alignItems="center" spacing={0.5}>
      {Comments.map((comment, index) => (
        <EventSection comment={comment} isLast={Comments.length - 1 === index} isFirst={0 === index} />
      ))}
    </Stack>
  );
};

const EventSection: React.FC<EventSectionProps> = ({ comment, isLast, isFirst }) => {
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
        <Circle sx={{ fontSize: 20 }} />
        {isLast ? (
          <></>
        ) : isFirst ? (
          <Box
            sx={{
              borderLeft: '4px dashed white',
              height: '50px',
              mt: 0.5
            }}
          />
        ) : (
          <Box
            sx={{
              width: '4px',
              height: '50px',
              backgroundColor: 'white',
              mt: 0.5
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

export default ReimbursementRequestTimeline;

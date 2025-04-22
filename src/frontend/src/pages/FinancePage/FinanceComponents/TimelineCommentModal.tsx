import { useCreateReimbursementRequestComment } from '../../../hooks/finance.hooks';
import CommentModal from './CommentModal';

interface TimelineCommentModalProps {
  showModal: boolean;
  handleClose: () => void;
  reimbursementRequestId: string;
}

const TimelineCommentModal: React.FC<TimelineCommentModalProps> = ({
  showModal,
  handleClose,
  reimbursementRequestId
}: TimelineCommentModalProps) => {
  const { mutateAsync, isLoading } = useCreateReimbursementRequestComment(reimbursementRequestId);

  return (
    <CommentModal
      showModal={showModal}
      handleClose={handleClose}
      mutateAsync={mutateAsync}
      isLoading={isLoading}
      title="Create New Timeline Comment"
    />
  );
};

export default TimelineCommentModal;

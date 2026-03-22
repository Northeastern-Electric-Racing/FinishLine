import { useDeleteSponsorTask } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { SponsorTask } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';

interface DeleteSponsorTaskModalProps {
  handleClose: () => void;
  sponsorTask: SponsorTask;
}

const DeleteSponsorModal = ({ handleClose, sponsorTask }: DeleteSponsorTaskModalProps) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteSponsorTask();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERModal
      open={!!sponsorTask}
      title="Warning!"
      onHide={handleClose}
      submitText="Delete"
      onSubmit={async () => {
        try {
          await mutateAsync({ sponsorTaskId: sponsorTask.sponsorTaskId });
          toast.success('Task deleted successfully!');
          handleClose();
        } catch (err: unknown) {
          if (err instanceof Error) {
            toast.error(err.message);
          }
        }
      }}
    >
      <Typography gutterBottom>Are you sure you want to delete this sponsor task?</Typography>
      <Typography fontWeight="bold">This action cannot be undone!</Typography>
    </NERModal>
  );
};

export default DeleteSponsorModal;

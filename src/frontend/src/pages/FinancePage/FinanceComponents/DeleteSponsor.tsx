import { useDeleteSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Sponsor } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';

interface DeleteSponsorProps {
  handleClose: () => void;
  sponsor: Sponsor;
  showModal: boolean;
}

const DeleteSponsorModal = ({ handleClose, sponsor, showModal }: DeleteSponsorProps) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteSponsor(sponsor.sponsorId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERModal
      open={showModal}
      title="Warning!"
      onHide={handleClose}
      submitText="Delete"
      onSubmit={async () => {
        try {
          await mutateAsync();
          toast.success(`Sponsor "${sponsor.name}" deleted successfully!`);
          handleClose();
        } catch (err: unknown) {
          if (err instanceof Error) {
            toast.error(err.message);
          }
        }
      }}
    >
      <Typography gutterBottom>
        Are you sure you want to delete the sponsor <i>{sponsor.name}</i>?
      </Typography>
      <Typography fontWeight="bold">This action cannot be undone!</Typography>
    </NERModal>
  );
};

export default DeleteSponsorModal;

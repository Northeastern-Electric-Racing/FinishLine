import { useDeleteSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Sponsor } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';

interface DeleteSponsorProps {
  handleClose: () => void;
  sponsor: Sponsor;
}

const DeleteSponsorModal = ({ handleClose, sponsor }: DeleteSponsorProps) => {
  const { isLoading, isError, error, mutateAsync } = useDeleteSponsor(sponsor.sponsorId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERModal
      open={!!sponsor}
      title="Warning!"
      onHide={handleClose}
      submitText="Delete"
      onSubmit={() => {
        mutateAsync();
        handleClose();
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

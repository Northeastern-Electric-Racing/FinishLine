/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useDeleteProspectiveSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { ProspectiveSponsor } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';

interface DeleteProspectiveSponsorModalProps {
  handleClose: () => void;
  prospectiveSponsor: ProspectiveSponsor;
  showModal: boolean;
}

const DeleteProspectiveSponsorModal = ({
  handleClose,
  prospectiveSponsor,
  showModal
}: DeleteProspectiveSponsorModalProps) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteProspectiveSponsor();

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
          await mutateAsync(prospectiveSponsor.prospectiveSponsorId);
          toast.success(`Prospective sponsor "${prospectiveSponsor.organizationName}" deleted successfully!`);
          handleClose();
        } catch (err: unknown) {
          if (err instanceof Error) {
            toast.error(err.message);
          }
        }
      }}
    >
      <Typography gutterBottom>
        Are you sure you want to delete the prospective sponsor <i>{prospectiveSponsor.organizationName}</i>?
      </Typography>
      <Typography fontWeight="bold">This action cannot be undone!</Typography>
    </NERModal>
  );
};

export default DeleteProspectiveSponsorModal;

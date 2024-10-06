import { Box, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useCurrentOrganization, useSetOrganizationDescription } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import EditDescriptionFormModal, { EditDescriptionInput } from './EditDescriptionFormModal';
import { useToast } from '../../../hooks/toasts.hooks';

const EditDescription: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  const {
    mutateAsync: setOrganizationDescription,
    isLoading: mutateIsLoading,
    isError: mutateIsError,
    error: mutateError
  } = useSetOrganizationDescription();
  const toast = useToast();

  const handleClose = () => {
    setShowModal(false);
  };

  const onSubmit = async (formInput: EditDescriptionInput) => {
    try {
      await setOrganizationDescription(formInput.description);
      toast.success('Description updated successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  if (isLoading || mutateIsLoading || !organization) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  if (mutateIsError) return <ErrorPage message={mutateError?.message} />;

  return (
    <Box>
      <Typography variant="h4">{organization.name} Description</Typography>
      <Box sx={{ width: { xs: '100%', md: '50%' } }}>
        <TextField
          id="organization-description"
          value={organization.description}
          rows={5}
          multiline
          fullWidth
          InputProps={{
            readOnly: true
          }}
        />
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <NERButton variant="contained" onClick={() => setShowModal(true)}>
            Update
          </NERButton>
        </Box>
      </Box>
      <EditDescriptionFormModal
        originalDescription={organization.description}
        onSubmit={onSubmit}
        modalShow={showModal}
        onHide={handleClose}
      />
    </Box>
  );
};

export default EditDescription;

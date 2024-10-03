import { Box, Grid, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useCurrentOrganization, useSetOrganizationDescription } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import EditDescriptionFormModal, { EditDescriptionInput } from './EditDescriptionFormModal';

const EditDescription: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  const { mutateAsync: setOrganizationDescription } = useSetOrganizationDescription();

  const onSubmit = async (formInput: EditDescriptionInput) => {
    console.log('SUBMITTING');
    setShowModal(false);
    await setOrganizationDescription(formInput.description);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  if (isLoading || !organization) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <Box>
      <Grid container direction={'column'} spacing={1}>
        <Grid item>
          <Typography variant="h4">{organization.name} Description</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField id="organization-description" defaultValue={organization.description} rows={5} multiline fullWidth />
        </Grid>
        <Grid item alignItems={'left'}>
          <NERButton variant="contained" onClick={() => setShowModal(true)}>
            Update
          </NERButton>
        </Grid>
      </Grid>
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

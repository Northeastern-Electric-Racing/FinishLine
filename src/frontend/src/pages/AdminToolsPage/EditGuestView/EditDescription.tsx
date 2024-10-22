import { Box, Card, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useCurrentOrganization, useSetOrganizationDescription } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import EditDescriptionForm, { EditDescriptionInput } from './EditDescriptionForm';
import { useToast } from '../../../hooks/toasts.hooks';

const EditDescription: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme();
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  const { mutateAsync: setOrganizationDescription, isLoading: mutateIsLoading } = useSetOrganizationDescription();
  const toast = useToast();

  const handleClose = () => {
    setIsEditMode(false);
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

  return (
    <Card
      sx={{
        width: { xs: '100%', md: '50%' },
        background: 'transparent',
        padding: 2,
        ...(isEditMode && {
          background: theme.palette.background.paper,
          padding: 1.9,
          variant: 'outlined'
        })
      }}
      variant={isEditMode ? 'outlined' : undefined}
    >
      <Typography variant="h4" mb={1}>
        {organization.name} Description
      </Typography>
      {isEditMode ? (
        <EditDescriptionForm organization={organization} onSubmit={onSubmit} isEditMode={isEditMode} onHide={handleClose} />
      ) : (
        <Box>
          <TextField
            required
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
              display: 'flex',
              justifyContent: 'end'
            }}
          >
            <NERButton variant="contained" sx={{ my: 2 }} onClick={() => setIsEditMode(true)}>
              Update
            </NERButton>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default EditDescription;

import React, { useState } from 'react';
import { useCurrentOrganization, useOrganizationLogo, useSetOrganizationLogo } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditLogoForm, { EditLogoInput } from './EditLogoForm';
import { useToast } from '../../../hooks/toasts.hooks';
import { Box, Card, Typography, useTheme } from '@mui/material';
import LogoDisplay from '../../HomePage/components/LogoDisplay';
import { NERButton } from '../../../components/NERButton';
import ErrorPage from '../../ErrorPage';

const EditLogo = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();
  const { data: imageData, isLoading: imageDataIsLoading, isError: imageIsError, error: imageError } = useOrganizationLogo();
  const { mutateAsync, isLoading } = useSetOrganizationLogo();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme();

  if (isLoading || !mutateAsync || organizationIsLoading || !organization || imageDataIsLoading) return <LoadingIndicator />;
  if (organizationIsError) return <ErrorPage message={organizationError.message} />;
  if (imageIsError) return <ErrorPage message={imageError.message} />;

  const handleClose = () => {
    setIsEditMode(false);
  };

  const onSubmit = async (logoInput: EditLogoInput) => {
    try {
      if (!logoInput.logoImage) {
        toast.error('No logo image submitted.');
        handleClose();
        return;
      }
      await mutateAsync(logoInput.logoImage);
      toast.success('Logo updated successfully!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    handleClose();
  };

  return (
    <Card
      sx={{
        width: '100%',
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
        {organization.name} Logo
      </Typography>
      {isEditMode ? (
        <EditLogoForm
          onSubmit={onSubmit}
          onHide={handleClose}
          orgLogo={imageData ? new File([imageData], imageData.name, { type: imageData.type }) : undefined}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 350, width: 300 }}>
            <LogoDisplay imageUrl={imageData ? URL.createObjectURL(imageData) : undefined} />
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
        </>
      )}
    </Card>
  );
};

export default EditLogo;

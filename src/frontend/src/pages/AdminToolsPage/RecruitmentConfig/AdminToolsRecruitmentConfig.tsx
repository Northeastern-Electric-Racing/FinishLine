import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import React, { useState } from 'react';
import { useCurrentOrganization, useSetOrganizationPlatformLogoImage } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import ApplicationLinkTable from './ApplicationLinkTable';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';
import NERUploadButton from '../../../components/NERUploadButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { MAX_FILE_SIZE } from 'shared';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  const { mutateAsync: setPlatformLogoImage, isLoading: platformLogoLoading } = useSetOrganizationPlatformLogoImage();

  const { data: platformLogoImageUrl } = useGetImageUrl(organization?.platformLogoImageId ?? null);

  const toast = useToast();

  const [addedPlatformLogo, setAddedPlatformLogo] = useState<File | undefined>(undefined);

  const handlePlatformLogoUpload = async () => {
    if (!addedPlatformLogo) return;
    if (addedPlatformLogo.size >= MAX_FILE_SIZE) {
      toast.error(
        `Error uploading ${addedPlatformLogo.name}; file must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB`,
        5000
      );
      return;
    }
    try {
      await setPlatformLogoImage(addedPlatformLogo);
      toast.success('Platform logo uploaded successfully.');
      setAddedPlatformLogo(undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to upload image');
    }
  };

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (!organization || organizationIsLoading) return <LoadingIndicator />;

  return (
    <Box padding="5px">
      <Grid container spacing="3%">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
            FAQs
          </Typography>
          <FAQsTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
            Milestones
          </Typography>
          <MilestoneTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <ApplicationLinkTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
            Platform Logo
          </Typography>
          {platformLogoLoading ? (
            <Box sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
              <LoadingIndicator />
            </Box>
          ) : (
            <Box>
              <NERUploadButton
                dataTypeId="platformLogo"
                handleFileChange={(e) => {
                  if (e.target.files?.[0]) setAddedPlatformLogo(e.target.files[0]);
                }}
                onSubmit={handlePlatformLogoUpload}
                addedImage={addedPlatformLogo}
                setAddedImage={setAddedPlatformLogo}
              />
              {!addedPlatformLogo && platformLogoImageUrl && (
                <Box
                  component="img"
                  src={platformLogoImageUrl}
                  alt="Platform Logo"
                  sx={{ display: 'block', maxWidth: '200px', mb: 1, mt: 1 }}
                />
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;

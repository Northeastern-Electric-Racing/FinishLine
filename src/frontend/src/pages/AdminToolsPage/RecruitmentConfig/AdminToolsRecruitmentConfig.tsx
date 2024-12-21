import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import { useToast } from '../../../hooks/toasts.hooks';
import NERUploadButton from '../../../components/NERUploadButton';
import React, { useState } from 'react';
import { useCurrentOrganization, useSetOrganizationImages } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetImageUrl } from '../../../hooks/onboarding.hooks';
import ErrorPage from '../../ErrorPage';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const { mutateAsync: organizationImages } = useSetOrganizationImages();
  const toast = useToast();
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (!organization || organizationIsLoading) {
    return <LoadingIndicator />;
  }
  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  const [addedImage1, setAddedImage1] = useState<File | undefined>(undefined);
  const [addedImage2, setAddedImage2] = useState<File | undefined>(undefined);
  const [isUploadingApply, setIsUploadingApply] = useState(false);
  const [isUploadingExplore, setIsUploadingExplore] = useState(false);

  const { data: applyInterestImageUrl } = useGetImageUrl(organization?.applyInterestImageId ?? null);
  const { data: exploreGuestImageUrl } = useGetImageUrl(organization?.exploreAsGuestImageId ?? null);

  const handleFileUpload = async (files: File[], type: 'exploreAsGuest' | 'applyInterest') => {
    const validFiles: File[] = [];
    files.forEach((file) => {
      if (file.size < 5 * 1024 * 1024) {
        if (type === 'applyInterest') {
          validFiles[0] = file;
        } else if (type === 'exploreAsGuest') {
          validFiles[1] = file;
        }
      } else {
        toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
      }
    });

    if (validFiles.length > 0) {
      try {
        type === 'applyInterest' ? setIsUploadingApply(true) : setIsUploadingExplore(true);
        await organizationImages(validFiles);
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        type === 'applyInterest' ? setIsUploadingApply(false) : setIsUploadingExplore(false);
      }
    }
  };

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Recruitment Config
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <FAQsTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <MilestoneTable />
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Recruitment Images
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Apply Interest Image
          </Typography>
          {isUploadingApply ? (
            <Box sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
              <LoadingIndicator />
            </Box>
          ) : (
            <>
              {!addedImage1 && applyInterestImageUrl && (
                <Box
                  component="img"
                  sx={{ display: 'block', maxWidth: '200px', mb: 1 }}
                  alt="Apply Interest"
                  src={applyInterestImageUrl}
                />
              )}
              <NERUploadButton
                dataTypeId="applyInterest"
                handleFileChange={(e) => {
                  if (e.target.files) {
                    setAddedImage1(e.target.files[0]);
                  }
                }}
                onSubmit={() => {
                  if (addedImage1) {
                    handleFileUpload([addedImage1], 'applyInterest');
                    setAddedImage1(undefined);
                  }
                }}
                addedImage={addedImage1}
                setAddedImage={setAddedImage1}
              />
            </>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Explore As Guest Image
          </Typography>
          {isUploadingExplore ? (
            <Box sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
              <LoadingIndicator />
            </Box>
          ) : (
            <>
              {!addedImage2 && exploreGuestImageUrl && (
                <Box
                  component="img"
                  sx={{ display: 'block', maxWidth: '200px', mb: 1 }}
                  alt="Apply Interest"
                  src={exploreGuestImageUrl}
                />
              )}
              <NERUploadButton
                dataTypeId="exploreAsGuest"
                handleFileChange={(e) => {
                  if (e.target.files) {
                    setAddedImage2(e.target.files[0]);
                  }
                }}
                onSubmit={() => {
                  if (addedImage2) {
                    handleFileUpload([addedImage2], 'exploreAsGuest');
                    setAddedImage2(undefined);
                  }
                }}
                addedImage={addedImage2}
                setAddedImage={setAddedImage2}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;

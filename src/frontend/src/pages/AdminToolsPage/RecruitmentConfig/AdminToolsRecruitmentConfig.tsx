import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import { useEffect, useMemo, useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentOrganization, useSetOrganizationImages } from '../../../hooks/organizations.hooks';
import { downloadGoogleImage } from '../../../apis/finance.api';
import NERUploadButton from '../../../components/NERUploadButton';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  const { mutateAsync: organizationImages } = useSetOrganizationImages();
  const toast = useToast();

  const [addedImage1, setAddedImage1] = useState<File | undefined>(undefined);
  const [addedImage2, setAddedImage2] = useState<File | undefined>(undefined);

  const currentImages = useMemo(() => {
    return [organization?.applyInterestImageId, organization?.exploreAsGuestImageId];
  }, [organization]);

  useEffect(() => {
    if (!currentImages.every(Boolean)) return;

    const fetchImages = async () => {
      try {
        const newImageUrls: { [key: string]: string } = {};

        const imageFetches = currentImages.map(async (image) => {
          if (image) {
            const imageBlob = await downloadGoogleImage(image);
            const url = URL.createObjectURL(imageBlob);
            newImageUrls[image] = url;
          }
        });

        await Promise.all(imageFetches);
      } catch (error) {
        console.error('Error fetching image URLs:', error);
      }
    };

    fetchImages();
  }, [currentImages]);

  if (organizationIsLoading) return <LoadingIndicator />;
  if (organizationIsError) return <ErrorPage message={organizationError.message} />;

  const handleFileUpload = async (files: File[], type: 'exploreAsGuest' | 'applyInterest') => {
    const validFiles: File[] = [];
    files.forEach((file) => {
      if (file.size < 1000000) {
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
        await organizationImages(validFiles);
      } catch (error) {
        console.error('Error uploading images:', error);
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Apply Interest Image
          </Typography>
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
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Explore As Guest Image
          </Typography>
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
        </Box>
      </Box>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;

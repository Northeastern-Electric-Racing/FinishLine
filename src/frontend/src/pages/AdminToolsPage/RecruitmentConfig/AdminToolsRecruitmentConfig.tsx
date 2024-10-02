import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import { useEffect, useMemo, useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentOrganization, useSetOrganizationImages } from '../../../hooks/organizations.hooks';
import { downloadGoogleImage } from '../../../apis/finance.api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();
  const { isLoading: organizationImagesIsLoading, mutateAsync: organizationImages } = useSetOrganizationImages();
  const toast = useToast();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string | undefined }>({});

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
        setImageUrls(newImageUrls);
      } catch (error) {
        console.error('Error fetching image URLs:', error);
      }
    };

    fetchImages();
  }, [imageUrls]);

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

      <Box mt={2}>
        <Button
          variant="contained"
          color="success"
          component="label"
          startIcon={<FileUploadIcon />}
          sx={{ width: 'fit-content', textTransform: 'none', mt: '9.75px' }}
        >
          Upload Apply Interest Image
          <input
            type="file"
            accept="image/png, image/jpeg"
            hidden
            onChange={async (e) => {
              if (e.target.files) {
                const files = Array.from(e.target.files);
                await handleFileUpload(files, 'applyInterest');
              }
            }}
          />
        </Button>
        {organizationImagesIsLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}

        {currentImages[0] && (
          <Box component="ul" sx={{ listStyleType: 'disc', mt: 2 }}>
            <li>
              <Box
                component="img"
                src={imageUrls[currentImages[0]]}
                alt="Apply Interest Image"
                sx={{ maxWidth: '100px', mt: 1 }}
              />
            </li>
          </Box>
        )}
      </Box>

      <Box mt={2}>
        <Button
          variant="contained"
          color="success"
          component="label"
          startIcon={<FileUploadIcon />}
          sx={{ width: 'fit-content', textTransform: 'none', mt: '9.75px' }}
        >
          Upload Explore as Guest Image
          <input
            type="file"
            accept="image/png, image/jpeg"
            hidden
            onChange={async (e) => {
              if (e.target.files) {
                const files = Array.from(e.target.files);
                await handleFileUpload(files, 'exploreAsGuest');
              }
            }}
          />
        </Button>
        {organizationImagesIsLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}

        {currentImages[1] && (
          <Box component="ul" sx={{ listStyleType: 'disc', mt: 2 }}>
            <li>
              <Box
                component="img"
                src={imageUrls[currentImages[1]]}
                alt="Explore as Guest Image"
                sx={{ maxWidth: '100px', mt: 1 }}
              />
            </li>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;

import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import { useSetOrganizationImages } from '../../../hooks/organization.hooks';
import { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useToast } from '../../../hooks/toasts.hooks';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const { isLoading: organizationImagesIsLoading, mutateAsync: organizationImages } = useSetOrganizationImages();
  const [addedImages, setAddedImages] = useState<{ exploreAsGuest: File[], applyInterest: File[] }>({ exploreAsGuest: [], applyInterest: [] });
  const toast = useToast();

  const handleFileUpload = async (files: File[], type: 'exploreAsGuest' | 'applyInterest') => {
    const validFiles: File[] = [];
    files.forEach((file) => {
      if (file.size < 1000000) {
        validFiles.push(file);
        setAddedImages((prevImages) => ({
          ...prevImages,
          [type]: [...prevImages[type], file],
        }));
      } else {
        toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
      }
    });

    if (validFiles.length > 0) {
      try {
        await organizationImages(validFiles); // Upload valid files
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
          Upload Explore as Guest Image
          <input
            type="file"
            accept="image/png, image/jpeg"
            multiple
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
      </Box>

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
            multiple
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
      </Box>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;

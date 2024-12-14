import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import { useToast } from '../../../hooks/toasts.hooks';
import NERUploadButton from '../../../components/NERUploadButton';
import { useEffect, useState } from 'react';
import { useCurrentOrganization, useSetOrganizationImages } from '../../../hooks/organizations.hooks';
import { downloadGoogleImage } from '../../../apis/finance.api';
import { blobPipe } from '../../../utils/pipes';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ApplicationLinkTable from './ApplicationLinkTable';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const { mutateAsync: organizationImages } = useSetOrganizationImages();
  const toast = useToast();

  const { data: organization } = useCurrentOrganization();

  const [defaultImage1, setDefaultImage1] = useState<File | undefined>(undefined);
  const [defaultImage2, setDefaultImage2] = useState<File | undefined>(undefined);

  const [addedImage1, setAddedImage1] = useState<File | undefined>(undefined);
  const [addedImage2, setAddedImage2] = useState<File | undefined>(undefined);

  useEffect(() => {
    const fetchImages = async () => {
      const applyBlob = await downloadGoogleImage(organization?.applyInterestImageId ?? '');
      const exploreBlob = await downloadGoogleImage(organization?.exploreAsGuestImageId ?? '');

      const applyFile = blobPipe(applyBlob, 'applyInterestImage.jpg');
      const exploreFile = blobPipe(exploreBlob, 'exploreAsGuestImage.jpg');

      setDefaultImage1(applyFile);
      setDefaultImage2(exploreFile);
    };

    fetchImages();
  }, [organization]);

  if (!defaultImage1 || !defaultImage2) {
    return <LoadingIndicator />;
  }

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
        <Grid item direction="column" xs={12} md={6}>
          <ApplicationLinkTable />
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
          {!addedImage1 && defaultImage1 ? (
            <Box
              component="img"
              sx={{ display: 'block', maxWidth: '200px', mb: 1 }}
              alt="Apply Interest"
              src={URL.createObjectURL(defaultImage1)}
            />
          ) : null}
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
          {!addedImage2 && defaultImage2 ? (
            <Box
              component="img"
              sx={{ display: 'block', maxWidth: '200px', mb: 1 }}
              alt="Apply Interest"
              src={URL.createObjectURL(defaultImage2)}
            />
          ) : null}
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

import { Grid, Typography, List, ListItem, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import UsefulLinksTable from './UsefulLinks/UsefulLinksTable';
import {
  useCurrentOrganization,
  useOrganizationNewMemberImage,
  useSetOrganizationNewMemberImage
} from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import UpdateOnboardingContactsModal from './UpdateContactsModal';
import OnboardingBlock from './OnboardingBlock';
import NERUploadButton from '../../../components/NERUploadButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { MAX_FILE_SIZE } from 'shared';

const OnboardingInfoSection: React.FC = () => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [addedImage, setAddedImage] = useState<File | undefined>(undefined);
  const toast = useToast();

  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  const {
    data: newMemberImageBlob,
    isLoading: imageIsLoading,
    error: imageError,
    isError: imageIsError
  } = useOrganizationNewMemberImage();
  const { mutateAsync: uploadNewMemberImage, isLoading: isUploading } = useSetOrganizationNewMemberImage();

  const handleImageUpload = async () => {
    if (!addedImage) return;

    if (addedImage.size >= MAX_FILE_SIZE) {
      toast.error(`File must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB`, 5000);
      return;
    }

    try {
      await uploadNewMemberImage(addedImage);
      setAddedImage(undefined);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    }
  };

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (imageIsError) {
    return <ErrorPage message={imageError.message} />;
  }

  if (!organization || organizationIsLoading) return <LoadingIndicator />;

  return (
    <Grid
      container
      item
      xs={12}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        width: '100%'
      }}
    >
      <OnboardingBlock organization={organization} isAdmin={true} />
      <Grid item>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '10px',
            padding: '16px',
            width: '100%'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            New Member Events Image
          </Typography>
          {isUploading || imageIsLoading ? (
            <Box sx={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingIndicator />
            </Box>
          ) : (
            <>
              {!addedImage && newMemberImageBlob && (
                <Box
                  component="img"
                  sx={{ display: 'block', maxWidth: '100%', maxHeight: '200px', mb: 1, objectFit: 'contain' }}
                  alt="New Member Event"
                  src={URL.createObjectURL(newMemberImageBlob)}
                />
              )}
              <NERUploadButton
                dataTypeId="newMemberImage"
                handleFileChange={(e) => {
                  if (e.target.files) {
                    setAddedImage(e.target.files[0]);
                  }
                }}
                onSubmit={handleImageUpload}
                addedImage={addedImage}
                setAddedImage={setAddedImage}
              />
            </>
          )}
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            height: '100%',
            borderRadius: '10px',
            padding: '16px',
            width: '100%'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Useful Links
          </Typography>
          <UsefulLinksTable />
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            minHeight: '200px',
            height: '100%',
            borderRadius: '10px',
            width: '100%',
            background: theme.palette.background.paper
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" ml={2} mt={2}>
              Questions
            </Typography>
            <EditIcon sx={{ mt: 2, mr: 2, cursor: 'pointer' }} onClick={() => setShowModal(true)}></EditIcon>
          </Box>
          <Typography sx={{ mt: 2, ml: 2, fontWeight: 'bold' }}>Feel free to contact:</Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            {organization.contacts.map((contact) => {
              return (
                <ListItem sx={{ display: 'list-item', padding: 0.5 }}>
                  {contact.user.firstName} {contact.user.lastName}: {contact.user.email} - {contact.title}
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Grid>
      <UpdateOnboardingContactsModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        defaultValues={{ contacts: organization.contacts }}
      />
    </Grid>
  );
};

export default OnboardingInfoSection;

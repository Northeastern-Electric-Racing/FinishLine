import { Grid, Typography, List, ListItem, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import UsefulLinksTable from './UsefulLinks/UsefulLinksTable';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import UpdateOnboardingContactsModal from './UpdateContactsModal';
import OnboardingBlock from './OnboardingBlock';

const OnboardingInfoSection: React.FC = () => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (!organization || organizationIsLoading) return <LoadingIndicator />;

  return (
    <Grid container item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
      <OnboardingBlock organization={organization} isAdmin={true} />
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            height: '100%',
            borderRadius: '10px',
            padding: '16px'
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

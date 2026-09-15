import React from 'react';
import { Box, Link, List, ListItem, Typography, useTheme } from '@mui/material';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

const NewMemberContactsWidget: React.FC = () => {
  const theme = useTheme();
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (organizationIsError) return <ErrorPage message={organizationError.message} />;
  if (!organization || organizationIsLoading) return <LoadingIndicator />;

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: '10px',
        width: '100%',
        background: theme.palette.background.paper
      }}
    >
      <Typography variant="h5" ml={2} pt={2}>
        Questions?
      </Typography>
      <Typography sx={{ mt: 1, ml: 2, fontWeight: 'bold' }}>Feel free to contact:</Typography>
      <List sx={{ listStyleType: 'disc', pl: 2 }}>
        {organization.contacts.map((contact) => {
          return (
            <ListItem key={`${contact.user.userId}-${contact.title}`} sx={{ display: 'list-item', padding: 0.5, ml: 2 }}>
              {contact.user.firstName} {contact.user.lastName} - {contact.title}
            </ListItem>
          );
        })}
      </List>
      {organization.slackWorkspaceId && (
        <Typography sx={{ ml: 2, pb: 2 }}>
          You can find them on{' '}
          <Link
            href={`https://app.slack.com/client/${organization.slackWorkspaceId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Slack
          </Link>
        </Typography>
      )}
    </Box>
  );
};

export default NewMemberContactsWidget;

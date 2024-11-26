import { Box, Card, Icon, Typography, useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import React from 'react';
import { NERButton } from '../../../components/NERButton';
import { useAllLinkTypes, useAllUsefulLinks } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface GuestOrganizationInfoButtonProps {
  href?: string;
  buttonText: string;
  iconName: string;
}

const NERGuestButton: React.FC<GuestOrganizationInfoButtonProps> = ({ href, buttonText, iconName }) => {
  return (
    <Grid item xs={12} sm={6} md={4} sx={{ paddingRight: 2 }}>
      <NERButton variant="contained" fullWidth={true} style={{ justifyContent: 'flex-start', color: 'white' }} href={href}>
        <Icon>{iconName}</Icon>
        <Typography noWrap={true} sx={{ marginLeft: 1 }}>
          {buttonText}
        </Typography>
      </NERButton>
    </Grid>
  );
};

const GuestOrganizationInfo = () => {
  const theme = useTheme();
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  const {
    data: usefulLinks,
    isLoading: usefulLinksIsLoading,
    isError: usefulLinksIsError,
    error: usefulLinksError
  } = useAllUsefulLinks();
  const { data: linkTypes, isLoading: linkTypesIsLoading } = useAllLinkTypes();

  if (isLoading || !organization) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  if (!usefulLinks || usefulLinksIsLoading || !linkTypes || linkTypesIsLoading) return <LoadingIndicator />;
  if (usefulLinksIsError) return <ErrorPage message={usefulLinksError.message} />;

  return (
    <Card
      sx={{
        padding: 2,
        bgcolor: theme.palette.background.paper,
        borderRadius: '1',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      variant="outlined"
    >
      <Box>
        <Typography sx={{ paddingLeft: 2 }} variant="h4">
          {organization.name}
        </Typography>
        <Typography sx={{ mt: 2, fontSize: 18, paddingLeft: 2 }}>{organization.description}</Typography>
      </Box>
      <Grid container spacing={2}>
        {usefulLinks.map((link) => (
          <NERGuestButton
            key={link.linkId}
            buttonText={link.linkType.name}
            href={link.url}
            iconName={link.linkType.iconName}
          />
        ))}
      </Grid>
    </Card>
  );
};

export default GuestOrganizationInfo;

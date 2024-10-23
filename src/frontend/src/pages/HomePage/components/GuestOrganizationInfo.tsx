import { Box, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import React from 'react';
import { NERButton } from '../../../components/NERButton';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useAllLinkTypes, useAllUsefulLinks } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface GuestOrganizationInfoButtonProps {
  href?: string;
  buttonText: string;
  iconName: string;
}

const NERGuestButton: React.FC<GuestOrganizationInfoButtonProps> = ({ href, buttonText }) => {
  return (
    <Grid item xs={4}>
      <NERButton variant="contained" fullWidth={true} style={{ justifyContent: 'flex-start' }} href={href}>
        <InfoRoundedIcon style={{ color: 'white' }} />
        <Typography color="white" sx={{ marginLeft: 1 }}>
          {buttonText}
        </Typography>
      </NERButton>
    </Grid>
  );
};

const GuestOrganizationInfo = () => {
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  const {
    data: usefulLinks,
    isLoading: usefulLinksIsLoading,
    isError: usefulLinksIsError,
    error: usefulLinksError
  } = useAllUsefulLinks();
  const { data: linkTypes, isLoading: linkTypesIsLoading } = useAllLinkTypes();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  if (!usefulLinks || usefulLinksIsLoading || !linkTypes || linkTypesIsLoading) return <LoadingIndicator />;
  if (usefulLinksIsError) return <ErrorPage message={usefulLinksError.message} />;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1rem',
        padding: '1rem',
        bgcolor: 'grey.800',
        borderRadius: '1rem',
        marginTop: 5
      }}
    >
      <Typography variant="h4" sx={{}}>
        FinishLine by {organization?.name}
      </Typography>
      <Typography sx={{ marginBottom: 2, fontSize: 18 }}>{organization?.description}</Typography>
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
    </Box>
  );
};

export default GuestOrganizationInfo;

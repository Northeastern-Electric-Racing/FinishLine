import { Box, Button, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { useCurrentOrganization, useOrganization } from '../../../hooks/organizations.hooks';
import React from 'react';
import { useAllUsefulLinks } from '../../../hooks/projects.hooks';
import { NERButton } from '../../../components/NERButton';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

interface GuestOrganizationInfoButtonProps {
  href?: string;
  buttonText: string;
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
  const organizationName = useCurrentOrganization().data?.name;
  const organizationDescription = useCurrentOrganization().data?.description;
  const usefulLinks = useAllUsefulLinks().data;

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
        FinishLine by {organizationName}
      </Typography>
      <Typography sx={{ marginBottom: 2, fontSize: 18 }}>{organizationDescription}</Typography>
      <Grid container spacing={2}>
        <NERGuestButton buttonText="About NER" href="" />
        <NERGuestButton buttonText="FinishLine Guide" href="" />
        <NERGuestButton buttonText="Our GitHub" href="" />
        <NERGuestButton buttonText="How to Join" href="" />
        <NERGuestButton buttonText="Our Confluence" href="" />
        <NERGuestButton buttonText="Useful Link" href="" />
      </Grid>
    </Box>
  );
};

export default GuestOrganizationInfo;

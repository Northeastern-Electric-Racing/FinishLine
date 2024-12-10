import { Box } from '@mui/material';
import React from 'react';
import { useOrganizationLogo } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

const LogoDisplay = () => {
  const { data: imageUrl, isLoading } = useOrganizationLogo();

  if (isLoading) return <LoadingIndicator />;

  return (
    <Box
      component="img"
      src={imageUrl ?? '/logo.png'}
      sx={{
        height: '100%',
        width: '100%',
        borderRadius: 2
      }}
    />
  );
};

export default LogoDisplay;

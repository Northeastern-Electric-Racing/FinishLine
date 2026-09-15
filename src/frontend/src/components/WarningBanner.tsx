import { Box, Typography } from '@mui/material';
import React from 'react';

interface WarningBannerProps {
  amount: number;
}

const WarningBanner: React.FC<WarningBannerProps> = ({ amount }) => {
  const formattedMessage = `Spending is $${Math.round(amount * 100) / 100} over budget!`;

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ef4545',
        color: '#ffffff',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '14px'
      }}
    >
      <Typography style={{ marginRight: '8px' }}>⚠️</Typography>
      {formattedMessage}
    </Box>
  );
};

export default WarningBanner;

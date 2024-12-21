import { Box, useTheme, Card } from '@mui/material';
import React from 'react';

interface LogoDisplayProps {
  imageUrl?: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({ imageUrl }) => {
  const theme = useTheme();
  return (
    <Card
      variant={'outlined'}
      sx={{
        background: theme.palette.background.paper,
        height: '100%',
        width: '100%',
        borderRadius: 2
      }}
    >
      {imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          sx={{
            height: '100%',
            width: '100%',
            borderRadius: 2
          }}
        />
      )}
    </Card>
  );
};

export default LogoDisplay;

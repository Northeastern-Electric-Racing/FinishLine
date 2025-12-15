import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { Event } from 'shared';
import { Typography } from '@mui/material';

const AvailabilityPanel = ({ event, closePanel }: { event: Event; closePanel: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, []);

  const endPanel = () => {
    setVisible(false);
    setTimeout(() => {
      closePanel();
    }, 150);
  };

  return (
    <Box
      sx={{
        position: 'fixed', // 🔑 key part
        inset: 0, // top:0 right:0 bottom:0 left:0
        zIndex: 1300, // higher than app content
        bgcolor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
        justifyContent: 'flex',
        display: 'flex',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease-in-out'
      }}
    >
      <Box
        sx={{
          width: '50%',
          height: '100%',
          boxShadow: 24,
          px: 4
        }}
        onClick={() => endPanel()}
      />
      <Box
        sx={{
          width: '50%',
          height: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          px: 4
        }}
      >
        <Typography
          flexGrow={1}
          variant="h4"
          fontSize={30}
          pt={3}
          pb={1}
          sx={{
            textAlign: {
              xs: 'center',
              md: 'left'
            }
          }}
        >
          {event.title} Availability
        </Typography>
        <Typography></Typography>
      </Box>
    </Box>
  );
};

export default AvailabilityPanel;

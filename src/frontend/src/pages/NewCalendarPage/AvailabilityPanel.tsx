import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { Event } from 'shared';
import { Typography } from '@mui/material';

const fadeTime = 150;

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
    }, fadeTime);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex',
        display: 'flex',
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeTime}ms ease-in-out`
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
        <Typography>
          Mon, Tues, Wed
        </Typography>
      </Box>
    </Box>
  );
};

export default AvailabilityPanel;

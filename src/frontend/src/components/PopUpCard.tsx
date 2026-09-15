import { Box, Card, Icon, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
import { PopUp } from 'shared';
import CloseIcon from '@mui/icons-material/Close';

interface PopUpCardProps {
  popUp: PopUp;
  removePopUp: (popUp: PopUp) => Promise<void>;
  onClick: (popUp: PopUp) => Promise<void>;
}

const PopUpCard: React.FC<PopUpCardProps> = ({ popUp, removePopUp, onClick }) => {
  const theme = useTheme();
  return (
    <Card
      variant={'outlined'}
      sx={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
        gap: 1,
        background: theme.palette.background.paper,
        width: 300,
        borderRadius: 4,
        padding: 1
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box
          onClick={async () => await onClick(popUp)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: !!popUp.eventLink ? 'pointer' : 'default'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              background: theme.palette.primary.main,
              width: '30%',
              borderRadius: 4
            }}
          >
            <Icon
              sx={{
                fontSize: 36
              }}
            >
              {popUp.iconName}
            </Icon>
          </Box>
          <Typography variant="subtitle2">{popUp.text}</Typography>
        </Box>
        <IconButton onClick={() => removePopUp(popUp)}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default PopUpCard;

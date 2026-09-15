import { Button, Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface WarningTooltipProps {
  warning: string;
  buttonText: string;
  onClick: () => void;
}

const WarningTooltip: React.FC<WarningTooltipProps> = ({ warning, buttonText, onClick }) => {
  return (
    <Tooltip
      placement="bottom-end"
      arrow
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [10, 0]
            }
          }
        ]
      }}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: '#ef5350',
            color: 'white',
            padding: 2,
            borderRadius: 2,
            maxWidth: 600,
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }
        },
        arrow: {
          sx: {
            color: '#ef5350'
          }
        }
      }}
      title={
        <Stack direction="row" alignItems="center" spacing={2}>
          <WarningIcon sx={{ fontSize: 40 }} />
          <Typography fontSize={14}>{warning}</Typography>
          <Button
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'white',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              flexShrink: 0,
              px: 2,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
            onClick={(e) => {
              onClick();
              e.stopPropagation();
            }}
          >
            {buttonText}
          </Button>
        </Stack>
      }
    >
      <ErrorOutlineIcon
        fontSize="small"
        sx={{
          color: 'error.main',
          ml: 1,
          cursor: 'pointer'
        }}
      />
    </Tooltip>
  );
};

export default WarningTooltip;

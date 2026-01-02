import * as React from 'react';
import { Box, Popover, useTheme } from '@mui/material';
import { NERButton } from '../../../components/NERButton';

type AddRuleBoxProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAddRuleSection: () => void;
  onAddRule: () => void;
};

export const AddRuleBox: React.FC<AddRuleBoxProps> = ({ open, anchorEl, onClose, onAddRuleSection, onAddRule }) => {
  const theme = useTheme();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableRestoreFocus
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.grey[700],
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.4)',
          minWidth: 'auto'
        }}
      >
        <NERButton
          onClick={onAddRuleSection}
          sx={{
            borderRadius: 0,
            backgroundColor: 'transparent',
            color: theme.palette.common.white,
            lineHeight: 1.1,
            justifyContent: 'flex-end',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
          }}
        >
          Add Rule Section
        </NERButton>

        <Box sx={{ height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />

        <NERButton
          onClick={onAddRule}
          sx={{
            borderRadius: 0,
            borderTop: '1px solid black',
            backgroundColor: 'transparent',
            color: theme.palette.common.white,
            lineHeight: 1.1,
            justifyContent: 'flex-end',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
          }}
        >
          Add Rule
        </NERButton>
      </Box>
    </Popover>
  );
};

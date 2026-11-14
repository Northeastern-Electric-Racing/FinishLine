import * as React from 'react';
import { Box, Popover, useTheme } from '@mui/material';
import { NERButton } from '../../../components/NERButton';

type AddRuleBoxProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAddRule: () => void;
  onAddReferencedRule: () => void;
  onAddImage: () => void;
};

export const AddRuleBox: React.FC<AddRuleBoxProps> = ({
  open,
  anchorEl,
  onClose,
  onAddRule,
  onAddReferencedRule,
  onAddImage
}) => {
  const theme = useTheme();

  const optionButtonSx = {
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: theme.palette.common.white,
    lineHeight: 1.1,
    justifyContent: 'flex-end',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
  };

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
        <NERButton onClick={onAddRule} sx={optionButtonSx}>
          Add Rule
        </NERButton>
        <NERButton onClick={onAddReferencedRule} sx={{ ...optionButtonSx, borderTop: '1px solid black' }}>
          Add Referenced Rule
        </NERButton>
        <NERButton onClick={onAddImage} sx={{ ...optionButtonSx, borderTop: '1px solid black' }}>
          Add Image
        </NERButton>
      </Box>
    </Popover>
  );
};

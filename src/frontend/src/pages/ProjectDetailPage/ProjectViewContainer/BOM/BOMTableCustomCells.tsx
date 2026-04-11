import { useState } from 'react';
import { Box } from '@mui/system';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { MaterialStatus } from 'shared';
import { Menu, MenuItem, Typography } from '@mui/material';
import { displayEnum } from '../../../../utils/pipes';

const getStatusColor = (status: MaterialStatus) => {
  switch (status) {
    case MaterialStatus.Ordered:
      return '#dba63e';
    case MaterialStatus.NotReadyToOrder:
      return '#a63737';
    case MaterialStatus.Received:
      return '#2a712a';
    case MaterialStatus.Shipped:
      return '#1b537a';
    case MaterialStatus.ReadyToOrder:
      return '#D34B27';
    default:
      return 'grey';
  }
};

const bomStatusChipStyle = (status: MaterialStatus) => ({
  backgroundColor: getStatusColor(status),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4px',
  borderRadius: '6px',
  minWidth: '130px',
  height: '36px',
  textAlign: 'center'
});

interface StatusDropdownCellProps {
  status: MaterialStatus;
  disabled?: boolean;
  onStatusChange: (newStatus: MaterialStatus) => void;
}

export const StatusDropdownCell: React.FC<StatusDropdownCellProps> = ({ status, disabled, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!disabled) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (newStatus: MaterialStatus) => {
    onStatusChange(newStatus);
    handleClose();
  };

  return (
    <>
      <Box
        sx={{
          ...bomStatusChipStyle(status),
          cursor: disabled ? 'default' : 'pointer',
          gap: '2px'
        }}
        onClick={handleClick}
      >
        <Typography fontSize={{ xs: '11px', sm: '14px' }} color="black">
          {displayEnum(status)}
        </Typography>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              padding: 0,
              background: 'transparent',
              borderRadius: '6px',
              overflow: 'hidden'
            }
          },
          list: { disablePadding: true }
        }}
      >
        {Object.values(MaterialStatus)
          .filter((s) => s !== status)
          .map((s) => {
            const chipStyle = bomStatusChipStyle(s);
            return (
              <MenuItem key={s} onClick={() => handleSelect(s)} sx={{ padding: 0 }}>
                <Box sx={{ ...chipStyle, borderRadius: 0, minWidth: '130px', width: '100%' }}>
                  <Typography fontSize="14px" color="black">
                    {displayEnum(s)}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })}
      </Menu>
    </>
  );
};

export const renderStatusBOM = (params: GridRenderCellParams) => {
  if (!params.value) return;
  const status = params.value as MaterialStatus;

  return (
    <Box sx={bomStatusChipStyle(status)}>
      <Typography
        fontSize={{
          xs: '11px',
          sm: '14px'
        }}
        color="black"
      >
        {displayEnum(status)}
      </Typography>
    </Box>
  );
};

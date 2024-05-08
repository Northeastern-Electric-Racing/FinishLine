import { Box } from '@mui/system';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { MaterialStatus } from 'shared';
import { Link, Typography } from '@mui/material';
import { displayEnum } from '../../../../utils/pipes';

export const renderLinkBOM = (params: GridRenderCellParams) =>
  params.value && (
    <Link href={params.value} target="_blank" underline="hover" sx={{ pl: 1 }}>
      Buyer Link
    </Link>
  );

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

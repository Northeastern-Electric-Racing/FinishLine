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

export const renderStatusBOM = (params: GridRenderCellParams) => {
  if (!params.value) return;
  const status = params.value;
  const color =
    status === MaterialStatus.Ordered
      ? '#dba63e'
      : status === MaterialStatus.Unordered
      ? '#a63737'
      : status === MaterialStatus.Received
      ? '#2a712a'
      : status === MaterialStatus.Shipped
      ? '#1b537a'
      : 'grey';

  const boxStyle = {
    backgroundColor: color,
    padding: '6px 10px 6px 10px',
    borderRadius: '6px',
    width: '95px',
    textAlign: 'center'
  };
  return (
    <Box sx={boxStyle}>
      <Typography fontSize="14px" color="black">
        {displayEnum(status)}
      </Typography>
    </Box>
  );
};

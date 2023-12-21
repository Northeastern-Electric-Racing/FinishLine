import { Chip } from '@mui/material';
import { ChangeRequestType } from 'shared';
import { ChangeRequestTypeTextPipe } from '../utils/enum-pipes';
import { red } from '@mui/material/colors';

const ChangeRequestTypePill = ({ type }: { type: ChangeRequestType }) => {
  return (
    <Chip
      size="small"
      label={ChangeRequestTypeTextPipe(type)}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: red[600],
        width: 100
      }}
    />
  );
};

export default ChangeRequestTypePill;

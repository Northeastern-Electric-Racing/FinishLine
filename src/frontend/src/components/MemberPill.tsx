import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { User } from 'shared';
import { fullNamePipe } from '../utils/pipes';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export const MemberPill: React.FC<{ user: User; handleClick?: () => void }> = ({ user, handleClick }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '11px',
        backgroundColor: '#d9d9d9',
        width: 'fit-content',
        margin: '8px'
      }}
    >
      <Typography fontSize="15px" marginLeft="10px" marginRight={handleClick ? undefined : '10px'} color="#242526">
        {fullNamePipe(user)}
      </Typography>
      {handleClick && (
        <IconButton onClick={handleClick} size="small">
          <RemoveCircleOutlineIcon sx={{ color: '#242526', width: '18px' }} />
        </IconButton>
      )}
    </Box>
  );
};

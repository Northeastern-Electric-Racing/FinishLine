import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { User } from 'shared';
import { fullNamePipe } from '../utils/pipes';

// component for the member pill displaying full name
export const DesignReviewMemberPill: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Box sx={{ borderRadius: '11px', backgroundColor: '#d9d9d9', width: 'fit-content', margin: '8px' }}>
      <Typography fontSize="15px" paddingX="10px" paddingY="1px" color="#242526">
        {fullNamePipe(user)}
      </Typography>
    </Box>
  );
};

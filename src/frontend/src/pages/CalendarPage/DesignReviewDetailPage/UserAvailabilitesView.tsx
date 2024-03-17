import { Typography } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { User } from 'shared';
import { HeatmapColors } from '../../../utils/design-review.utils';
import { fullNamePipe } from '../../../utils/pipes';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import WarningIcon from '@mui/icons-material/Warning';
import { useState } from 'react';
import FinalizeDesignReviewModal from './FinalizeDesignReviewModal';

interface UserAvailabilitiesProps {
  currentAvailableUsers: User[];
  currentUnavailableUsers: User[];
  usersToAvailabilities: Map<User, number[]>;
}

const UserAvailabilites: React.FC<UserAvailabilitiesProps> = ({
  currentAvailableUsers,
  currentUnavailableUsers,
  usersToAvailabilities
}) => {
  const theme = useTheme();
  const [showFinalizeDesignReviewModal, setShowFinalizeDesignReviewModal] = useState(false);
  const totalUsers = usersToAvailabilities.size;
  const fontSize = totalUsers > 10 ? '1em' : totalUsers > 15 ? '0.8em' : '1.2em';

  return (
    <Box
      style={{
        display: 'flex',
        backgroundColor: theme.palette.background.paper,
        padding: '20px',
        borderRadius: '10px',
        height: '100%',
        overflow: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginBottom: '10px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography style={{ marginRight: '10px' }}>0/0</Typography>
          {Array.from({ length: 6 }, (_, i) => (
            <Box
              sx={{
                width: '1.5vw',
                height: '1.5vw',
                backgroundColor: HeatmapColors[i]
              }}
            />
          ))}
          <Typography style={{ marginLeft: '10px' }}>
            {totalUsers}/{totalUsers}
          </Typography>
        </Box>
        <Box style={{ display: 'flex', gap: '2', marginTop: '10px' }}>
          <Box>
            <Typography
              style={{
                textDecoration: 'underline',
                fontSize: '1.5em',
                textAlign: 'center',
                marginBottom: '10px',
                width: '10vw'
              }}
            >
              Available
            </Typography>
            {currentAvailableUsers.map((user) => (
              <Typography style={{ textAlign: 'center', fontSize }}>{fullNamePipe(user)}</Typography>
            ))}
          </Box>
          <Box>
            <Typography
              style={{
                textDecoration: 'underline',
                fontSize: '1.5em',
                textAlign: 'center',
                marginBottom: '10px',
                width: '10vw'
              }}
            >
              Unvailable
            </Typography>
            {currentUnavailableUsers.map((user) => (
              <Typography style={{ textAlign: 'center', fontSize }}>{fullNamePipe(user)}</Typography>
            ))}
          </Box>
        </Box>
        <Box
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <WarningIcon style={{ color: 'yellow', fontSize: '2em', marginTop: '5px' }} />
          <NERFailButton>Cancel</NERFailButton>
          <NERSuccessButton
            variant="contained"
            type="submit"
            sx={{ mx: 1 }}
            onClick={() => setShowFinalizeDesignReviewModal(true)}
          >
            Finalize
          </NERSuccessButton>
          <FinalizeDesignReviewModal open={showFinalizeDesignReviewModal} setOpen={setShowFinalizeDesignReviewModal} />
        </Box>
      </Box>
    </Box>
  );
};

export default UserAvailabilites;

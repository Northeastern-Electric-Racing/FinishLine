import { Typography } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { DesignReview, User } from 'shared';
import { HeatmapColors } from '../../../utils/design-review.utils';
import { fullNamePipe } from '../../../utils/pipes';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useState } from 'react';
import FinalizeDesignReviewDetailsModal from './FinalizeDesignReviewDetailsModal';
import { DesignReviewEditData } from './DesignReviewDetailPage';

interface UserAvailabilitiesProps {
  currentAvailableUsers: User[];
  currentUnavailableUsers: User[];
  usersToAvailabilities: Map<User, number[]>;
  designReview: DesignReview;
  conflictingDesignReviews: DesignReview[];
  editPayload: DesignReviewEditData;
}

const UserAvailabilites: React.FC<UserAvailabilitiesProps> = ({
  currentAvailableUsers,
  currentUnavailableUsers,
  usersToAvailabilities,
  designReview,
  conflictingDesignReviews,
  editPayload
}) => {
  const theme = useTheme();
  const [showFinalizeDesignReviewDetailsModal, setShowFinalizeDesignReviewDetailsModal] = useState(false);
  const totalUsers = usersToAvailabilities.size;

  return (
    <Box
      style={{
        display: 'flex',
        backgroundColor: theme.palette.background.paper,
        padding: '20px',
        borderRadius: '10px',
        height: '100%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          marginBottom: '10px'
        }}
      >
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
            <Box sx={{ maxHeight: '350px', overflowY: 'auto' }}>
              {currentAvailableUsers.map((user) => (
                <Typography style={{ textAlign: 'center', fontSize: '16px' }}>{fullNamePipe(user)}</Typography>
              ))}
            </Box>
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
              Unavailable
            </Typography>
            <Box sx={{ maxHeight: '350px', overflowY: 'auto' }}>
              {currentUnavailableUsers.map((user) => (
                <Typography style={{ textAlign: 'center', fontSize: '1em' }}>{fullNamePipe(user)}</Typography>
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            overflow: 'auto'
          }}
        >
          <NERFailButton>Cancel</NERFailButton>
          <NERSuccessButton
            variant="contained"
            type="submit"
            sx={{ mx: 1 }}
            onClick={() => setShowFinalizeDesignReviewDetailsModal(true)}
          >
            Finalize
          </NERSuccessButton>
          <FinalizeDesignReviewDetailsModal
            open={showFinalizeDesignReviewDetailsModal}
            setOpen={setShowFinalizeDesignReviewDetailsModal}
            conflictingDesignReviews={conflictingDesignReviews}
            designReview={designReview}
            editData={editPayload}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UserAvailabilites;

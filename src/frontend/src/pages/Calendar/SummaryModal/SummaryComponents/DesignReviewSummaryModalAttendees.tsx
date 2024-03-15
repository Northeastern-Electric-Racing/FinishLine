import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DesignReview, User } from 'shared';
import { useState } from 'react';
import { DesignReviewMemberPill } from '../../../../components/DesignReviewMemberPill';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../../hooks/users.hooks';

interface DesignReviewSummaryModalAttendeesProps {
  designReview: DesignReview;
}

const DesignReviewSummaryModalAttendees: React.FC<DesignReviewSummaryModalAttendeesProps> = ({ designReview }) => {
  const toast = useToast();
  const [requiredMembers, setRequiredMembers] = useState<User[]>(designReview.requiredMembers);
  const [optionalMembers, setOptionalMembers] = useState<User[]>(designReview.optionalMembers);
  const currentUser = useCurrentUser();
  const handleRemoveRequiredMember = (user: User) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      setRequiredMembers(requiredMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
  };

  const handleRemoveOptionalMember = (user: User) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      setOptionalMembers(optionalMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
  };

  return (
    <Box marginLeft="15px">
      <Grid container direction="row" paddingY="6px">
        <Grid item container>
          <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
            <Typography>Required: </Typography>
          </Grid>
          <Grid item xs={10} container>
            {requiredMembers.map((member, index) => (
              <Grid item key={index}>
                <DesignReviewMemberPill
                  user={member}
                  handleClick={() => {
                    handleRemoveRequiredMember(member);
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Grid item container>
            <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
              <Typography>Optional: </Typography>
            </Grid>
            <Grid item xs={10} container>
              {optionalMembers.map((member, index) => (
                <Grid item key={index}>
                  <DesignReviewMemberPill
                    user={member}
                    handleClick={() => {
                      handleRemoveOptionalMember(member);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesignReviewSummaryModalAttendees;

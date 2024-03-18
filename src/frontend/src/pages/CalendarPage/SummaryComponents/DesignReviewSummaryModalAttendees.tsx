import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DesignReview, User } from 'shared';
import { useState } from 'react';
import { MemberPill } from '../../../components/MemberPill';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { DesignReviewEditProps } from '../DesignReviewSummaryModal';

interface DesignReviewSummaryModalAttendeesProps {
  designReview: DesignReview;
  control: Control<DesignReviewEditProps>;
  errors: FieldErrors<DesignReviewEditProps>;
}

const DesignReviewSummaryModalAttendees: React.FC<DesignReviewSummaryModalAttendeesProps> = ({
  designReview,
  control,
  errors
}) => {
  const toast = useToast();
  const [requiredMembers, setRequiredMembers] = useState<User[]>(designReview.requiredMembers);
  const [optionalMembers, setOptionalMembers] = useState<User[]>(designReview.optionalMembers);
  const currentUser = useCurrentUser();

  const handleRemoveRequiredMember = (user: User, onChange: (event: User[]) => void) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      setRequiredMembers(requiredMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
    onChange(requiredMembers);
  };

  const handleRemoveOptionalMember = (user: User, onChange: (event: User[]) => void) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      setOptionalMembers(optionalMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
    onChange(optionalMembers);
  };

  return (
    <Box marginLeft="15px" paddingY="6px">
      <Grid container>
        <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
          <Typography>Required: </Typography>
        </Grid>
        <Controller
          name="requiredMembers"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Grid item xs={10} container>
              {value.map((member, index) => (
                <Grid item key={index}>
                  <MemberPill
                    user={member}
                    handleClick={() => {
                      handleRemoveRequiredMember(member, onChange);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        />
        <Grid container>
          <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
            <Typography>Optional: </Typography>
          </Grid>
          <Controller
            name="optionalMembers"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Grid item xs={10} container>
                {value.map((member, index) => (
                  <Grid item key={index}>
                    <MemberPill
                      user={member}
                      handleClick={() => {
                        handleRemoveOptionalMember(member, onChange);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesignReviewSummaryModalAttendees;

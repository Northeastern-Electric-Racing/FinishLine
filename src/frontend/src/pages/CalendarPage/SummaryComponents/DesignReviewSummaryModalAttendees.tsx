import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DesignReview, User } from 'shared';
import { useState } from 'react';
import { MemberPill } from '../../../components/MemberPill';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useEditDesignReview } from '../../../hooks/design-reviews.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { yupResolver } from '@hookform/resolvers/yup';

interface DesignReviewSummaryModalAttendeesProps {
  designReview: DesignReview;
}

interface DesignReviewEditAttendeesProps {
  requiredMembers: User[];
  optionalMembers: User[];
}

const schema = yup.object().shape({
  requiredMembers: yup.array(yup.string()),
  optionalMembers: yup.array(yup.string())
});

const DesignReviewSummaryModalAttendees: React.FC<DesignReviewSummaryModalAttendeesProps> = ({ designReview }) => {
  const toast = useToast();
  const [requiredMembers, setRequiredMembers] = useState<User[]>(designReview.requiredMembers);
  const [optionalMembers, setOptionalMembers] = useState<User[]>(designReview.optionalMembers);
  const currentUser = useCurrentUser();

  const {
    isLoading: editDesignReviewIsLoading,
    mutateAsync: editDesignReview,
    isError: editDesignReviewIsError,
    error: editDesignReviewError
  } = useEditDesignReview(designReview.designReviewId);

  const handleRemoveRequiredMember = (user: User, onChange: (event: User[]) => void) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      setRequiredMembers(requiredMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
    onChange(requiredMembers);
    saveMembers({ requiredMembers, optionalMembers });
  };

  const handleRemoveOptionalMember = (user: User, onChange: (event: User[]) => void) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      setOptionalMembers(optionalMembers.filter((member) => member.userId !== user.userId));
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
    onChange(optionalMembers);
    saveMembers({ requiredMembers, optionalMembers });
  };

  const saveMembers = async (payload: DesignReviewEditAttendeesProps) => {
    try {
      await editDesignReview({
        ...designReview,
        teamTypeId: designReview.teamType.teamTypeId,
        zoomLink: designReview.zoomLink ?? '',
        location: designReview.location ?? '',
        docTemplateLink: designReview.docTemplateLink ?? '',
        attendees: designReview.attendees.map((user) => user.userId),
        requiredMembersIds: payload.requiredMembers.map((member) => member.userId),
        optionalMembersIds: payload.optionalMembers.map((member) => member.userId)
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  // TODO handle errors and submit
  const {
    //handleSubmit,
    control
    //formState: { errors }
  } = useForm<DesignReviewEditAttendeesProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...designReview,
      requiredMembers: designReview.requiredMembers ?? [],
      optionalMembers: designReview.optionalMembers ?? []
    }
  });

  if (!designReview || editDesignReviewIsLoading) return <LoadingIndicator />;
  if (editDesignReviewIsError) return <ErrorPage error={editDesignReviewError!} message={editDesignReviewError?.message} />;

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

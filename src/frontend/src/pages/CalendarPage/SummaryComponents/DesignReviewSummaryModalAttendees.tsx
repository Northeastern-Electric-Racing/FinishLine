import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DesignReview, User } from 'shared';
import { MemberPill } from '../../../components/MemberPill';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useEditDesignReview } from '../../../hooks/design-reviews.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface DesignReviewSummaryModalAttendeesProps {
  designReview: DesignReview;
}

interface DesignReviewEditAttendeesProps {
  requiredMembers: User[];
  optionalMembers: User[];
}

const DesignReviewSummaryModalAttendees: React.FC<DesignReviewSummaryModalAttendeesProps> = ({ designReview }) => {
  const toast = useToast();
  const requiredMembers = designReview.requiredMembers;
  const optionalMembers = designReview.optionalMembers;
  const currentUser = useCurrentUser();

  const { isLoading: editDesignReviewIsLoading, mutateAsync: editDesignReview } = useEditDesignReview(
    designReview.designReviewId
  );

  const handleRemoveRequiredMember = (user: User) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      const updatedMembers = requiredMembers.filter((member) => member.userId !== user.userId);
      saveMembers({ requiredMembers: updatedMembers, optionalMembers });
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
  };

  const handleRemoveOptionalMember = (user: User) => {
    if (currentUser.userId === designReview.userCreated.userId) {
      const updatedMembers = optionalMembers.filter((member) => member.userId !== user.userId);
      saveMembers({ requiredMembers, optionalMembers: updatedMembers });
    } else {
      toast.error('Only the creator of the Design Review can edit attendees');
    }
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

  if (editDesignReviewIsLoading) return <LoadingIndicator />;

  return (
    <Box marginLeft="15px" paddingY="6px">
      <Grid container>
        <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
          <Typography>Required: </Typography>
        </Grid>
        <Grid item xs={10} container>
          <MemberPill user={designReview.userCreated} />
          {requiredMembers.map((member, index) => (
            <Grid item key={index}>
              <MemberPill
                user={member}
                handleClick={
                  currentUser.userId === designReview.userCreated.userId
                    ? () => {
                        handleRemoveRequiredMember(member);
                      }
                    : undefined
                }
              />
            </Grid>
          ))}
        </Grid>
        <Grid container>
          <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '7px' }}>
            <Typography>Optional: </Typography>
          </Grid>
          <Grid item xs={10} container>
            {optionalMembers.map((member, index) => (
              <Grid item key={index}>
                <MemberPill
                  user={member}
                  handleClick={
                    currentUser.userId === designReview.userCreated.userId
                      ? () => {
                          handleRemoveOptionalMember(member);
                        }
                      : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesignReviewSummaryModalAttendees;

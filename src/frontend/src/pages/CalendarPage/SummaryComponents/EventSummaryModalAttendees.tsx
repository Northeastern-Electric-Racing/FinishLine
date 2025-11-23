import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Event, User } from 'shared';
import { MemberPill } from '../../../components/MemberPill';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';

interface EventSummaryModalAttendeesProps {
  event: Event;
}

interface EventEditAttendeesProps {
  requiredMembers: User[];
  optionalMembers: User[];
}

const EventSummaryModalAttendees: React.FC<EventSummaryModalAttendeesProps> = ({ event }) => {
  const toast = useToast();
  const { requiredMembers } = event;
  const { optionalMembers } = event;
  const currentUser = useCurrentUser();

  /*
  const { isLoading: editDesignReviewIsLoading, mutateAsync: editDesignReview } = useEditDesignReview(
    designReview.designReviewId
  );
  */

  const handleRemoveRequiredMember = (user: User) => {
    if (currentUser.userId === event.userCreated.userId) {
      const updatedMembers = requiredMembers.filter((member) => member.userId !== user.userId);
      saveMembers({ requiredMembers: updatedMembers, optionalMembers });
    } else {
      toast.error('Only the creator of the Event can edit attendees');
    }
  };

  const handleRemoveOptionalMember = (user: User) => {
    if (currentUser.userId === event.userCreated.userId) {
      const updatedMembers = optionalMembers.filter((member) => member.userId !== user.userId);
      saveMembers({ requiredMembers, optionalMembers: updatedMembers });
    } else {
      toast.error('Only the creator of the Event can edit attendees');
    }
  };

  const saveMembers = async (_payload: EventEditAttendeesProps) => {
    /*
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
      */
  };

  // if (editDesignReviewIsLoading) return <LoadingIndicator />;

  return (
    <Box paddingY="20px">
      <Grid container>
        <Grid item sx={{ display: 'flex', alignItems: 'start', marginTop: '12px' }}>
          <Typography>Required: </Typography>
        </Grid>
        <Grid item xs={10} container>
          <MemberPill user={event.userCreated} />
          {requiredMembers.map((member, index) => (
            <Grid item key={index}>
              <MemberPill
                user={member}
                handleClick={
                  currentUser.userId === event.userCreated.userId
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
                    currentUser.userId === event.userCreated.userId
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

export default EventSummaryModalAttendees;

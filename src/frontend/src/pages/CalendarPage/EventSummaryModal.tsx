import { Event, EventStatus, TeamType, isAdmin, wbsPipe } from 'shared';
import NERModal from '../../components/NERModal';
import { Box, Chip, IconButton, Link, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { getTeamTypeIcon } from '../NewCalendarPage/CalendarDayCard';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentUser } from '../../hooks/users.hooks';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../../hooks/toasts.hooks';
import { eventStatusColor, eventStatusPipe } from '../../utils/design-review.utils';
import NERSuccessButton from '../../components/NERSuccessButton';
import { CheckCircle } from '@mui/icons-material';
import { useDeleteEvent } from '../../hooks/calendar.hooks';
import EventSummaryModalDetails from './SummaryComponents/EventSummaryModalDetails';
import EventSummaryModalAttendees from './SummaryComponents/EventSummaryModalAttendees';
import { EventAvailabilityInfo } from './EventAvailabilityInfo';

interface EventSummaryModalProps {
  open: boolean;
  onHide: () => void;
  event: Event;
  teamTypes: TeamType[];
  markedStatus?: EventStatus;
  setMarkedStatus?: (_: EventStatus) => void;
}

const EventSummaryModal: React.FC<EventSummaryModalProps> = ({
  open,
  onHide,
  event,
  teamTypes,
  markedStatus = EventStatus.UNCONFIRMED,
  setMarkedStatus = () => {}
}: EventSummaryModalProps) => {
  const user = useCurrentUser();
  const toast = useToast();
  const history = useHistory();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: deleteEvent } = useDeleteEvent(event.eventId);

  const isEventCreator = user.userId === event.userCreated.userId;

  const isScheduled = event.status === EventStatus.SCHEDULED || event.status === EventStatus.DONE;

  const handleDelete = () => {
    try {
      deleteEvent();
      history.push(routes.CALENDAR);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this event?</Typography>
      </NERModal>
    );
  };

  const [firstWorkPackage] = event.workPackages;

  const wbsNum = firstWorkPackage
    ? {
        carNumber: firstWorkPackage.wbsElement.carNumber,
        projectNumber: firstWorkPackage.wbsElement.projectNumber,
        workPackageNumber: firstWorkPackage.wbsElement.workPackageNumber
      }
    : { carNumber: 0, projectNumber: 0, workPackageNumber: 0 };

  const eventName = firstWorkPackage?.wbsElement?.name
    ? `${firstWorkPackage.wbsElement.carNumber}.${firstWorkPackage.wbsElement.projectNumber}.${firstWorkPackage.wbsElement.workPackageNumber} - ${firstWorkPackage.wbsElement.name}`
    : event.title;

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={`Event`}
      hideFormButtons
      icon={event.teamType && getTeamTypeIcon(event.teamType.teamTypeId, true)}
      hideBackDrop
      showCloseButton
      titleChildren={
        <Box position="absolute" right="52px" top="12px">
          {(isEventCreator || isAdmin(user.role)) && (
            <>
              <IconButton onClick={() => setShowDeleteModal(true)}>
                <DeleteIcon />
              </IconButton>
              <IconButton component={RouterLink} to={`${routes.CALENDAR}/${event.eventId}`}>
                <EditIcon />
              </IconButton>
            </>
          )}
          <IconButton
            component={RouterLink}
            to={`${routes.SETTINGS_PREFERENCES}?eventId=${event.eventId}`}
            disabled={
              !event.requiredMembers.concat(event.optionalMembers).some((attendee) => attendee.userId === user.userId) ||
              isScheduled
            }
          >
            <CheckCircle />
          </IconButton>
        </Box>
      }
    >
      <Box minWidth="550px">
        <DeleteModal />

        <Box>
          <Box display={'flex'} alignItems={'center'}>
            <Link
              component={RouterLink}
              to={`${routes.PROJECTS}/${wbsPipe(wbsNum)}/overview`}
              sx={{ display: 'flex', flexGrow: 1 }}
            >
              <Typography flexGrow={1} variant="h4">
                {`${eventName}`}
              </Typography>
            </Link>
            <Chip
              size="small"
              label={eventStatusPipe(markedStatus)}
              variant="filled"
              sx={{
                backgroundColor: eventStatusColor(markedStatus),
                fontSize: 14,
                color: 'white',
                width: 150,
                fontWeight: 'bold'
              }}
            />
          </Box>
          {isScheduled && (
            <EventSummaryModalDetails
              event={event}
              teamTypes={teamTypes}
              markedStatus={markedStatus}
              setMarkedStatus={setMarkedStatus}
            />
          )}
          {event.status === EventStatus.CONFIRMED && (
            <Box>
              <EventSummaryModalAttendees event={event} />
              {isEventCreator && (
                <Box display="flex" justifyContent={'end'}>
                  <NERSuccessButton component={RouterLink} to={`${routes.CALENDAR}/${event.eventId}`}>
                    Schedule Event
                  </NERSuccessButton>
                </Box>
              )}
            </Box>
          )}
          {event.status === EventStatus.UNCONFIRMED && <EventAvailabilityInfo event={event} />}
        </Box>
      </Box>
    </NERModal>
  );
};

export default EventSummaryModal;

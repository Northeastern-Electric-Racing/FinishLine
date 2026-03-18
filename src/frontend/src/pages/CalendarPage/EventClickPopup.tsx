import React, { useState } from 'react';
import { Alert, Box, Button, IconButton, Link, Popover, Stack, Typography, useTheme } from '@mui/material';
import {
  Calendar,
  DayOfWeek,
  EventInstance,
  EventStatus,
  EventType,
  formatEventTime,
  isAdmin,
  isHead,
  wbsPipe
} from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { getTeamTypeIcon } from './CalendarDayCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import ConstructionIcon from '@mui/icons-material/Construction';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LinkIcon from '@mui/icons-material/Link';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';
import { useApproveEvent, useDeleteEvent, useDeleteScheduleSlot, useDenyEvent } from '../../hooks/calendar.hooks';
import EditEventModal from './Components/EditEventModal';
import DeleteSeriesConfirmationModal from './Components/DeleteSeriesConfirmationModal';
import { useToast } from '../../hooks/toasts.hooks';
import NERDeleteModal from '../../components/NERDeleteModal';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getPendingReason } from '../../utils/calendar.utils';

export const getStatusIcon = (status: string, isLarge?: boolean) => {
  const statusIcons: Map<string, JSX.Element> = new Map([
    ['UNCONFIRMED', <HelpIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['CONFIRMED', <CheckCircleIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['SCHEDULED', <HelpIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['DONE', <CheckCircleIcon fontSize={isLarge ? 'large' : 'small'} />]
  ]);
  return statusIcons.get(status);
};

const stopClick: React.MouseEventHandler<HTMLElement> = (e) => {
  e.stopPropagation();
};

interface EventClickContentProps {
  event: EventInstance;
  eventTypes: EventType[];
  calendars: Calendar[];
  dayOfWeek?: DayOfWeek;
  disable: boolean;
  addApprovalButtons: boolean;
  onClose: () => void;
  onEdit: (event: EventInstance) => void;
  onDelete: (event: EventInstance) => void;
  clickedDate?: Date;
}

const joinPeople = (members: { firstName: string; lastName: string }[]) =>
  members.map((m) => `${m.firstName} ${m.lastName}`).join(', ');

const hasValue = (v?: string | null) => {
  const s = (v ?? '').trim();
  return s.length > 0 && s.toLowerCase() !== 'n/a';
};

export const EventClickContent: React.FC<EventClickContentProps> = ({
  event,
  eventTypes,
  calendars,
  dayOfWeek,
  disable,
  addApprovalButtons,
  onClose,
  onEdit,
  onDelete,
  clickedDate
}) => {
  const { mutateAsync: approveEvent } = useApproveEvent(event.eventId);
  const { mutateAsync: denyEvent } = useDenyEvent(event.eventId);
  const currentUser = useCurrentUser();
  const toast = useToast();

  const theme = useTheme();

  // User can approve if they are admin, head, or the user whose approval is required
  const canApprove =
    isAdmin(currentUser.role) || isHead(currentUser.role) || event.approvalRequiredFrom?.userId === currentUser.userId;

  const name = event.workPackages?.[0]?.wbsElement?.name || event.title;

  const specificEventType = eventTypes.find((et) => et.eventTypeId === event.eventTypeId);
  const specificCalendar = calendars.find((calendar) =>
    calendar.eventTypes.some((et) => et.eventTypeId === specificEventType?.eventTypeId)
  );
  const calendarColor = specificCalendar?.color ?? 'gray';

  // Only show availability button for required/optional members or the creator, and only if not already scheduled
  const showAvailabilityButton =
    event.status !== EventStatus.SCHEDULED &&
    (event.requiredMembers.some((m) => m.userId === currentUser.userId) ||
      event.optionalMembers.some((m) => m.userId === currentUser.userId) ||
      event.userCreated.userId === currentUser.userId);

  // Only show edit/delete icons for creators and heads or higher
  const canEditOrDelete =
    event.userCreated.userId === currentUser.userId || isAdmin(currentUser.role) || isHead(currentUser.role);

  const eventDate = clickedDate || event.startTime;

  const availabilityUrl = `${routes.CALENDAR}/event/${event.eventId}?date=${eventDate.toISOString()}`;

  const requiredText = event.requiredMembers.length > 0 ? joinPeople(event.requiredMembers) : '';
  const optionalText = event.optionalMembers.length > 0 ? joinPeople(event.optionalMembers) : '';
  const confirmedText = event.confirmedMembers.length > 0 ? joinPeople(event.confirmedMembers) : '';
  const deniedText = event.deniedMembers.length > 0 ? joinPeople(event.deniedMembers) : '';

  const teamsText = event.teams.length > 0 ? event.teams.map((t) => t.teamName).join(', ') : '';
  const machineryText = event.machinery.length > 0 ? event.machinery.map((m) => m.name || 'Machinery').join(', ') : '';
  const shopsText = event.shops.length > 0 ? event.shops.map((s) => s.name).join(', ') : '';

  const descriptionText = (event.description ?? '').trim();
  const locationText = (event.location ?? '').trim();

  const pendingReason = getPendingReason(event);

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[900],
        color: theme.palette.common.white,
        borderRadius: 2,
        px: 2,
        py: 1.5,
        maxWidth: 520
      }}
    >
      {pendingReason && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="small" />}
          sx={{
            mb: 1.5,
            py: 0,
            px: 1,
            fontSize: 12,
            bgcolor: 'rgba(255, 167, 38, 0.15)',
            color: '#ffa726',
            '& .MuiAlert-icon': {
              color: '#ffa726',
              py: 0.5
            }
          }}
        >
          {pendingReason}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {getTeamTypeIcon(event.teamType?.name ?? '', true)}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: calendarColor,
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                lineHeight: 1.2
              }}
            >
              {name}
            </Typography>
          </Box>

          {!disable && canEditOrDelete && (
            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  stopClick(e);
                  onEdit(event);
                }}
                sx={{
                  color: theme.palette.grey[500],
                  '&:hover': { color: theme.palette.common.white, bgcolor: 'transparent' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  stopClick(e);
                  onDelete(event);
                }}
                sx={{
                  color: theme.palette.grey[500],
                  '&:hover': { color: '#ef5350', bgcolor: 'transparent' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
          {dayOfWeek && <AccessTimeIcon fontSize="small" />}
          {dayOfWeek && !event.allDay && (
            <Typography variant="body2">
              {formatEventTime(event.startTime)} – {formatEventTime(event.endTime)}
            </Typography>
          )}
          {dayOfWeek && event.allDay && <Typography variant="body2">All day</Typography>}
          {!dayOfWeek && <AccessTimeIcon fontSize="small" />}
          {hasValue(locationText) && (
            <>
              <LocationOnIcon fontSize="small" sx={{ ml: 2 }} />
              <Typography variant="body2">{locationText}</Typography>
            </>
          )}
        </Stack>
      </Box>

      <Stack spacing={1.25}>
        {/* Required */}
        {hasValue(requiredText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <GroupIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Required:</b> {requiredText}
            </Typography>
          </Stack>
        )}

        {/* Optional */}
        {hasValue(optionalText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <GroupIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Optional:</b> {optionalText}
            </Typography>
          </Stack>
        )}

        {/* Confirmed */}
        {hasValue(confirmedText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <CheckCircleIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Confirmed:</b> {confirmedText}
            </Typography>
          </Stack>
        )}

        {/* Denied */}
        {hasValue(deniedText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <DoNotDisturbIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Denied:</b> {deniedText}
            </Typography>
          </Stack>
        )}

        {specificEventType?.requiresConfirmation && showAvailabilityButton && (
          <Stack direction="row" spacing={1} alignItems="center">
            <PeopleIcon fontSize="small" sx={{ mt: 0.1 }} />
            <Button
              size="small"
              variant="outlined"
              component={RouterLink}
              to={availabilityUrl}
              onClick={stopClick}
              disabled={disable}
              sx={{
                textTransform: 'none',
                borderRadius: 999,
                px: 1.5,
                py: 0.25,
                minHeight: 24,
                fontSize: 12,
                color: theme.palette.common.white,
                borderColor: theme.palette.grey[700],
                '&:hover': {
                  borderColor: theme.palette.grey[500],
                  bgcolor: 'transparent'
                }
              }}
            >
              View availability
            </Button>
          </Stack>
        )}

        {/* Teams */}
        {hasValue(teamsText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <GroupsIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Teams:</b> {teamsText}
            </Typography>
          </Stack>
        )}

        {/* Machinery */}
        {hasValue(machineryText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <ConstructionIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Machinery:</b> {machineryText}
            </Typography>
          </Stack>
        )}

        {/* Shops */}
        {hasValue(shopsText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <StorefrontIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Shops:</b> {shopsText}
            </Typography>
          </Stack>
        )}

        {/* Work packages */}
        {event.workPackages.length > 0 && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <BusinessCenterIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Work packages:</b>{' '}
              {event.workPackages.map((wp, index) => {
                const wbsNum = {
                  carNumber: wp.wbsElement.carNumber,
                  projectNumber: wp.wbsElement.projectNumber,
                  workPackageNumber: wp.wbsElement.workPackageNumber
                };
                return (
                  <span key={wp.workPackageId}>
                    {index > 0 && ', '}
                    <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(wbsNum)}`} onClick={stopClick}>
                      {wp.wbsElement?.name || 'Work package'}
                    </Link>
                  </span>
                );
              })}
            </Typography>
          </Stack>
        )}

        {/* Zoom link */}
        {hasValue(event.zoomLink) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <LinkIcon fontSize="small" sx={{ mt: 0.3 }} />
            {disable ? (
              <Typography variant="body2" sx={{ flex: 1 }}>
                Zoom Link
              </Typography>
            ) : (
              <Link href={event.zoomLink!} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                Zoom Link
              </Link>
            )}
          </Stack>
        )}

        {/* Question document */}
        {hasValue(event.questionDocumentLink) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <ArticleIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2">
              <b>Question doc:</b>{' '}
              {disable ? (
                <Typography variant="body2" sx={{ flex: 1 }}>
                  Question Document Link
                </Typography>
              ) : (
                <Typography
                  marginX={0.5}
                  marginY={0.5}
                  lineHeight={'120%'}
                  fontSize={14}
                  fontWeight="bold"
                  noWrap
                  align="left"
                >
                  {event.questionDocumentLink ? (
                    <Link
                      href={event.questionDocumentLink}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener"
                    >
                      Question Document Link
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              )}
            </Typography>
          </Stack>
        )}

        {/* Description */}
        {hasValue(descriptionText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <DescriptionIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'pre-wrap' }}>
              <b>Description:</b> {descriptionText}
            </Typography>
          </Stack>
        )}

        {/* Status */}
        {hasValue(event.status) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            {getStatusIcon(event.status!, false) ?? <HelpIcon fontSize="small" sx={{ mt: 0.3 }} />}
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Status:</b> {event.status}
            </Typography>
            {specificEventType?.sendSlackNotifications && (event.teams.length > 0 || event.workPackages.length > 0) && (
              <NotificationsIcon sx={{ color: 'white', fontSize: 18, mt: '3px', flexShrink: 0 }} />
            )}
          </Stack>
        )}

        {addApprovalButtons && canApprove && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <NERSuccessButton
              sx={{ mx: 1 }}
              type="submit"
              onClick={async () => {
                try {
                  await approveEvent();
                  toast.success('Event approved successfully');
                  onClose();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to approve event');
                }
              }}
            >
              Approve
            </NERSuccessButton>

            <NERFailButton
              sx={{ mx: 1 }}
              onClick={async () => {
                try {
                  await denyEvent();
                  toast.success('Event denied successfully');
                  onClose();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to deny event');
                }
              }}
            >
              Deny
            </NERFailButton>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export interface EventClickPopupProps {
  clickedEvent?: EventInstance;
  anchorPosition?: { top: number; left: number };
  onClose: () => void;
  eventTypes: EventType[];
  calendars: Calendar[];
  dayOfWeek?: DayOfWeek;
  disable?: boolean;
  addApprovalButtons?: boolean;
  clickedDate?: Date;
}

export const EventClickPopup: React.FC<EventClickPopupProps> = ({
  clickedEvent,
  anchorPosition,
  onClose,
  eventTypes,
  calendars,
  dayOfWeek,
  disable = false,
  addApprovalButtons = false,
  clickedDate
}) => {
  const toast = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSeriesDeleteModal, setShowSeriesDeleteModal] = useState(false);

  const { mutateAsync: deleteEvent } = useDeleteEvent(clickedEvent?.eventId ?? '');
  const { mutateAsync: deleteScheduleSlot } = useDeleteScheduleSlot(
    clickedEvent?.eventId ?? '',
    clickedEvent?.scheduleSlotId ?? ''
  );

  const handleEdit = (_event: EventInstance) => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    // If the event is recurring, show the series delete modal. Otherwise only show regular confirmation modal
    if (clickedEvent?.recurring) {
      setShowSeriesDeleteModal(true);
    } else {
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteModal(false);
      onClose();
      await deleteEvent();
      toast.success('Event deleted successfully!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleSeriesDeleteConfirm = async (deleteEntireEvent: boolean) => {
    try {
      setShowSeriesDeleteModal(false);
      onClose();
      if (deleteEntireEvent) {
        await deleteEvent();
        toast.success('Event deleted successfully!');
      } else {
        await deleteScheduleSlot();
        toast.success('Event occurrence deleted successfully!');
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <Popover
      open={Boolean(clickedEvent && anchorPosition)}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? { top: 0, left: 0 }}
      onClose={onClose}
      anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
      transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      disableRestoreFocus
      PaperProps={{
        sx: {
          backgroundImage: 'none'
        }
      }}
    >
      {clickedEvent && (
        <EventClickContent
          event={clickedEvent}
          eventTypes={eventTypes}
          calendars={calendars}
          dayOfWeek={dayOfWeek}
          disable={disable}
          addApprovalButtons={addApprovalButtons}
          onClose={onClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
          clickedDate={clickedDate}
        />
      )}
      {clickedEvent && showEditModal && (
        <EditEventModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            onClose();
          }}
          event={clickedEvent}
          eventTypes={eventTypes}
        />
      )}

      {clickedEvent && showDeleteModal && (
        <NERDeleteModal
          open={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            onClose();
          }}
          formId="delete-event-form"
          dataType={clickedEvent.title}
          onFormSubmit={handleDeleteConfirm}
        />
      )}

      {clickedEvent && showSeriesDeleteModal && (
        <DeleteSeriesConfirmationModal
          open={showSeriesDeleteModal}
          onCancel={() => {
            setShowSeriesDeleteModal(false);
            onClose();
          }}
          onConfirm={handleSeriesDeleteConfirm}
          eventTitle={clickedEvent.title}
          totalSlots={clickedEvent.totalScheduledSlots}
        />
      )}
    </Popover>
  );
};

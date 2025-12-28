import React, { useState } from 'react';
import { Box, Button, IconButton, Link, Popover, Stack, Typography, useTheme } from '@mui/material';
import { Calendar, DayOfWeek, Event, EventType } from 'shared';

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

import { getConvertedEnd, getConvertedStart } from '../../utils/datetime.utils';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';
import {
  EditEventArgs,
  useApproveEvent,
  useDenyEvent,
  useEditEvent,
  useUploadManyDocuments
} from '../../hooks/calendar.hooks';
import { convertDayToDayShorthand } from '../../utils/calendar.utils';
import EditEventModal from './Components/EditEventModal';
import { EventFormValues, EventRoutePayload } from './Components/EventModal';
import { useToast } from '../../hooks/toasts.hooks';

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
  event: Event;
  eventTypes: EventType[];
  calendars: Calendar[];
  dayOfWeek?: DayOfWeek;
  disable: boolean;
  addApprovalButtons: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  clickedDate?: Date;
}

const joinPeople = (members: { firstName: string; lastName: string }[]) =>
  members.map((m) => `${m.firstName} ${m.lastName}`).join(', ');

const hasValue = (v?: string | null) => {
  const s = (v ?? '').trim();
  return s.length > 0 && s.toLowerCase() !== 'n/a';
};

const EventClickContent: React.FC<EventClickContentProps> = ({
  event,
  eventTypes,
  calendars,
  dayOfWeek,
  disable,
  addApprovalButtons,
  onClose,
  onEdit,
  clickedDate
}) => {
  const { mutateAsync: approveEvent } = useApproveEvent(event.eventId);
  const { mutateAsync: denyEvent } = useDenyEvent(event.eventId);

  const theme = useTheme();

  const name = event.workPackages?.[0]?.wbsElement?.name || event.title;
  const startTime = dayOfWeek ? getConvertedStart(event, dayOfWeek) : '';
  const endTime = dayOfWeek ? getConvertedEnd(event, dayOfWeek) : '';

  const specificEventType = eventTypes.find((et) => et.eventTypeId === event.eventTypeId);
  const specificCalendar = calendars.find((calendar) =>
    calendar.eventTypes.some((et) => et.eventTypeId === specificEventType?.eventTypeId)
  );
  const calendarColor = specificCalendar?.color ?? 'gray';

  const showAvailabilityButton = true;

  const eventDate =
    clickedDate ||
    (event.scheduledTimes[0]?.initialDateScheduled ? new Date(event.scheduledTimes[0].initialDateScheduled) : new Date());

  const availabilityUrl = `${routes.NEW_CALENDAR}/${event.eventId}?date=${eventDate.toISOString()}`;

  const requiredText = event.requiredMembers.length > 0 ? joinPeople(event.requiredMembers) : '';
  const optionalText = event.optionalMembers.length > 0 ? joinPeople(event.optionalMembers) : '';
  const confirmedText = event.confirmedMembers.length > 0 ? joinPeople(event.confirmedMembers) : '';
  const deniedText = event.deniedMembers.length > 0 ? joinPeople(event.deniedMembers) : '';

  const teamsText = event.teams.length > 0 ? event.teams.map((t) => t.teamName).join(', ') : '';
  const machineryText = event.machinery.length > 0 ? event.machinery.map((m) => m.name || 'Machinery').join(', ') : '';
  const shopsText = event.shops.length > 0 ? event.shops.map((s) => s.name).join(', ') : '';
  const workPackagesText =
    event.workPackages.length > 0 ? event.workPackages.map((wp) => wp.wbsElement?.name || 'Work package').join(', ') : '';

  const descriptionText = (event.description ?? '').trim();
  const locationText = (event.location ?? '').trim();

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
      <Box sx={{ position: 'relative', mb: 2 }}>
        {!disable && (
          <IconButton
            size="small"
            onClick={(e) => {
              stopClick(e);
              onEdit(event);
            }}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: theme.palette.grey[500],
              '&:hover': {
                color: theme.palette.common.white,
                bgcolor: 'transparent'
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 4 }}>
          {getTeamTypeIcon(event.teamType?.name ?? '', true)}
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 'bold',
              color: calendarColor
            }}
          >
            {name}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
          {dayOfWeek && <AccessTimeIcon fontSize="small" />}
          {dayOfWeek && (
            <Typography variant="body2">
              {startTime} – {endTime}
            </Typography>
          )}
          {!dayOfWeek && <AccessTimeIcon fontSize="small" />}
          {!dayOfWeek && (
            <Stack spacing={1.25} direction="column">
              {event.scheduledTimes.map((slot) => (
                <Typography variant="body2">
                  {slot.startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) ?? 'N/A'} –{' '}
                  {slot.endTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) ?? 'N/A'}
                  {' : '}
                  {slot.days.map((day) => convertDayToDayShorthand(day)).join(', ')}
                </Typography>
              ))}
            </Stack>
          )}
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

        {showAvailabilityButton && (
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
        {hasValue(workPackagesText) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <BusinessCenterIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              <b>Work packages:</b> {workPackagesText}
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
          </Stack>
        )}
        {addApprovalButtons && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <NERSuccessButton
              sx={{ mx: 1 }}
              type="submit"
              onClick={async () => {
                await approveEvent();
                onClose();
              }}
            >
              Approve
            </NERSuccessButton>
            <NERFailButton
              sx={{ mx: 1 }}
              onClick={async () => {
                await denyEvent();
                onClose();
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
  clickedEvent?: Event;
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

  const { mutateAsync: editEvent } = useEditEvent(clickedEvent?.eventId ?? '');
  const { mutateAsync: uploadDocuments } = useUploadManyDocuments();

  const convertEventToFormValues = (event: Event): Partial<EventFormValues> => {
    return {
      title: event.title,
      eventTypeId: event.eventTypeId,
      requiredMemberIds: event.requiredMembers.map((m) => m.userId),
      optionalMemberIds: event.optionalMembers.map((m) => m.userId),
      teamIds: event.teams.map((t) => t.teamId),
      teamTypeId: event.teamType?.teamTypeId,
      location: event.location,
      zoomLink: event.zoomLink,
      shopIds: event.shops.map((s) => s.shopId),
      machineryIds: event.machinery.map((m) => m.machineryId),
      workPackageIds: event.workPackages.map((wp) => wp.workPackageId),
      documentFiles: event.documents.map((doc) => ({
        name: doc.name,
        googleFileId: doc.googleFileId
      })),
      questionDocumentLink: event.questionDocumentLink,
      description: event.description,
      scheduleDate: event.scheduledTimes[0]?.initialDateScheduled
        ? new Date(event.scheduledTimes[0].initialDateScheduled)
        : new Date(),
      startTime: event.scheduledTimes[0]?.startTime ? new Date(event.scheduledTimes[0].startTime) : undefined,
      endTime: event.scheduledTimes[0]?.endTime ? new Date(event.scheduledTimes[0].endTime) : undefined,
      allDay: event.scheduledTimes[0]?.allDay ?? false,
      recurrenceNumber: event.scheduledTimes[0]?.recurrenceNumber ?? 0,
      days: event.scheduledTimes[0]?.days ?? []
    };
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = async (data: EventRoutePayload) => {
    if (!clickedEvent) return;

    try {
      const { scheduleSlot, documentFiles, ...eventData } = data;

      if (!scheduleSlot || scheduleSlot.length === 0) {
        throw new Error('Missing scheduleSlot');
      }

      // Convert EventRoutePayload to EditEventArgs format
      const editArgs: EditEventArgs = {
        ...eventData,
        status: clickedEvent.status, // Use existing event status
        documents: clickedEvent.documents.map((doc) => ({
          name: doc.name,
          googleFileId: doc.googleFileId
        })),
        scheduleSlot: scheduleSlot.map((slot) => ({
          days: slot.days,
          startTime: slot.startTime,
          endTime: slot.endTime,
          recurrenceNumber: slot.recurrenceNumber,
          initialDateScheduled: slot.initialDateScheduled,
          allDay: slot.allDay
        }))
      };

      const editedEvent = await editEvent(editArgs);

      // Upload new documents if any
      const filesToUpload = documentFiles.map((doc) => doc.file).filter((file): file is File => file !== undefined);

      if (filesToUpload.length > 0) {
        await uploadDocuments({
          id: editedEvent.eventId,
          files: filesToUpload
        });
      }

      toast.success('Event updated successfully!');
      setShowEditModal(false);
      onClose();
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
          onSubmit={handleEditSubmit}
          initialValues={convertEventToFormValues(clickedEvent)}
          eventTypes={eventTypes}
        />
      )}
    </Popover>
  );
};

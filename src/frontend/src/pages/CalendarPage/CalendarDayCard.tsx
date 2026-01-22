import { useState } from 'react';
import { Box, Card, CardContent, Grid, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Calendar, DayOfWeek, EventInstance, EventType } from 'shared';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import { EventClickContent } from './EventClickPopup';
import EventPartialInfoView from './EventPartialInfoView';
import EditEventModal from './Components/EditEventModal';
import NERDeleteModal from '../../components/NERDeleteModal';
import { useDeleteEvent } from '../../hooks/calendar.hooks';
import { useToast } from '../../hooks/toasts.hooks';

export const getTeamTypeIcon = (teamTypeName: string, isLarge?: boolean) => {
  const teamIcons: Map<string, JSX.Element> = new Map([
    ['Software', <TerminalIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Business', <WorkOutlineIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Electrical', <ElectricalServicesIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Mechanical', <ConstructionIcon fontSize={isLarge ? 'large' : 'small'} />]
  ]);

  return teamIcons.get(teamTypeName);
};

export const getStatusIcon = (status: string, isLarge?: boolean) => {
  const statusIcons: Map<string, JSX.Element> = new Map([
    ['UNCONFIRMED', <HelpIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['CONFIRMED', <CheckCircleIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['SCHEDULED', <HelpIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['DONE', <CheckCircleIcon fontSize={isLarge ? 'large' : 'small'} />]
  ]);

  return statusIcons.get(status);
};

interface CalendarDayCardProps {
  cardDate: Date;
  events: EventInstance[];
  eventTypes?: EventType[];
  calendars?: Calendar[];
  dayOfWeek?: DayOfWeek;
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  cardDate,
  events,
  eventTypes = [],
  calendars = [],
  dayOfWeek = DayOfWeek.MONDAY
}) => {
  const [, setIsCreateModalOpen] = useState(false);
  const theme = useTheme();

  const today = new Date().toDateString();
  const isCurrentDay = cardDate.toDateString() === today;
  const isFutureDay = cardDate >= new Date();

  // Track which event's tooltip is locked open after clicking
  const [lockedTooltipEventId, setLockedTooltipEventId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInstance | null>(null);
  const toast = useToast();

  const { mutateAsync: deleteEvent } = useDeleteEvent(selectedEvent?.eventId ?? '');

  const handleEdit = (event: EventInstance) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = (event: EventInstance) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteModal(false);
      setLockedTooltipEventId(null);
      await deleteEvent();
      toast.success('Event deleted successfully!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography
          variant="h5"
          margin={1}
          noWrap
          sx={{
            color: !(isFutureDay || isCurrentDay) ? theme.palette.grey[100] : theme.palette.grey[600]
          }}
        >
          {cardDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );


  const EventCard = ({ event }: { event: EventInstance }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const specificEventType = eventTypes.find((eventType) => eventType.eventTypeId === event.eventTypeId);
    const specificCalendar = calendars.find((calendar) =>
      calendar.eventTypes.some((eventType) => eventType.eventTypeId === specificEventType?.eventTypeId)
    );

    const bgColor = specificCalendar?.color ?? 'gray';
    const isLocked = lockedTooltipEventId === event.eventId;
    const shouldBeOpen = isLocked || isHovered || tooltipHovered;

    return (
      <Box
        marginLeft={0.5}
        marginBottom={0.5}
        marginRight={0.5}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!isLocked && !tooltipHovered) {
              setIsHovered(false);
            }
          }, 100);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setLockedTooltipEventId(event.eventId);
        }}
        sx={{
          position: 'relative',
          zIndex: 2,
          cursor: 'pointer'
        }}
      >
        <Card
          sx={{
            backgroundColor: bgColor,
            borderRadius: 1,
            width: '100%',
            minHeight: 30,
            maxHeight: 30
          }}
        >
          <Tooltip
            placement="right"
            arrow
            open={shouldBeOpen}
            disableHoverListener
            disableFocusListener
            disableTouchListener
            enterDelay={0}
            leaveDelay={200}
            title={
              <Box
                onMouseEnter={() => setTooltipHovered(true)}
                onMouseLeave={() => setTooltipHovered(false)}
              >
                <EventClickContent
                  event={event}
                  eventTypes={eventTypes}
                  calendars={calendars}
                  dayOfWeek={dayOfWeek}
                  disable={false}
                  addApprovalButtons={false}
                  onClose={() => setLockedTooltipEventId(null)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  clickedDate={cardDate}
                />
              </Box>
            }
            slotProps={{
              popper: { sx: { zIndex: 1200 } },
              tooltip: {
                sx: {
                  maxWidth: 'none',
                  borderRadius: 4,
                  p: 0,
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 1.0)'
                }
              },
              arrow: {
                sx: {
                  color: theme.palette.grey[900],
                  fontSize: 16
                }
              }
            }}
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 4]
                  }
                }
              ]
            }}
          >
            <Typography
              marginX={0.5}
              marginY={0.6}
              lineHeight="120%"
              fontSize={14}
              fontWeight="bold"
              noWrap
              align="left"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {getTeamTypeIcon(event.teamType?.name ?? '')} {event.title}
            </Typography>
          </Tooltip>
        </Card>
      </Box>
    );
  };

  const ExtraEventItem = ({ event }: { event: EventInstance }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const isLocked = lockedTooltipEventId === event.eventId;
    const shouldBeOpen = isLocked || isHovered || tooltipHovered;

    return (
      <Tooltip
        placement="right"
        arrow
        open={shouldBeOpen}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        enterDelay={0}
        leaveDelay={200}
        title={
          <Box
            onMouseEnter={() => setTooltipHovered(true)}
            onMouseLeave={() => setTooltipHovered(false)}
          >
            <EventClickContent
              event={event}
              eventTypes={eventTypes}
              calendars={calendars}
              dayOfWeek={dayOfWeek}
              disable={false}
              addApprovalButtons={false}
              onClose={() => setLockedTooltipEventId(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              clickedDate={cardDate}
            />
          </Box>
        }
        slotProps={{
          popper: { sx: { zIndex: 1300 } },
          tooltip: {
            sx: {
              maxWidth: 'none',
              borderRadius: 4,
              p: 0,
              cursor: 'pointer',
              bgcolor: 'transparent',
              boxShadow: '0 0 15px rgba(255, 255, 255, 1.0)'
            }
          },
          arrow: {
            sx: {
              color: theme.palette.grey[900],
              fontSize: 16
            }
          }
        }}
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 4]
              }
            }
          ]
        }}
      >
        <Box
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setTimeout(() => {
              if (!isLocked && !tooltipHovered) {
                setIsHovered(false);
              }
            }, 100);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLockedTooltipEventId(event.eventId);
          }}
        >
          <EventPartialInfoView event={event} onClick={() => {}} calendars={calendars} eventTypes={eventTypes} />
        </Box>
      </Tooltip>
    );
  };

  const ExtraEventsCard = ({ extraEvents }: { extraEvents: EventInstance[] }) => {
    return (
      <Box marginLeft={0.5} marginRight={0.5} marginBottom={0.2} sx={{ position: 'relative', zIndex: 2 }}>
        <Tooltip
          placement="right"
          arrow
          enterDelay={0}
          leaveDelay={200}
          title={
            <Stack direction="column">
              {extraEvents.map((event) => (
                <ExtraEventItem key={event.eventId} event={event} />
              ))}
            </Stack>
          }
          slotProps={{
            popper: { sx: { zIndex: 1200 } },
            tooltip: {
              sx: {
                maxWidth: 'none',
                borderRadius: 4,
                p: 2,
                bgcolor: theme.palette.grey[900],
                boxShadow: '0 0 15px rgba(255, 255, 255, 1.0)'
              }
            },
            arrow: {
              sx: {
                color: theme.palette.grey[900],
                fontSize: 16
              }
            }
          }}
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 4]
                }
              }
            ]
          }}
        >
          <Card
            sx={{
              backgroundColor: theme.palette.grey[800],
              borderRadius: 1,
              width: '100%',
              minHeight: 30,
              maxHeight: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography fontSize={14} fontWeight="bold">
              {'+' + extraEvents.length}
            </Typography>
          </Card>
        </Tooltip>
      </Box>
    );
  };

  return (
    <>
      {/* Backdrop for locked tooltips to handle click-away */}
      {lockedTooltipEventId && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1199,
            pointerEvents: 'all'
          }}
          onClick={() => setLockedTooltipEventId(null)}
        />
      )}

      <Card
        sx={{
          position: 'relative',
          backgroundColor: !(isFutureDay || isCurrentDay) ? theme.palette.grey[900] : 'inherit',
          borderRadius: 2,
          width: { xs: '95%', md: '80%' },
          height: { xs: '10vh', sm: '12vh' },
          border: isCurrentDay ? '2px solid gray' : 'none',
          cursor: isFutureDay || isCurrentDay ? 'pointer' : 'default',
          transition: 'background 0.2s',
          '&:hover': isFutureDay || isCurrentDay ? { background: '#232323' } : {}
        }}
      >
        <Box
          onClick={() => {
            if (isFutureDay || isCurrentDay) setIsCreateModalOpen(true);
          }}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'auto'
          }}
        />

        <CardContent sx={{ padding: 0 }}>
          <DayCardTitle />
          {events.length < 3 ? (
            events.map((event) => <EventCard key={event.eventId} event={event} />)
          ) : (
            <>
              <EventCard event={events[0]} />
              <EventCard event={events[1]} />
              <ExtraEventsCard extraEvents={events.slice(2)} />
            </>
          )}
        </CardContent>
      </Card>

      {selectedEvent && showEditModal && (
        <EditEventModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setLockedTooltipEventId(null);
          }}
          event={selectedEvent}
          eventTypes={eventTypes}
        />
      )}

      {selectedEvent && showDeleteModal && (
        <NERDeleteModal
          open={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            setLockedTooltipEventId(null);
          }}
          formId="delete-event-form"
          dataType={selectedEvent.title}
          onFormSubmit={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default CalendarDayCard;

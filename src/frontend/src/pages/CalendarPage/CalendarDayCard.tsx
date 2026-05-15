import { useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Calendar, CalendarTask, ConflictStatus, DayOfWeek, EventInstance, EventStatus, EventType } from 'shared';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import { EventClickContent } from './EventClickPopup';
import EventPartialInfoView from './EventPartialInfoView';
import EditEventModal from './Components/EditEventModal';
import DeleteSeriesConfirmationModal from './Components/DeleteSeriesConfirmationModal';
import NERDeleteModal from '../../components/NERDeleteModal';
import { useDeleteEvent, useDeleteScheduleSlot } from '../../hooks/calendar.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { getMutedColor } from '../../utils/calendar.utils';
import { TaskClickContent } from './TaskClickPopup';
import { apiUrls } from '../../utils/urls';

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
  displayMonth: Date;
  events: EventInstance[];
  eventTypes?: EventType[];
  calendars?: Calendar[];
  dayOfWeek?: DayOfWeek;
  onCreateEventClick: (date: Date) => void;
  tasks?: CalendarTask[];
}

// Constants for dynamic event display calculation
const TITLE_HEIGHT = 28; // Height of the day number title
const EVENT_CARD_HEIGHT = 24; // Height of each event card
const EVENT_MARGIN = 4; // Margin between events

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  cardDate,
  displayMonth,
  events,
  eventTypes = [],
  calendars = [],
  dayOfWeek = DayOfWeek.MONDAY,
  onCreateEventClick,
  tasks = []
}) => {
  const theme = useTheme();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentDay = cardDate.toDateString() === today.toDateString();
  const isCurrentMonth =
    cardDate.getMonth() === displayMonth.getMonth() && cardDate.getFullYear() === displayMonth.getFullYear();
  const isFutureDay = cardDate >= today;
  const isClickable = isFutureDay || isCurrentDay;

  // Track hover state for stable hover effect
  const [isHovered, setIsHovered] = useState(false);

  // Track which event's tooltip is locked open after clicking
  const [lockedTooltipEventId, setLockedTooltipEventId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSeriesDeleteModal, setShowSeriesDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInstance | null>(null);
  const toast = useToast();

  // Ref and state for dynamic event count calculation
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxVisibleEvents, setMaxVisibleEvents] = useState(2);

  // Calculate how many events can fit based on container height
  useEffect(() => {
    const calculateMaxEvents = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const availableHeight = containerHeight - TITLE_HEIGHT;
        const eventSlotHeight = EVENT_CARD_HEIGHT + EVENT_MARGIN;
        // Reserve space for the "+N more" card if there are extra events
        const maxEvents = Math.max(1, Math.floor(availableHeight / eventSlotHeight));
        setMaxVisibleEvents(maxEvents);
      }
    };

    calculateMaxEvents();
    window.addEventListener('resize', calculateMaxEvents);
    return () => window.removeEventListener('resize', calculateMaxEvents);
  }, []);

  const { mutateAsync: deleteEvent } = useDeleteEvent(selectedEvent?.eventId ?? '');
  const { mutateAsync: deleteScheduleSlot } = useDeleteScheduleSlot(
    selectedEvent?.eventId ?? '',
    selectedEvent?.scheduleSlotId ?? ''
  );

  const handleEdit = (event: EventInstance) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = (event: EventInstance) => {
    setSelectedEvent(event);
    if (event.recurring) {
      setShowSeriesDeleteModal(true);
    } else {
      setShowDeleteModal(true);
    }
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

  const handleSeriesDeleteConfirm = async (deleteEntireEvent: boolean) => {
    try {
      setShowSeriesDeleteModal(false);
      setLockedTooltipEventId(null);
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

  const allItems = [...events, ...tasks];
  const totalItems = allItems.length;

  const TaskCard = ({ task }: { task: CalendarTask }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const tooltipKey = `task-${task.taskId}`;
    const isLocked = lockedTooltipEventId === tooltipKey;
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
    const shouldBeOpen = isLocked || isHovered || tooltipHovered;

    return (
      <Box
        marginLeft={0.5}
        marginBottom={0.25}
        marginRight={0.5}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!isLockedRef.current && !tooltipHoveredRef.current) {
              setIsHovered(false);
            }
          }, 100);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setLockedTooltipEventId(tooltipKey);
        }}
        sx={{
          position: 'relative',
          zIndex: 2,
          cursor: 'pointer'
        }}
      >
        <Card
          sx={{
            backgroundColor: '#7B68EE',
            borderRadius: 1,
            width: '100%',
            minHeight: EVENT_CARD_HEIGHT,
            maxHeight: EVENT_CARD_HEIGHT
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
              <Box onMouseEnter={() => setTooltipHovered(true)} onMouseLeave={() => setTooltipHovered(false)}>
                <TaskClickContent task={task} onClose={() => setLockedTooltipEventId(null)} />
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
              marginY={0.3}
              lineHeight="120%"
              fontSize={14}
              fontWeight="bold"
              noWrap
              align="left"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <AssignmentIcon sx={{ fontSize: 14 }} /> {task.title}
            </Typography>
          </Tooltip>
        </Card>
      </Box>
    );
  };

  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography
          variant="body1"
          margin={0.5}
          noWrap
          sx={{
            color: isCurrentMonth ? theme.palette.grey[100] : theme.palette.grey[500],
            fontSize: 16,
            fontWeight: 500
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

    const baseColor = specificCalendar?.color ?? 'gray';
    const isPending =
      event.status === EventStatus.UNCONFIRMED ||
      event.status === EventStatus.CONFIRMED ||
      event.approved === ConflictStatus.PENDING ||
      event.approved === ConflictStatus.DENIED;
    const bgColor = isPending ? getMutedColor(baseColor, 0.35) : baseColor;
    const isLocked = lockedTooltipEventId === event.eventId;
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
    const shouldBeOpen = isLocked || isHovered || tooltipHovered;

    return (
      <Box
        marginLeft={0.5}
        marginBottom={0.25}
        marginRight={0.5}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setTooltipHovered(false);
          setTimeout(() => {
            if (!isLockedRef.current && !tooltipHoveredRef.current) {
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
            minHeight: EVENT_CARD_HEIGHT,
            maxHeight: EVENT_CARD_HEIGHT,
            ...(isPending && {
              border: `1px dashed ${baseColor}`,
              opacity: 0.8
            })
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
              <Box onMouseEnter={() => setTooltipHovered(true)} onMouseLeave={() => setTooltipHovered(false)}>
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
              marginY={0.3}
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
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
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
          <Box onMouseEnter={() => setTooltipHovered(true)} onMouseLeave={() => setTooltipHovered(false)}>
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
              if (!isLockedRef.current && !tooltipHoveredRef.current) {
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

  const ExtraTaskItem = ({ task }: { task: CalendarTask }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const tooltipKey = `task-${task.taskId}`;
    const isLocked = lockedTooltipEventId === tooltipKey;
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
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
          <Box onMouseEnter={() => setTooltipHovered(true)} onMouseLeave={() => setTooltipHovered(false)}>
            <TaskClickContent task={task} onClose={() => setLockedTooltipEventId(null)} />
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
            setTooltipHovered(false);
            setTimeout(() => {
              if (!isLockedRef.current && !tooltipHoveredRef.current) {
                setIsHovered(false);
              }
            }, 100);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLockedTooltipEventId(tooltipKey);
          }}
        >
          <Typography
            fontSize={14}
            fontWeight="bold"
            noWrap
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#7B68EE', cursor: 'pointer', py: 0.25 }}
          >
            <AssignmentIcon sx={{ fontSize: 14 }} /> {task.title}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const ExtraEventsCard = ({
    extraEvents,
    extraTasks = []
  }: {
    extraEvents: EventInstance[];
    extraTasks?: CalendarTask[];
  }) => {
    const totalExtra = extraEvents.length + extraTasks.length;
    return (
      <Box marginLeft={0.5} marginRight={0.5} marginBottom={0.25} sx={{ position: 'relative', zIndex: 2 }}>
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
              {extraTasks.map((task) => (
                <ExtraTaskItem key={task.taskId} task={task} />
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
              minHeight: EVENT_CARD_HEIGHT,
              maxHeight: EVENT_CARD_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography fontSize={14} fontWeight="bold">
              {'+' + totalExtra}
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
        ref={containerRef}
        onMouseEnter={() => isClickable && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          backgroundColor: !isCurrentMonth ? '#1f1f1f' : isHovered ? '#383838' : '#2a2a2a',
          borderRadius: 2,
          width: '100%',
          height: '100%',
          border: isCurrentDay ? '2px solid gray' : 'none',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease-in-out',
          opacity: isCurrentMonth ? 1 : 0.5
        }}
      >
        <Box
          onClick={() => {
            if (isClickable) onCreateEventClick(cardDate);
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
          {totalItems > 0 && (
            <>
              {totalItems <= maxVisibleEvents ? (
                // All items fit - show them all
                <>
                  {events.map((event) => (
                    <EventCard key={event.eventId} event={event} />
                  ))}
                  {tasks.map((task) => (
                    <TaskCard key={task.taskId} task={task} />
                  ))}
                </>
              ) : (
                // Too many items - show as many as possible with "+N more"
                (() => {
                  const visibleSlots = maxVisibleEvents - 1;
                  const visibleEventCount = Math.min(events.length, visibleSlots);
                  const visibleTaskCount = Math.min(tasks.length, visibleSlots - visibleEventCount);
                  return (
                    <>
                      {events.slice(0, visibleEventCount).map((event) => (
                        <EventCard key={event.eventId} event={event} />
                      ))}
                      {visibleTaskCount > 0 &&
                        tasks.slice(0, visibleTaskCount).map((task) => <TaskCard key={task.taskId} task={task} />)}
                      <ExtraEventsCard
                        extraEvents={events.slice(visibleEventCount)}
                        extraTasks={tasks.slice(visibleTaskCount)}
                      />
                    </>
                  );
                })()
              )}
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

      {selectedEvent && showSeriesDeleteModal && (
        <DeleteSeriesConfirmationModal
          open={showSeriesDeleteModal}
          onCancel={() => {
            setShowSeriesDeleteModal(false);
            setLockedTooltipEventId(null);
          }}
          onConfirm={handleSeriesDeleteConfirm}
          eventTitle={selectedEvent.title}
          totalSlots={selectedEvent.totalScheduledSlots}
        />
      )}
    </>
  );
};

export default CalendarDayCard;

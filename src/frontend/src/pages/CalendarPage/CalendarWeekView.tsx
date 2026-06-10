/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useRef, useState, useCallback } from 'react';
import { Box, Card, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Calendar, CalendarTask, ConflictStatus, EventInstance, EventStatus, EventType, isGuest } from 'shared';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { EventClickContent } from './EventClickPopup';
import EditEventModal from './Components/EditEventModal';
import DeleteSeriesConfirmationModal from './Components/DeleteSeriesConfirmationModal';
import NERDeleteModal from '../../components/NERDeleteModal';
import { useDeleteEvent, useDeleteScheduleSlot } from '../../hooks/calendar.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { getMutedColor } from '../../utils/calendar.utils';
import { getTeamTypeIcon } from './CalendarDayCard';
import { TaskClickContent } from './TaskClickPopup';

// ─── Layout constants ────────────────────────────────────────────────────────

const HOUR_HEIGHT = 60; // px per hour (1px = 1 minute)
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT; // 1440px
const MIN_EVENT_HEIGHT = 18; // px minimum for very short events
const TIME_GUTTER_WIDTH = 56; // px for the hour-label column
const SNAP_MINUTES = 15; // drag-to-create snap interval
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getMinutesFromMidnight = (date: Date): number => date.getHours() * 60 + date.getMinutes();

const snapToInterval = (minutes: number): number => Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;

const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const formatMinutes = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
};

const getWeekDays = (sundayOfWeek: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sundayOfWeek);
    d.setDate(sundayOfWeek.getDate() + i);
    return d;
  });

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// ─── Event layout ─────────────────────────────────────────────────────────────

interface LayoutEvent {
  event: EventInstance;
  top: number;
  height: number;
  col: number;
  totalCols: number;
}

/**
 * Positions events within a single day column using a greedy lane-assignment
 * algorithm so that overlapping events appear side-by-side.
 */
const computeEventLayouts = (events: EventInstance[]): LayoutEvent[] => {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Greedy column assignment: track the end-time of the last event placed in each column.
  const colEndTimes: number[] = [];
  const placements: { event: EventInstance; col: number }[] = [];

  for (const event of sorted) {
    const startMs = new Date(event.startTime).getTime();
    const endMs = new Date(event.endTime).getTime();
    let col = colEndTimes.findIndex((e) => e <= startMs);
    if (col === -1) {
      col = colEndTimes.length;
      colEndTimes.push(endMs);
    } else {
      colEndTimes[col] = endMs;
    }
    placements.push({ event, col });
  }

  return placements.map(({ event, col }) => {
    const startMs = new Date(event.startTime).getTime();
    const endMs = new Date(event.endTime).getTime();

    // totalCols = highest column index used by concurrent events + 1
    const concurrent = placements.filter(({ event: other }) => {
      const oStart = new Date(other.startTime).getTime();
      const oEnd = new Date(other.endTime).getTime();
      return oStart < endMs && oEnd > startMs;
    });
    const totalCols = Math.max(...concurrent.map((p) => p.col)) + 1;

    const startMin = getMinutesFromMidnight(new Date(event.startTime));
    const endMin = getMinutesFromMidnight(new Date(event.endTime));
    const durationMin = Math.max(endMin - startMin, SNAP_MINUTES);

    return {
      event,
      top: (startMin / 60) * HOUR_HEIGHT,
      height: Math.max((durationMin / 60) * HOUR_HEIGHT, MIN_EVENT_HEIGHT),
      col,
      totalCols
    };
  });
};

// ─── Component props ──────────────────────────────────────────────────────────

interface CalendarWeekViewProps {
  allEventTypes: EventType[];
  allCalendars: Calendar[];
  eventInstances: EventInstance[];
  displayWeek: Date; // Sunday of the displayed week
  onNavigateWeek: (offset: -1 | 1) => void;
  onCreateEventClick: (date: Date, startTime?: Date, endTime?: Date) => void;
  tasks?: CalendarTask[];
}

// ─── Drag state ───────────────────────────────────────────────────────────────

interface DragState {
  dayIndex: number;
  dayDate: Date;
  startMinutes: number;
  currentMinutes: number; // updated as mouse moves
}

// ─── Main component ───────────────────────────────────────────────────────────

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  allEventTypes,
  allCalendars,
  eventInstances,
  displayWeek,
  onNavigateWeek,
  onCreateEventClick,
  tasks = []
}) => {
  const theme = useTheme();
  const user = useCurrentUser();
  const toast = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [lockedTooltipEventId, setLockedTooltipEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventInstance | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSeriesDeleteModal, setShowSeriesDeleteModal] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ dayIndex: number; dayDate: Date; startMinutes: number } | null>(null);
  const dragEndMinutesRef = useRef<number>(0);

  const { mutateAsync: deleteEvent } = useDeleteEvent(selectedEvent?.eventId ?? '');
  const { mutateAsync: deleteScheduleSlot } = useDeleteScheduleSlot(
    selectedEvent?.eventId ?? '',
    selectedEvent?.scheduleSlotId ?? ''
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = getWeekDays(displayWeek);

  // Format the week date range for the navigation header
  const formatWeekRange = (): string => {
    const [start, , , , , , end] = weekDays;
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (start.getFullYear() !== end.getFullYear()) {
      return `${startStr}, ${start.getFullYear()} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${startStr} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return `${startStr} – ${end.getDate()}, ${end.getFullYear()}`;
  };

  // Partition events into timed vs all-day
  const timedEvents = eventInstances.filter((e) => !e.allDay);
  const allDayEvents = eventInstances.filter((e) => e.allDay);

  // Build per-day event lists for the timed grid
  const eventsByDay: EventInstance[][] = weekDays.map((day) =>
    timedEvents.filter((e) => isSameDay(new Date(e.startTime), day))
  );

  // Build per-day all-day event lists
  const allDayEventsByDay: EventInstance[][] = weekDays.map((day) =>
    allDayEvents.filter((e) => {
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);
      if (start.getTime() === end.getTime()) {
        // Single-point event (e.g., unscheduled design review or all day event) — compare UTC date
        return (
          start.getUTCFullYear() === day.getFullYear() &&
          start.getUTCMonth() === day.getMonth() &&
          start.getUTCDate() === day.getDate()
        );
      }
      // Multi-day range — use local time boundary comparison
      const dayStart = new Date(day);
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);
      return start < dayEnd && end > dayStart;
    })
  );

  // Build per-day task lists (tasks appear on their deadline day)
  // Task deadlines are date-only values normalized to local midnight by dbDateToLocalDate
  // in the transformer, so compare local components on both sides.
  const tasksByDay: CalendarTask[][] = weekDays.map((day) =>
    tasks.filter((t) => {
      if (!t.deadline) return false;
      return isSameDay(new Date(t.deadline), day);
    })
  );

  // Calendar color lookup
  const getEventColor = (event: EventInstance): string => {
    const eventType = allEventTypes.find((et) => et.eventTypeId === event.eventTypeId);
    const calendar = allCalendars.find((cal) => cal.eventTypes.some((et) => et.eventTypeId === eventType?.eventTypeId));
    return calendar?.color ?? '#888888';
  };

  // ─── Scroll to current time on mount ──────────────────────────────────────

  const scrollInitialized = useRef(false);
  const timeGridRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && !scrollInitialized.current) {
        scrollInitialized.current = true;
        const now = new Date();
        const isThisWeek = weekDays.some((d) => isSameDay(d, now));
        const targetMinutes = isThisWeek ? getMinutesFromMidnight(now) : 8 * 60;
        const targetPx = (targetMinutes / 60) * HOUR_HEIGHT;
        // Center the current time in the viewport (visible height ~768px = 12 hours)
        node.scrollTop = Math.max(0, targetPx - node.clientHeight / 2);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayWeek]
  );

  // ─── Drag-to-create handlers ───────────────────────────────────────────────

  const getMinutesFromMouseY = (e: React.MouseEvent, container: HTMLDivElement): number => {
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top + container.scrollTop;
    const rawMinutes = (y / HOUR_HEIGHT) * 60;
    return Math.max(0, Math.min(23 * 60 + 59, rawMinutes));
  };

  const handleTimeGridMouseDown = (e: React.MouseEvent, dayIndex: number, dayDate: Date) => {
    if (isGuest(user.role)) return;
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    if (dayStart < today) return; // past days are not clickable

    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;

    const rawMinutes = getMinutesFromMouseY(e, container);
    const snapped = snapToInterval(rawMinutes);

    isDraggingRef.current = true;
    dragStartRef.current = { dayIndex, dayDate, startMinutes: snapped };
    dragEndMinutesRef.current = snapped + 60; // default 1-hour slot for click (no drag)
    setDragState({ dayIndex, dayDate, startMinutes: snapped, currentMinutes: snapped + SNAP_MINUTES });
  };

  const handleTimeGridMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const rawMinutes = getMinutesFromMouseY(e, container);
    const snapped = Math.max(snapToInterval(rawMinutes), dragStartRef.current.startMinutes + SNAP_MINUTES);
    dragEndMinutesRef.current = Math.min(snapped, 24 * 60);
    setDragState((prev) => (prev ? { ...prev, currentMinutes: Math.min(snapped, 24 * 60) } : null));
  };

  const handleTimeGridMouseUp = () => {
    if (!isDraggingRef.current || !dragStartRef.current) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      setDragState(null);
      return;
    }

    isDraggingRef.current = false;

    const { dayDate, startMinutes } = dragStartRef.current;
    // Use the ref (updated synchronously) instead of dragState (async React state)
    const endMinutes = dragEndMinutesRef.current;
    dragStartRef.current = null;

    setDragState(null);

    const startTime = new Date(dayDate);
    startTime.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const endTime = new Date(dayDate);
    endTime.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    onCreateEventClick(dayDate, startTime, endTime);
  };

  const handleTimeGridMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      setDragState(null);
    }
  };

  // ─── Edit / delete handlers ────────────────────────────────────────────────

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
      if (err instanceof Error) toast.error(err.message);
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
      if (err instanceof Error) toast.error(err.message);
    }
  };

  // ─── Sub-components ────────────────────────────────────────────────────────

  const WeekEventBlock = ({ event, layout }: { event: EventInstance; layout: LayoutEvent }) => {
    const [blockHovered, setBlockHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const isLocked = lockedTooltipEventId === event.eventId + event.scheduleSlotId;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
    const isOpen = isLocked || blockHovered || tooltipHovered;

    const baseColor = getEventColor(event);
    const isPending =
      event.status === EventStatus.UNCONFIRMED ||
      event.status === EventStatus.CONFIRMED ||
      event.approved === ConflictStatus.PENDING ||
      event.approved === ConflictStatus.DENIED;
    const bgColor = isPending ? getMutedColor(baseColor, 0.45) : baseColor;

    const widthPct = 100 / layout.totalCols;
    const leftPct = (layout.col / layout.totalCols) * 100;
    const showTime = layout.height >= 36;

    return (
      <Tooltip
        placement="right"
        arrow
        open={isOpen}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        enterDelay={0}
        leaveDelay={200}
        title={
          <Box
            onMouseEnter={() => setTooltipHovered(true)}
            onMouseLeave={() => setTooltipHovered(false)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <EventClickContent
              event={event}
              eventTypes={allEventTypes}
              calendars={allCalendars}
              disable={false}
              addApprovalButtons={false}
              onClose={() => setLockedTooltipEventId(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              clickedDate={new Date(event.startTime)}
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
              bgcolor: 'transparent',
              boxShadow: '0 0 15px rgba(255,255,255,1.0)'
            }
          },
          arrow: { sx: { color: theme.palette.grey[900], fontSize: 16 } }
        }}
        PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 4] } }] }}
      >
        <Box
          data-testid="week-event-block"
          onMouseEnter={() => setBlockHovered(true)}
          onMouseLeave={() => {
            setTooltipHovered(false);
            setTimeout(() => {
              if (!isLockedRef.current && !tooltipHoveredRef.current) setBlockHovered(false);
            }, 100);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLockedTooltipEventId(event.eventId + event.scheduleSlotId);
          }}
          onMouseDown={(e) => e.stopPropagation()} // prevent drag when clicking an event
          sx={{
            position: 'absolute',
            top: layout.top,
            height: layout.height,
            left: `calc(${leftPct}% + 1px)`,
            width: `calc(${widthPct}% - 2px)`,
            bgcolor: bgColor,
            borderRadius: 1,
            overflow: 'hidden',
            cursor: 'pointer',
            zIndex: 2,
            ...(isPending && { border: `1px dashed ${baseColor}`, opacity: 0.85 })
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 'bold',
              px: 0.75,
              pt: 0.5,
              lineHeight: 1.2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: showTime ? 2 : 1,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {getTeamTypeIcon(event.teamType?.name ?? '')} {event.title}
          </Typography>
          {showTime && (
            <Typography sx={{ fontSize: 11, px: 0.75, opacity: 0.85 }}>
              {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {' – '}
              {new Date(event.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Typography>
          )}
        </Box>
      </Tooltip>
    );
  };

  const AllDayEventBlock = ({ event }: { event: EventInstance }) => {
    const [blockHovered, setBlockHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const isLocked = lockedTooltipEventId === event.eventId + event.scheduleSlotId;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const isOpen = isLocked || blockHovered || tooltipHovered;

    const baseColor = getEventColor(event);
    const isPending =
      event.status === EventStatus.UNCONFIRMED ||
      event.status === EventStatus.CONFIRMED ||
      event.approved === ConflictStatus.PENDING ||
      event.approved === ConflictStatus.DENIED;
    const bgColor = isPending ? getMutedColor(baseColor, 0.45) : baseColor;

    return (
      <Tooltip
        placement="right"
        arrow
        open={isOpen}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        enterDelay={0}
        leaveDelay={200}
        title={
          <Box
            onMouseEnter={() => setTooltipHovered(true)}
            onMouseLeave={() => setTooltipHovered(false)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <EventClickContent
              event={event}
              eventTypes={allEventTypes}
              calendars={allCalendars}
              disable={false}
              addApprovalButtons={false}
              onClose={() => setLockedTooltipEventId(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              clickedDate={new Date(event.startTime)}
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
              bgcolor: 'transparent',
              boxShadow: '0 0 15px rgba(255,255,255,1.0)'
            }
          },
          arrow: { sx: { color: theme.palette.grey[900], fontSize: 16 } }
        }}
        PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 4] } }] }}
      >
        <Card
          onMouseEnter={() => setBlockHovered(true)}
          onMouseLeave={() => {
            setTooltipHovered(false);
            setTimeout(() => {
              if (!isLockedRef.current && !tooltipHoveredRef.current) setBlockHovered(false);
            }, 100);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLockedTooltipEventId(event.eventId + event.scheduleSlotId);
          }}
          sx={{
            bgcolor: bgColor,
            borderRadius: 0.5,
            px: 0.5,
            py: 0.25,
            mb: 0.25,
            cursor: 'pointer',
            overflow: 'hidden',
            ...(isPending && { border: `1px dashed ${baseColor}`, opacity: 0.85 })
          }}
        >
          <Typography noWrap sx={{ fontSize: 11, fontWeight: 'bold', lineHeight: 1.3 }}>
            {event.title}
          </Typography>
        </Card>
      </Tooltip>
    );
  };

  const AllDayTaskBlock = ({ task }: { task: CalendarTask }) => {
    const [blockHovered, setBlockHovered] = useState(false);
    const [tooltipHovered, setTooltipHovered] = useState(false);
    const tooltipHoveredRef = useRef(false);
    tooltipHoveredRef.current = tooltipHovered;
    const tooltipKey = `task-${task.taskId}`;
    const isLocked = lockedTooltipEventId === tooltipKey;
    const isLockedRef = useRef(false);
    isLockedRef.current = isLocked;
    const isOpen = isLocked || blockHovered || tooltipHovered;

    return (
      <Tooltip
        placement="right"
        arrow
        open={isOpen}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        enterDelay={0}
        leaveDelay={200}
        title={
          <Box
            onMouseEnter={() => setTooltipHovered(true)}
            onMouseLeave={() => setTooltipHovered(false)}
            onMouseDown={(e) => e.stopPropagation()}
          >
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
              bgcolor: 'transparent',
              boxShadow: '0 0 15px rgba(255,255,255,1.0)'
            }
          },
          arrow: { sx: { color: theme.palette.grey[900], fontSize: 16 } }
        }}
        PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 4] } }] }}
      >
        <Card
          onMouseEnter={() => setBlockHovered(true)}
          onMouseLeave={() => {
            setTooltipHovered(false);
            setTimeout(() => {
              if (!isLockedRef.current && !tooltipHoveredRef.current) setBlockHovered(false);
            }, 100);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLockedTooltipEventId(tooltipKey);
          }}
          sx={{
            bgcolor: '#7B68EE',
            borderRadius: 0.5,
            px: 0.5,
            py: 0.25,
            mb: 0.25,
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          <Typography
            noWrap
            sx={{ fontSize: 11, fontWeight: 'bold', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 0.25 }}
          >
            <AssignmentIcon sx={{ fontSize: 11 }} /> {task.title}
          </Typography>
        </Card>
      </Tooltip>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Locked tooltip backdrop */}
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

      {/* Navigation header — outside the white box, matching the month view's header area */}
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ flexShrink: 0, pb: 0.5 }}>
        <Box
          data-testid="week-prev-button"
          onClick={() => onNavigateWeek(-1)}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: 'white' }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 32, strokeWidth: 2 }} />
        </Box>
        <Typography
          sx={{
            fontFamily: (t) => t.typography.h4.fontFamily,
            fontWeight: 600,
            fontSize: 18,
            minWidth: 220,
            textAlign: 'center'
          }}
          data-testid="week-date-range"
        >
          {formatWeekRange()}
        </Typography>
        <Box
          data-testid="week-next-button"
          onClick={() => onNavigateWeek(1)}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: 'white' }
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 32, strokeWidth: 2 }} />
        </Box>
      </Stack>

      {/* White-bordered grid box — column headers + all-day row + scrollable time grid */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          border: '2px solid white',
          borderRadius: 2,
          bgcolor: '#1a1a1a',
          overflow: 'hidden'
        }}
      >
        {/* Column headers: day names + dates */}
        <Box
          sx={{
            display: 'flex',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.12)'
          }}
          data-testid="week-column-headers"
        >
          {/* Spacer for the time gutter */}
          <Box sx={{ width: TIME_GUTTER_WIDTH, flexShrink: 0 }} />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 0.75,
                  borderLeft: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: 16, color: isToday ? 'red' : 'inherit' }}>
                  {DAY_LABELS[i]}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isToday ? 'red' : 'transparent'
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold', fontSize: 16, color: isToday ? 'white' : 'inherit' }}>
                    {day.getDate()}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* All-day row */}
        <Box
          sx={{
            display: 'flex',
            flexShrink: 0,
            minHeight: 36,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            bgcolor: '#222'
          }}
          data-testid="all-day-row"
        >
          <Box
            sx={{
              width: TIME_GUTTER_WIDTH,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pr: 1
            }}
          >
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>All day</Typography>
          </Box>
          {weekDays.map((_day, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                p: 0.25,
                overflow: 'hidden'
              }}
            >
              {allDayEventsByDay[i].map((event) => (
                <AllDayEventBlock key={event.eventId + event.scheduleSlotId} event={event} />
              ))}
              {tasksByDay[i].map((task) => (
                <AllDayTaskBlock key={task.taskId} task={task} />
              ))}
            </Box>
          ))}
        </Box>

        {/* Scrollable time grid */}
        <Box
          ref={(node: HTMLDivElement | null) => {
            (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            timeGridRef(node);
          }}
          onMouseMove={handleTimeGridMouseMove}
          onMouseUp={handleTimeGridMouseUp}
          onMouseLeave={handleTimeGridMouseLeave}
          data-testid="week-time-grid"
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarColor: `${theme.palette.primary.main} transparent`,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: '3px' },
            userSelect: 'none'
          }}
        >
          {/* Inner container — full 24-hour height */}
          <Box sx={{ position: 'relative', height: TOTAL_HEIGHT, display: 'flex' }}>
            {/* Time gutter */}
            <Box sx={{ width: TIME_GUTTER_WIDTH, flexShrink: 0, position: 'relative' }}>
              {Array.from({ length: 24 }, (_, hour) => (
                <Box
                  key={hour}
                  sx={{
                    position: 'absolute',
                    top: hour * HOUR_HEIGHT - 8, // offset so label sits just above the hour line
                    right: 6,
                    pointerEvents: 'none'
                  }}
                >
                  {hour > 0 && (
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {formatHour(hour)}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {/* Day columns */}
            <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
              {/* Horizontal hour and half-hour lines — rendered once across all columns */}
              {Array.from({ length: 24 }, (_, hour) => (
                <Box key={`line-${hour}`}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: hour * HOUR_HEIGHT,
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  />
                  {hour < 23 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: hour * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                        borderTop: '1px dashed rgba(255,255,255,0.05)',
                        pointerEvents: 'none',
                        zIndex: 0
                      }}
                    />
                  )}
                </Box>
              ))}

              {/* Current time indicator */}
              {weekDays.some((d) => isSameDay(d, today)) &&
                (() => {
                  const todayIndex = weekDays.findIndex((d) => isSameDay(d, today));
                  const nowMinutes = getMinutesFromMidnight(new Date());
                  const topPx = (nowMinutes / 60) * HOUR_HEIGHT;
                  const colWidth = 100 / 7;
                  return (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: topPx,
                        left: `${todayIndex * colWidth}%`,
                        width: `${colWidth}%`,
                        height: 2,
                        bgcolor: 'red',
                        zIndex: 3,
                        pointerEvents: 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: -4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'red'
                        }
                      }}
                    />
                  );
                })()}

              {/* Per-day columns */}
              {weekDays.map((day, dayIndex) => {
                const isToday = isSameDay(day, today);
                const isPastDay = day < today;
                const canCreate = !isPastDay && !isGuest(user.role);
                const layouts = computeEventLayouts(eventsByDay[dayIndex]);

                return (
                  <Box
                    key={dayIndex}
                    data-testid={`week-day-column-${dayIndex}`}
                    onMouseDown={canCreate ? (e) => handleTimeGridMouseDown(e, dayIndex, day) : undefined}
                    sx={{
                      flex: 1,
                      position: 'relative',
                      borderLeft: '1px solid rgba(255,255,255,0.08)',
                      bgcolor: isToday ? 'rgba(255,255,255,0.025)' : 'transparent',
                      cursor: canCreate ? 'crosshair' : 'default'
                    }}
                  >
                    {/* Drag selection overlay */}
                    {dragState?.dayIndex === dayIndex &&
                      (() => {
                        const minStart = Math.min(dragState.startMinutes, dragState.currentMinutes);
                        const minEnd = Math.max(dragState.startMinutes, dragState.currentMinutes);
                        const topPx = (minStart / 60) * HOUR_HEIGHT;
                        const heightPx = ((minEnd - minStart) / 60) * HOUR_HEIGHT;
                        return (
                          <Box
                            data-testid="drag-selection-overlay"
                            sx={{
                              position: 'absolute',
                              top: topPx,
                              height: heightPx,
                              left: 1,
                              right: 1,
                              bgcolor: 'rgba(100,160,255,0.35)',
                              border: '1px solid rgba(100,160,255,0.8)',
                              borderRadius: 0.5,
                              zIndex: 4,
                              pointerEvents: 'none',
                              display: 'flex',
                              alignItems: 'flex-start',
                              px: 0.5,
                              pt: 0.25
                            }}
                          >
                            <Typography sx={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>
                              {formatMinutes(minStart)} – {formatMinutes(minEnd)}
                            </Typography>
                          </Box>
                        );
                      })()}

                    {/* Timed event blocks */}
                    {layouts.map((layout) => (
                      <WeekEventBlock
                        key={layout.event.eventId + layout.event.scheduleSlotId}
                        event={layout.event}
                        layout={layout}
                      />
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Edit modal */}
      {selectedEvent && showEditModal && (
        <EditEventModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setLockedTooltipEventId(null);
          }}
          event={selectedEvent}
          eventTypes={allEventTypes}
        />
      )}

      {/* Single-event delete modal */}
      {selectedEvent && showDeleteModal && (
        <NERDeleteModal
          open={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            setLockedTooltipEventId(null);
          }}
          formId="week-delete-event-form"
          dataType={selectedEvent.title}
          onFormSubmit={handleDeleteConfirm}
        />
      )}

      {/* Series delete modal */}
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
    </Box>
  );
};

export default CalendarWeekView;

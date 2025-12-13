import { Box, Card, CardContent, Tooltip, Typography, useTheme } from '@mui/material';
import { Calendar, DayOfWeek, Event, EventType, TeamType } from 'shared';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import LinkIcon from '@mui/icons-material/Link';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';

import EventPartialInfoView from './EventPartialInfoView';
import { getConvertedEnd, getConvertedStart } from '../../utils/datetime.utils';
import { EventClickPopup, getStatusIcon } from './EventClickPopup';

export const getTeamTypeIcon = (teamTypeName: string, isLarge?: boolean) => {
  const teamIcons: Map<string, JSX.Element> = new Map([
    ['Software', <TerminalIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Business', <WorkOutlineIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Electrical', <ElectricalServicesIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Mechanical', <ConstructionIcon fontSize={isLarge ? 'large' : 'small'} />]
  ]);

  return teamIcons.get(teamTypeName);
};

interface CalendarDayCardProps {
  cardDate: Date;
  events: Event[];
  teamTypes: TeamType[];
  eventTypes?: EventType[];
  calendars?: Calendar[];
  dayOfWeek?: DayOfWeek;
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  cardDate,
  events,
  teamTypes: _teamTypes,
  eventTypes = [],
  calendars = [],
  dayOfWeek = DayOfWeek.MONDAY
}) => {
  const [, setIsCreateModalOpen] = useState(false);
  const theme = useTheme();

  const today = new Date().toDateString();
  const isCurrentDay = cardDate.toDateString() === today;
  const isFutureDay = cardDate >= new Date();

  const [clickedEvent, setClickedEvent] = useState<Event | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

  const handleOpenClickPopup = (event: Event) => {
    setClickedEvent(event);
    if (typeof window !== 'undefined') {
      setAnchorPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      });
    } else {
      setAnchorPosition({ top: 0, left: 0 });
    }
  };

  const handleCloseClickPopup = () => {
    setClickedEvent(null);
    setAnchorPosition(null);
  };

  const DayCardTitle = () => (
    <Typography
      variant="h5"
      margin={1}
      noWrap
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        color: !(isFutureDay || isCurrentDay) ? theme.palette.grey[100] : theme.palette.grey[600]
      }}
    >
      {cardDate.getDate()}
    </Typography>
  );

  const EventPopupInfo = ({ event, color }: { event: Event; color: string }) => {
    const name = event.workPackages?.[0]?.wbsElement?.name || event.title;
    const convertedStartTime = getConvertedStart(event, dayOfWeek);
    const convertedEndTime = getConvertedEnd(event, dayOfWeek);

    return (
      <Box>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 24, fontWeight: 'bold' }}>
          {getTeamTypeIcon(event.teamType?.name ?? '', true)}
          <span style={{ color }}>{name}</span>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <AccessTimeIcon fontSize="small" />
          <Typography fontSize={14} fontWeight="bold">
            {convertedStartTime} - {convertedEndTime}
          </Typography>
          <LocationOnIcon fontSize="small" />
          <Typography fontSize={14} fontWeight="bold">
            {event.location ?? 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {event.requiredMembers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold">
                Required:
              </Typography>
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.requiredMembers.map((m) => `${m.firstName} ${m.lastName}`).join(', ')}
              </Typography>
            </Box>
          )}

          {event.optionalMembers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold">
                Optional:
              </Typography>
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.optionalMembers.map((m) => `${m.firstName} ${m.lastName}`).join(', ')}
              </Typography>
            </Box>
          )}

          {event.confirmedMembers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.confirmedMembers.map((m) => `${m.firstName} ${m.lastName}`).join(', ')}
              </Typography>
            </Box>
          )}

          {event.deniedMembers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DoNotDisturbIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.deniedMembers.map((m) => `${m.firstName} ${m.lastName}`).join(', ')}
              </Typography>
            </Box>
          )}

          {event.teams.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupsIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold">
                Teams:
              </Typography>
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.teams.map((t) => t.teamName).join(', ')}
              </Typography>
            </Box>
          )}

          {event.machinery.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConstructionIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.machinery.map((m) => m.name).join(', ')}
              </Typography>
            </Box>
          )}

          {event.shops.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorefrontIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.shops.map((s) => s.name).join(', ')}
              </Typography>
            </Box>
          )}

          {event.workPackages.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessCenterIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.workPackages.map((wp) => wp.wbsElement?.name ?? 'Work package').join(', ')}
              </Typography>
            </Box>
          )}

          {event.zoomLink && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                Zoom Link
              </Typography>
            </Box>
          )}

          {event.questionDocument && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArticleIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                Question Document Link
              </Typography>
            </Box>
          )}

          {event.description && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon fontSize="small" />
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.description.substring(0, name.length * 2)}
                {event.description.length > name.length * 2 && '...'}
              </Typography>
            </Box>
          )}

          {event.status && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(event.status)}
              <Typography fontSize={14} fontWeight="bold" noWrap>
                {event.status}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const name = event.workPackages?.[0]?.wbsElement?.name || event.title;

    const specificEventType = eventTypes.find((et) => et.eventTypeId === event.eventTypeId);
    const specificCalendar = calendars.find((calendar) =>
      calendar.eventTypes.some((et) => et.eventTypeId === specificEventType?.eventTypeId)
    );

    const bgColor = specificCalendar?.color ?? 'gray';

    return (
      <Box
        marginLeft={0.5}
        marginBottom={0.5}
        marginRight={0.5}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenClickPopup(event);
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
            title={<EventPopupInfo event={event} color={bgColor} />}
            slotProps={{
              popper: {
                sx: {
                  zIndex: 1200
                }
              },
              tooltip: {
                sx: {
                  maxWidth: 'none',
                  borderRadius: 4,
                  p: 2,
                  cursor: 'pointer',
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
          >
            <Typography
              marginX={0.5}
              marginY={0.6}
              lineHeight="120%"
              fontSize={14}
              fontWeight="bold"
              noWrap
              align="left"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {getTeamTypeIcon(event.teamType?.name ?? '')} {name}
            </Typography>
          </Tooltip>
        </Card>
      </Box>
    );
  };

  interface ExtraEventsCardProps {
    extraEvents: Event[];
  }

  const ExtraEventsCard: React.FC<ExtraEventsCardProps> = ({ extraEvents }) => {
    const handleEventClick = (event: Event) => {
      handleOpenClickPopup(event);
    };

    return (
      <Box
        marginLeft={0.5}
        marginRight={0.5}
        marginBottom={0.2}
        sx={{
          position: 'relative',
          zIndex: 2
        }}
      >
        <Tooltip
          placement="right"
          arrow
          title={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {extraEvents.map((event) => (
                <EventPartialInfoView
                  key={event.eventId}
                  event={event}
                  onClick={() => handleEventClick(event)}
                  dayOfWeek={dayOfWeek}
                  calendars={calendars}
                  eventTypes={eventTypes}
                />
              ))}
            </Box>
          }
          slotProps={{
            popper: {
              sx: {
                zIndex: 1200
              }
            },
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
            if (isFutureDay || isCurrentDay) {
              setIsCreateModalOpen(true);
            }
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

      <EventClickPopup
        clickedEvent={clickedEvent}
        anchorPosition={anchorPosition}
        onClose={handleCloseClickPopup}
        eventTypes={eventTypes}
        calendars={calendars}
        dayOfWeek={dayOfWeek}
      />
    </>
  );
};

export default CalendarDayCard;

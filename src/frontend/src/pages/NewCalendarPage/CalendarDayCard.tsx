import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Link, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Calendar, DayOfWeek, Event, EventType } from 'shared';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
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
import HelpIcon from '@mui/icons-material/Help';
import GroupsIcon from '@mui/icons-material/Groups';

import { EventClickPopup } from './EventClickPopup';
import EventPartialInfoView from './EventPartialInfoView';
import { getConvertedEnd, getConvertedStart } from '../../utils/datetime.utils';

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
  events: Event[];
  eventTypes?: EventType[];
  calendars?: Calendar[];
  dayOfWeek?: DayOfWeek;
  setAvailability: (event: Event) => void;
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  cardDate,
  events,
  eventTypes = [],
  calendars = [],
  dayOfWeek = DayOfWeek.MONDAY,
  setAvailability
}) => {
  const [, setIsCreateModalOpen] = useState(false);
  const theme = useTheme();

  const today = new Date().toDateString();
  const isCurrentDay = cardDate.toDateString() === today;
  const isFutureDay = cardDate >= new Date();

  const [clickedEvent, setClickedEvent] = useState<Event>();
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number }>();

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
    setClickedEvent(undefined);
    setAnchorPosition(undefined);
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

  const EventPopupInfo = ({
    event,
    color,
    eventType
  }: {
    event: Event;
    color: string;
    eventType: EventType | undefined;
  }) => {
    const name = event.title;
    const convertedStartTime = getConvertedStart(event, dayOfWeek);
    const convertedEndTime = getConvertedEnd(event, dayOfWeek);

    return (
      <>
        <Stack direction="column" spacing={2}>
          <Stack direction="row">
            <Typography marginX={0.5} marginY={0.1} lineHeight="120%" fontSize={24} fontWeight="bold" noWrap align="left">
              {getTeamTypeIcon(event.teamType?.name ?? '', true)}
            </Typography>

            <Typography
              marginX={0.5}
              marginY={0.5}
              lineHeight="120%"
              fontSize={24}
              fontWeight="bold"
              noWrap
              align="left"
              color={color}
            >
              {name}
            </Typography>
          </Stack>

          <Stack direction="row">
            <AccessTimeIcon />
            <Typography
              marginX={0.5}
              marginY={0.5}
              marginRight={8}
              lineHeight="120%"
              fontSize={14}
              fontWeight="bold"
              noWrap
              align="left"
            >
              {convertedStartTime} - {convertedEndTime}
            </Typography>
            <LocationOnIcon />
            <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
              {event.location ?? 'N/A'}
            </Typography>
          </Stack>

          {event.requiredMembers.length > 0 && (
            <Stack direction="row">
              <GroupIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                Required :
              </Typography>
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
                {event.requiredMembers.map((member) => `${member.firstName} ${member.lastName}`).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.optionalMembers.length > 0 && (
            <Stack direction="row">
              <GroupIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                Optional :
              </Typography>
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
                {event.optionalMembers.map((member) => `${member.firstName} ${member.lastName}`).join(', ')}
              </Typography>
            </Stack>
          )}

          {eventType?.name === 'Design Review' && (
            <Stack direction="row">
              <GroupIcon />
              <Button
                size="small"
                variant="outlined"
                id="filter-events-button"
                onClick={() => setAvailability(event)}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  marginX: 1
                }}
              >
                View Availability
              </Button>
            </Stack>
          )}
          {event.confirmedMembers.length > 0 && (
            <Stack direction="row">
              <CheckCircleIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                {event.confirmedMembers.map((member) => `${member.firstName} ${member.lastName}`).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.deniedMembers.length > 0 && (
            <Stack direction="row">
              <DoNotDisturbIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                {event.deniedMembers.map((member) => `${member.firstName} ${member.lastName}`).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.teams.length > 0 && (
            <Stack direction="row">
              <GroupsIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                Teams :
              </Typography>
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
                {event.teams.map((team) => team.teamName).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.machinery.length > 0 && (
            <Stack direction="row">
              <ConstructionIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                {event.machinery.map((machine) => machine.name).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.shops.length > 0 && (
            <Stack direction="row">
              <StorefrontIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                {event.shops.map((shop) => shop.name).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.workPackages.length > 0 && (
            <Stack direction="row">
              <BusinessCenterIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" align="left">
                {event.workPackages.map((wp) => wp.wbsElement.name).join(', ')}
              </Typography>
            </Stack>
          )}

          {event.zoomLink && (
            <Stack direction="row">
              <LinkIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
                <Link href={event.zoomLink} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener">
                  Zoom Link
                </Link>
              </Typography>
            </Stack>
          )}
          {event.questionDocumentLink && (
            <Stack direction="row">
              <ArticleIcon />
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
            </Stack>
          )}

          {event.description && (
            <Stack direction="row">
              <DescriptionIcon />
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
                {event.description.substring(0, name.length * 2)}
                {event.description.length > name.length * 2 && '...'}
              </Typography>
            </Stack>
          )}

          {event.status && (
            <Stack direction="row">
              {getStatusIcon(event.status)}
              <Typography marginX={0.5} marginY={0.5} lineHeight="120%" fontSize={14} fontWeight="bold" noWrap align="left">
                {event.status}
              </Typography>
            </Stack>
          )}
        </Stack>
      </>
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const specificEventType = eventTypes.find((eventType) => eventType.eventTypeId === event.eventTypeId);
    const specificCalendar = calendars.find((calendar) =>
      calendar.eventTypes.some((eventType) => eventType.eventTypeId === specificEventType?.eventTypeId)
    );

    const bgColor = specificCalendar?.color ?? 'gray';

    return (
      <Box
        marginLeft={0.5}
        marginBottom={0.5}
        marginRight={0.5}
        // onClick={(e) => {
        //   e.stopPropagation();
        //   handleOpenClickPopup(event);
        // }}
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
            title={<EventPopupInfo event={event} color={bgColor} eventType={specificEventType} />}
            slotProps={{
              popper: { sx: { zIndex: 1200 } },
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
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenClickPopup(event);
              }}
            >
              {getTeamTypeIcon(event.teamType?.name ?? '')} {event.title}
            </Typography>
          </Tooltip>
        </Card>
      </Box>
    );
  };

  const ExtraEventsCard = ({ extraEvents }: { extraEvents: Event[] }) => {
    return (
      <Box marginLeft={0.5} marginRight={0.5} marginBottom={0.2} sx={{ position: 'relative', zIndex: 2 }}>
        <Tooltip
          placement="right"
          arrow
          title={
            <Stack direction="column">
              {extraEvents.map((event) => (
                <EventPartialInfoView
                  key={event.eventId}
                  event={event}
                  onClick={() => handleOpenClickPopup(event)}
                  dayOfWeek={dayOfWeek}
                  calendars={calendars}
                  eventTypes={eventTypes}
                />
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

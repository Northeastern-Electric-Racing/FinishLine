import { Box, Card, CardContent, Grid, Link, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Event, EventStatus, TeamType } from 'shared';
import { meetingStartTimePipeScheduleSlot } from '../../../utils/pipes';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useState } from 'react';
import DRCSummaryModal from '../EventSummaryModal';
import DynamicTooltip from '../../../components/DynamicTooltip';
import { eventStatusColor } from '../../../utils/design-review.utils';

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
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({ cardDate, events, teamTypes }) => {
  const [, setIsCreateModalOpen] = useState(false);
  const theme = useTheme();
  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography
          variant="h6"
          marginRight={1}
          noWrap
          sx={{
            color: !(isFutureDay || isCurrentDay) ? theme.palette.grey[600] : 'inherit'
          }}
        >
          {cardDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );

  const EventCard = ({ event }: { event: Event }) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [markedStatus, setMarkedStatus] = useState(event.status);
    const name = event.workPackages[0]?.wbsElement?.name || event.title;

    return (
      <>
        <DRCSummaryModal
          open={isSummaryModalOpen}
          onHide={() => setIsSummaryModalOpen(false)}
          event={event}
          teamTypes={teamTypes}
          markedStatus={markedStatus}
          setMarkedStatus={setMarkedStatus}
        />
        <Box
          marginLeft={0.5}
          marginBottom={0.5}
          onClick={(e) => {
            e.stopPropagation();
            setIsSummaryModalOpen(true);
          }}
          sx={{
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer'
          }}
        >
          <Card
            sx={{
              backgroundColor: eventStatusColor(markedStatus),
              borderRadius: 1,
              width: '100%',
              minHeight: 20,
              maxHeight: 20
            }}
          >
            <DynamicTooltip
              title={
                name +
                ' - ' +
                (event.status !== EventStatus.UNCONFIRMED
                  ? event.scheduledTimes.length > 0
                    ? meetingStartTimePipeScheduleSlot(event.scheduledTimes)
                    : ''
                  : 'UNCONFIRMED! THIS TIME IS SUBJECT TO CHANGE')
              }
            >
              <Typography marginX={0.5} marginY={0.2} lineHeight={'120%'} fontSize={14} fontWeight="bold" noWrap>
                {name}
              </Typography>
            </DynamicTooltip>
          </Card>
        </Box>
      </>
    );
  };

  const ExtraEventNote = ({ event }: { event: Event }) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [markedStatus, setMarkedStatus] = useState(event.status);

    return (
      <>
        <DRCSummaryModal
          open={isSummaryModalOpen}
          onHide={() => setIsSummaryModalOpen(false)}
          event={event}
          teamTypes={teamTypes}
          markedStatus={markedStatus}
          setMarkedStatus={setMarkedStatus}
        />
        <Link
          style={{ cursor: 'pointer' }}
          fontSize={15}
          onClick={() => {
            setIsSummaryModalOpen(true);
          }}
        >
          {event.workPackages[0]?.wbsElement?.name ||
            event.title + (event.scheduledTimes.length > 0 ? meetingStartTimePipeScheduleSlot(event.scheduledTimes) : '')}
        </Link>
      </>
    );
  };

  const ExtraEventsCard = ({ extraEvents }: { extraEvents: Event[] }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
      <Box
        marginLeft={0.5}
        marginBottom={0.2}
        sx={{
          position: 'relative',
          zIndex: 2
        }}
      >
        <Card
          sx={{
            backgroundColor: 'grey',
            borderRadius: 1,
            minWidth: 140,
            maxWidth: 140,
            minHeight: 20,
            maxHeight: 20
          }}
        >
          <Tooltip
            id="tooltip"
            open={showTooltip}
            disableHoverListener
            onClick={() => setShowTooltip(!showTooltip)}
            placement="right"
            sx={{ cursor: 'pointer' }}
            PopperProps={{
              popperOptions: {
                modifiers: [
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['top', 'bottom'],
                      padding: -1,
                      rootBoundary: 'document'
                    }
                  },
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -1]
                    }
                  }
                ]
              }
            }}
            arrow
            title={
              <Stack direction="column">
                {extraEvents.map((event) => (
                  <ExtraEventNote event={event} />
                ))}
              </Stack>
            }
          >
            <Typography marginLeft={0.5} marginBottom={0.3} align="center">
              {'+' + extraEvents.length}
            </Typography>
          </Tooltip>
        </Card>
      </Box>
    );
  };

  const today = new Date().toDateString();
  const isCurrentDay = cardDate.toDateString() === today;
  const isFutureDay = cardDate >= new Date();

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          backgroundColor: !(isFutureDay || isCurrentDay) ? theme.palette.grey[900] : 'inherit',
          borderRadius: 2,
          width: { xs: '95%', md: '80%' },
          height: { xs: '10vh', sm: '15vh' },
          border: isCurrentDay ? '2px solid gray' : 'none',
          boxShadow: isCurrentDay ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
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
            events.map((event) => <EventCard event={event} />)
          ) : (
            <>
              <EventCard event={events[0]} />
              <ExtraEventsCard extraEvents={events.slice(1)} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
export default CalendarDayCard;

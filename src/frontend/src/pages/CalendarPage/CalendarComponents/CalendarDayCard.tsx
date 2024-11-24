import { Box, Card, CardContent, Grid, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DesignReview, DesignReviewStatus, TeamType } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useState } from 'react';
import DRCSummaryModal from '../DesignReviewSummaryModal';
import { DesignReviewCreateModal } from '../DesignReviewCreateModal';
import DynamicTooltip from '../../../components/DynamicTooltip';
import { designReviewStatusColor } from '../../../utils/design-review.utils';

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
  events: DesignReview[];
  teamTypes: TeamType[];
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({ cardDate, events, teamTypes }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item>
        <IconButton onClick={() => setIsCreateModalOpen(true)}>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography variant="h6" marginRight={1} noWrap>
          {cardDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );

  const EventCard = ({ event }: { event: DesignReview }) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [markedStatus, setMarkedStatus] = useState(event.status);
    const name = event.wbsName;

    return (
      <>
        <DRCSummaryModal
          open={isSummaryModalOpen}
          onHide={() => setIsSummaryModalOpen(false)}
          designReview={event}
          teamTypes={teamTypes}
          markedStatus={markedStatus}
          setMarkedStatus={setMarkedStatus}
        />
        <Box marginLeft={0.5} marginBottom={0.5} onClick={() => setIsSummaryModalOpen(true)} sx={{ cursor: 'pointer' }}>
          <Card
            sx={{
              backgroundColor: designReviewStatusColor(markedStatus),
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
                (event.status !== DesignReviewStatus.UNCONFIRMED
                  ? event.meetingTimes.length > 0
                    ? meetingStartTimePipe(event.meetingTimes)
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

  const ExtraEventNote = ({ event }: { event: DesignReview }) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [markedStatus, setMarkedStatus] = useState(event.status);

    return (
      <>
        <DRCSummaryModal
          open={isSummaryModalOpen}
          onHide={() => setIsSummaryModalOpen(false)}
          designReview={event}
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
          {event.wbsName + (event.meetingTimes.length > 0 ? ' - ' + meetingStartTimePipe(event.meetingTimes) : '')}
        </Link>
      </>
    );
  };

  const ExtraEventsCard = ({ extraEvents }: { extraEvents: DesignReview[] }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
      <Box marginLeft={0.5} marginBottom={0.2}>
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

  return (
    <>
      <DesignReviewCreateModal
        showModal={isCreateModalOpen}
        handleClose={() => {
          setIsCreateModalOpen(false);
        }}
        teamTypes={teamTypes}
        defaultDate={cardDate}
      />
      <Card sx={{ borderRadius: 2, width: { xs: '95%', md: '80%' }, height: { xs: '10vh', sm: '15vh' } }}>
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

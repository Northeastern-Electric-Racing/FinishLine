import { Box, Card, CardContent, Grid, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DesignReview } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useState } from 'react';
import DRCSummaryModal from '../DesignReviewSummaryModal';
import DynamicTooltip from '../../../components/DynamicTooltip';

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
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({ cardDate, events }) => {
  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item>
        <IconButton>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography variant="h6" marginRight={1}>
          {cardDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );

  const EventCard = (event: DesignReview) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const name = event.wbsName;
    return (
      <>
        <DRCSummaryModal open={isSummaryModalOpen} onHide={() => setIsSummaryModalOpen(false)} designReview={event} />
        <Box marginLeft={0.5} marginBottom={0.5} onClick={() => setIsSummaryModalOpen(true)} sx={{ cursor: 'pointer' }}>
          <Card sx={{ backgroundColor: 'red', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
            <Stack direction="row">
              {getTeamTypeIcon(event.teamType.name)}
              <DynamicTooltip
                title={name + (event.meetingTimes.length > 0 ? ' - ' + meetingStartTimePipe(event.meetingTimes) : '')}
              >
                <Typography marginLeft={0.5} marginBottom={0.3} fontSize={14} noWrap>
                  {name + (event.meetingTimes.length > 0 ? ' ' + meetingStartTimePipe(event.meetingTimes) : '')}
                </Typography>
              </DynamicTooltip>
            </Stack>
          </Card>
        </Box>
      </>
    );
  };

  const ExtraEventNote = (event: DesignReview) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    return (
      <>
        <DRCSummaryModal open={isSummaryModalOpen} onHide={() => setIsSummaryModalOpen(false)} designReview={event} />
        <Link style={{ cursor: 'pointer' }} fontSize={15} onClick={() => setIsSummaryModalOpen(true)}>
          {event.wbsName + (event.meetingTimes.length > 0 ? ' - ' + meetingStartTimePipe(event.meetingTimes) : '')}
        </Link>
      </>
    );
  };

  const ExtraEventsCard = (extraEvents: DesignReview[]) => {
    return (
      <Box marginLeft={0.5} marginBottom={0.2}>
        <Card sx={{ backgroundColor: 'grey', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
          <Tooltip
            id="tooltip"
            placement="right"
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
            title={<Stack direction="column">{extraEvents.map((event) => ExtraEventNote(event))}</Stack>}
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
    <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
      <CardContent sx={{ padding: 0 }}>
        <DayCardTitle />
        {events.length < 3 ? (
          events.map((event) => EventCard(event))
        ) : (
          <>
            {EventCard(events[0])}
            {ExtraEventsCard(events.slice(1))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
export default CalendarDayCard;

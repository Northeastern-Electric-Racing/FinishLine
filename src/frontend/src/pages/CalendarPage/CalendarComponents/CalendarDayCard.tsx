import { Box, Card, CardContent, Grid, IconButton, Stack, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DesignReview, TeamType } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useState } from 'react';
import DRCSummaryModal from '../DesignReviewSummaryModal';
import { DesignReviewCreateModal } from '../DesignReviewCreateModal';

export const getTeamTypeIcon = (teamTypeId: string, isLarge?: boolean) => {
  const teamIcons: Map<string, JSX.Element> = new Map([
    ['Software', <TerminalIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Business', <WorkOutlineIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Electrical', <ElectricalServicesIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['Mechanical', <ConstructionIcon fontSize={isLarge ? 'large' : 'small'} />]
  ]);
  return teamIcons.get(teamTypeId);
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
        <Typography variant="h6" marginRight={1}>
          {cardDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );

  const EventCard = (event: DesignReview) => {
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const name = event.designReviewId;
    return (
      <>
        <DRCSummaryModal open={isSummaryModalOpen} onHide={() => setIsSummaryModalOpen(false)} designReview={event} />
        <Box marginLeft={0.5} marginBottom={0.5} onClick={() => setIsSummaryModalOpen(true)} sx={{ cursor: 'pointer' }}>
          <Card sx={{ backgroundColor: 'red', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
            <Stack direction="row">
              {getTeamTypeIcon(event.teamType.teamTypeId)}
              <Typography marginLeft={0.5} marginBottom={0.3} fontSize={14}>
                {name + ' ' + meetingStartTimePipe(event.meetingTimes)}
              </Typography>
            </Stack>
          </Card>
        </Box>
      </>
    );
  };

  const ExtraEventsCard = (extraEvents: number) => {
    return (
      <Box marginLeft={0.5} marginBottom={0.2}>
        <Card sx={{ backgroundColor: 'grey', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
          <Typography marginLeft={0.5} marginBottom={0.3} align="center">
            {'+' + extraEvents}
          </Typography>
        </Card>
      </Box>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
      <DesignReviewCreateModal
        showModal={isCreateModalOpen}
        handleClose={() => {
          setIsCreateModalOpen(false);
        }}
        teamTypes={teamTypes}
      />
      <CardContent sx={{ padding: 0 }}>
        <DayCardTitle />
        {events.length < 3 ? (
          events.map((event) => EventCard(event))
        ) : (
          <>
            {EventCard(events[1])}
            {ExtraEventsCard(events.length - 1)}
          </>
        )}
      </CardContent>
    </Card>
  );
};
export default CalendarDayCard;

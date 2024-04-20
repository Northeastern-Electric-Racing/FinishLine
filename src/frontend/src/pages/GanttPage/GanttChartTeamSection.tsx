import { eachDayOfInterval, isMonday } from 'date-fns';
import { useEffect, useState } from 'react';
import { applyChangesToEvents, EventChange, Task } from '../../utils/gantt.utils';
import { Box, Typography } from '@mui/material';
import GanttChartActivity from './GanttChartActivity';

interface GanttChartTeamSectionProps {
  start: Date;
  end: Date;
  tasks: Task[];
  isEditMode: boolean;
  saveChanges: (eventChanges: EventChange[]) => void;
  onExpanderClick: (ganttTasks: Task) => void;
}

const GanttChartTeamSection = ({
  start,
  end,
  tasks,
  isEditMode,
  saveChanges,
  onExpanderClick
}: GanttChartTeamSectionProps) => {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };

  useEffect(() => {
    // only try to save changes when we're going from non-editing to editing mode
    if (!isEditMode) {
      saveChanges(eventChanges);
      setEventChanges([]); // reset the changes after sending them
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  const displayEvents = applyChangesToEvents(tasks, eventChanges);

  return tasks.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      {/* Data display: reset list of events every time eventChanges list changes using key */}
      <Box sx={{ mt: '1rem', width: 'fit-content' }} key={eventChanges.length}>
        {displayEvents.map((event) => {
          return (
            <GanttChartActivity
              key={event.id}
              days={days}
              event={event}
              isEditMode={isEditMode}
              createChange={createChange}
            />
          );
        })}
      </Box>
    </Box>
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChartTeamSection;

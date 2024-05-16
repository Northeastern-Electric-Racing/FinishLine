import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import { EventChange, GanttTask, RequestEventChange, applyChangesToEvents } from '../../utils/gantt.utils';
import { useState } from 'react';

interface GanttChartTeamSectionProps {
  startDate: Date;
  endDate: Date;
  chartEditingState: Array<{ teamName: string; editing: boolean }>;
  setChartEditingState: (array: Array<{ teamName: string; editing: boolean }>) => void;
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  isEditMode: boolean;
  teamName: string;
  tasks: GanttTask[];
  highlightedChange?: RequestEventChange;
}

const GanttChartTeamSection = ({
  startDate,
  endDate,
  chartEditingState,
  setChartEditingState,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  isEditMode,
  teamName,
  tasks,
  highlightedChange
}: GanttChartTeamSectionProps) => {
  const theme = useTheme();
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);

  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };

  const handleSave = () => {
    const index = chartEditingState.findIndex((entry) => entry.teamName === teamName);
    if (index !== -1) {
      chartEditingState[index] = { teamName, editing: !isEditMode };
    }

    setChartEditingState([...chartEditingState]);

    saveChanges(eventChanges);
    setEventChanges([]); // reset the changes after sending them
  };

  const handleEdit = () => {
    const index = chartEditingState.findIndex((entry) => entry.teamName === teamName);
    if (index !== -1) {
      chartEditingState[index] = { teamName, editing: !isEditMode };
    }

    const projects = tasks ? tasks.filter((event) => !event.project) : [];
    projects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });

    setChartEditingState([...chartEditingState]);
  };

  // Sorting the work packages of each project based on their start date
  tasks.forEach((task) => {
    task.children.sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  const displayEvents = applyChangesToEvents(tasks, eventChanges);

  return (
    <Box
      sx={{
        mt: 1,
        py: 1,
        background: isEditMode ? theme.palette.divider : 'transparent',
        borderRadius: '0.25rem',
        width: 'fit-content'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: '-15px',
          pl: 2,
          position: 'sticky',
          left: 0,
          width: 'fit-content',
          height: '30px'
        }}
      >
        <Typography variant="h6" fontWeight={400}>
          {teamName}
        </Typography>

        {isEditMode ? (
          <Chip label="Save" onClick={handleSave} />
        ) : (
          <IconButton onClick={handleEdit}>
            <Edit />
          </IconButton>
        )}
      </Box>
      <Box key={teamName} sx={{ my: 0, width: 'fit-content', pl: 2 }}>
        <GanttChartSection
          displayEvents={displayEvents}
          start={startDate}
          end={endDate}
          isEditMode={isEditMode}
          createChange={createChange}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={highlightedChange}
        />
      </Box>
    </Box>
  );
};

export default GanttChartTeamSection;

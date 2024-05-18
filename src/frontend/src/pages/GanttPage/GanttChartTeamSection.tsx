import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import { EventChange, GanttTask, RequestEventChange, applyChangesToEvents } from '../../utils/gantt.utils';
import { useState } from 'react';

interface GanttChartTeamSectionProps {
  startDate: Date;
  endDate: Date;
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  teamName: string;
  projectTasks: GanttTask[];
  highlightedChange?: RequestEventChange;
}

const GanttChartTeamSection = ({
  startDate,
  endDate,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  teamName,
  projectTasks,
  highlightedChange
}: GanttChartTeamSectionProps) => {
  const theme = useTheme();
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };

  const handleSave = () => {
    saveChanges(eventChanges);
    setEventChanges([]);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    projectTasks.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });

    setIsEditMode(true);
  };

  // Sorting the work packages of each project based on their start date
  projectTasks.forEach((task) => {
    task.workPackages.sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  const displayedProjects = isEditMode ? applyChangesToEvents(projectTasks, eventChanges) : projectTasks;

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
          start={startDate}
          end={endDate}
          isEditMode={isEditMode}
          projects={displayedProjects}
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

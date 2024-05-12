import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import { EventChange, GanttTask } from '../../utils/gantt.utils';
import { Edit } from '@mui/icons-material';
import GanttChartSection from './GanttChartSection';
import { useState } from 'react';

interface GanttChartProps {
  startDate: Date;
  endDate: Date;
  teamsList: string[];
  teamNameToGanttTasksMap: Map<string, GanttTask[]>;
  chartEditingState: Array<{ teamName: string; editing: boolean }>;
  setChartEditingState: (array: Array<{ teamName: string; editing: boolean }>) => void;
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
}

const GanttChart = ({
  startDate,
  endDate,
  teamsList,
  teamNameToGanttTasksMap,
  chartEditingState,
  setChartEditingState,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap
}: GanttChartProps) => {
  const theme = useTheme();
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);

  return (
    <Box>
      {teamsList.map((teamName: string) => {
        const tasks = teamNameToGanttTasksMap.get(teamName);

        if (!chartEditingState.map((entry) => entry.teamName).includes(teamName)) {
          setChartEditingState([...chartEditingState, { teamName, editing: false }]);
        }

        const isEditMode = chartEditingState.find((entry) => entry.teamName === teamName)?.editing || false;

        const handleEdit = () => {
          const index = chartEditingState.findIndex((entry) => entry.teamName === teamName);
          if (index !== -1) {
            chartEditingState[index] = { teamName, editing: !isEditMode };
          }

          if (!isEditMode) {
            const projects = tasks ? tasks.filter((event) => !event.project) : [];
            projects.forEach((project) => {
              setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
            });
          }
          if (isEditMode) {
            console.log('events ', eventChanges);
            saveChanges(eventChanges);
            setEventChanges(Array.from([])); // this is still not setting the eventChanges as an empty array
            console.log('cleaned events ', eventChanges);
          }

          setChartEditingState([...chartEditingState]);
        };

        if (!tasks) return <></>;

        // Sorting the work packages of each project based on their start date
        tasks.forEach((task) => {
          task.children.sort((a, b) => a.start.getTime() - b.start.getTime());
        });

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
                <Chip label="Save" onClick={handleEdit} />
              ) : (
                <IconButton onClick={handleEdit}>
                  <Edit />
                </IconButton>
              )}
            </Box>
            <Box key={teamName} sx={{ my: 0, width: 'fit-content', pl: 2 }}>
              <GanttChartSection
                tasks={tasks}
                start={startDate}
                end={endDate}
                isEditMode={isEditMode}
                saveChanges={saveChanges}
                eventChanges={eventChanges}
                setEventChanges={setEventChanges}
                showWorkPackagesMap={showWorkPackagesMap}
                setShowWorkPackagesMap={setShowWorkPackagesMap}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default GanttChart;

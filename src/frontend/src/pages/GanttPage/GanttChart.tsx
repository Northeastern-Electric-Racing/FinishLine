import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import { EventChange, GanttTask, RequestEventChange } from '../../utils/gantt.utils';
import { Edit } from '@mui/icons-material';
import GanttChartSection from './GanttChartSection';
import GanttChartCreateButtons from './GanttChartComponents/GanttChartCreateButtons';
import { useEffect, useState } from 'react';

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
  highlightedChange?: RequestEventChange;
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
  setShowWorkPackagesMap,
  highlightedChange
}: GanttChartProps) => {
  const theme = useTheme();
  const [allTasks, setAllTasks] = useState<GanttTask[]>([]);

  useEffect(() => {
    const tasks: GanttTask[] = [];
    teamsList.forEach((teamName) => {
      const currentTasks = teamNameToGanttTasksMap.get(teamName);
      if (currentTasks) {
        tasks.push(...currentTasks);
      }
    });

    setAllTasks(tasks);
  }, [teamNameToGanttTasksMap, teamsList]);

  return (
    <>
      <GanttChartCreateButtons tasks={allTasks} />
      <Box sx={{marginTop: '2em'}}>
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
                  showWorkPackagesMap={showWorkPackagesMap}
                  setShowWorkPackagesMap={setShowWorkPackagesMap}
                  highlightedChange={highlightedChange}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default GanttChart;

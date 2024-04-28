import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import { EventChange, GanttTask } from '../../utils/gantt.utils';
import { Edit } from '@mui/icons-material';
import GanttChartSection from './GanttChartSection';

interface GanttChartProps {
  startDate: Date;
  endDate: Date;
  teamsList: string[];
  teamNameToGanttTasksMap: Map<string, GanttTask[]>;
  chartEditingState: Array<{ teamName: string; editing: boolean }>;
  setChartEditingState: (array: Array<{ teamName: string; editing: boolean }>) => void;
  saveChanges: (eventChanges: EventChange[]) => void;
  ganttTasks: GanttTask[];
  setGanttTasks: (value: React.SetStateAction<GanttTask[]>) => void;
}

const GanttChart = ({
  startDate,
  endDate,
  teamsList,
  teamNameToGanttTasksMap,
  chartEditingState,
  setChartEditingState,
  saveChanges,
  ganttTasks,
  setGanttTasks
}: GanttChartProps) => {
  const theme = useTheme();

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

          setChartEditingState([...chartEditingState]);
        };

        if (!tasks) return <></>;

        // Sorting the work packages of each project based on their start date
        tasks.map((task) => {
          task.children.sort((a, b) => a.start.getTime() - b.start.getTime());
          return task;
        });

        return (
          <Box
            sx={{
              mt: 2,
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
                mb: 1,
                pl: 2,
                position: 'sticky',
                left: 0,
                width: 'fit-content',
                height: '30px'
              }}
            >
              <Typography variant="h5" fontWeight={400}>
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
            <Box key={teamName} sx={{ my: 3, width: 'fit-content', pl: 2 }}>
              <GanttChartSection
                tasks={tasks}
                start={startDate}
                end={endDate}
                isEditMode={isEditMode}
                onExpanderClick={(newTask) => {
                  const newTasks = ganttTasks.map((task) => (newTask.id === task.id ? { ...newTask, teamName } : task));
                  setGanttTasks(newTasks);
                }}
                saveChanges={saveChanges}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default GanttChart;

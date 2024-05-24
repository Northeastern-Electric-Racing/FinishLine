import { Box } from '@mui/material';
import { EventChange, GanttTask, RequestEventChange } from '../../utils/gantt.utils';
import GanttChartTeamSection from './GanttChartTeamSection';

interface GanttChartProps {
  startDate: Date;
  endDate: Date;
  teamsList: string[];
  teamNameToGanttTasksMap: Map<string, GanttTask[]>;
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
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  highlightedChange
}: GanttChartProps) => {

  return (
    <Box>
      {teamsList.map((teamName: string) => {
        const projectTasks = teamNameToGanttTasksMap.get(teamName);

        return projectTasks ? (
          <GanttChartTeamSection
            startDate={startDate}
            endDate={endDate}
            saveChanges={saveChanges}
            showWorkPackagesMap={showWorkPackagesMap}
            setShowWorkPackagesMap={setShowWorkPackagesMap}
            teamName={teamName}
            projectTasks={projectTasks}
            highlightedChange={highlightedChange}
          />
        ) : (
          <></>
        );
      })}
    </Box>
  );
};

export default GanttChart;

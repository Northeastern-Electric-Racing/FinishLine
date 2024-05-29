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
  addProject: (project: GanttTask) => void;
  getNewProjectNumber: (carNumber: number) => number;
  addWorkPackage: (workPackage: GanttTask) => void;
}

const GanttChart = ({
  startDate,
  endDate,
  teamsList,
  teamNameToGanttTasksMap,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  highlightedChange,
  addProject,
  addWorkPackage,
  getNewProjectNumber
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
            addProject={addProject}
            addWorkPackage={addWorkPackage}
            getNewProjectNumber={getNewProjectNumber}
          />
        ) : (
          <></>
        );
      })}
    </Box>
  );
};

export default GanttChart;

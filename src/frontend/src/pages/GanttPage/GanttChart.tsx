import { Box } from '@mui/material';
import { EventChange, GanttTask, RequestEventChange } from '../../utils/gantt.utils';
import GanttChartTeamSection from './GanttChartTeamSection';

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
  return (
    <Box>
      {teamsList.map((teamName: string) => {
        const tasks = teamNameToGanttTasksMap.get(teamName);

        if (!chartEditingState.map((entry) => entry.teamName).includes(teamName)) {
          setChartEditingState([...chartEditingState, { teamName, editing: false }]);
        }

        const isEditMode = chartEditingState.find((entry) => entry.teamName === teamName)?.editing || false;

        return tasks ? (
          <GanttChartTeamSection
            startDate={startDate}
            endDate={endDate}
            chartEditingState={chartEditingState}
            setChartEditingState={setChartEditingState}
            saveChanges={saveChanges}
            showWorkPackagesMap={showWorkPackagesMap}
            setShowWorkPackagesMap={setShowWorkPackagesMap}
            isEditMode={isEditMode}
            teamName={teamName}
            tasks={tasks}
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

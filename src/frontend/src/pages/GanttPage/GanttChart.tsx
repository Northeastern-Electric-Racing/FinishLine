import { Box } from '@mui/material';
import { ProjectPreview, Team, WorkPackage } from 'shared';
import { filterGanttProjects, GanttChange, GanttFilters, RequestEventChange } from '../../utils/gantt.utils';
import GanttChartTeamSection from './GanttChartTeamSection';

interface GanttChartProps {
  startDate: Date;
  endDate: Date;
  teamsList: Team[];
  saveChanges: (eventChanges: GanttChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  highlightedChange?: RequestEventChange;
  addProject: (project: ProjectPreview, team: Team) => void;
  getNewProjectNumber: (carNumber: number) => number;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
  defaultGanttFilters: GanttFilters;
  searchText: string;
  clearEdits: boolean;
  setClearEdits: (clearEdits: boolean) => void;
}

const GanttChart = ({
  startDate,
  endDate,
  teamsList,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  highlightedChange,
  addProject,
  addWorkPackage,
  getNewProjectNumber,
  getNewWorkPackageNumber,
  defaultGanttFilters,
  searchText,
  clearEdits,
  setClearEdits
}: GanttChartProps) => {
  return (
    <Box>
      {teamsList.map((team: Team) => {
        const { projects } = team;

        const filteredProjects = filterGanttProjects(projects, defaultGanttFilters, searchText, team);

        const addProjectHandler = (project: ProjectPreview) => {
          addProject(project, team);
        };

        return filteredProjects ? (
          <GanttChartTeamSection
            startDate={startDate}
            endDate={endDate}
            saveChanges={saveChanges}
            showWorkPackagesMap={showWorkPackagesMap}
            setShowWorkPackagesMap={setShowWorkPackagesMap}
            team={team}
            projects={filteredProjects}
            highlightedChange={highlightedChange}
            addProject={addProjectHandler}
            addWorkPackage={addWorkPackage}
            getNewProjectNumber={getNewProjectNumber}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
            clearEdits={clearEdits}
            setClearEdits={setClearEdits}
          />
        ) : (
          <></>
        );
      })}
    </Box>
  );
};

export default GanttChart;

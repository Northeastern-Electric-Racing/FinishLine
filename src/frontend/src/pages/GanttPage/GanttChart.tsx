import { Box } from '@mui/material';
import { ProjectPreview, Team, WorkPackage } from 'shared';
import { EventChange, filterGanttProjects, GanttFilters, RequestEventChange } from '../../utils/gantt.utils';
import GanttChartTeamSection from './GanttChartTeamSection';

interface GanttChartProps {
  startDate: Date;
  endDate: Date;
  teamsList: Team[];
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  highlightedChange?: RequestEventChange;
  addProject: (project: ProjectPreview) => void;
  getNewProjectNumber: (carNumber: number) => number;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
  defaultGanttFilters: GanttFilters;
  searchText: string;
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
  searchText
}: GanttChartProps) => {
  return (
    <Box>
      {teamsList.map((team: Team) => {
        const { teamName, projects } = team;

        const filteredProjects = filterGanttProjects(projects, defaultGanttFilters, searchText, team);

        return filteredProjects ? (
          <GanttChartTeamSection
            startDate={startDate}
            endDate={endDate}
            saveChanges={saveChanges}
            showWorkPackagesMap={showWorkPackagesMap}
            setShowWorkPackagesMap={setShowWorkPackagesMap}
            teamName={teamName}
            projects={filteredProjects}
            highlightedChange={highlightedChange}
            addProject={addProject}
            addWorkPackage={addWorkPackage}
            getNewProjectNumber={getNewProjectNumber}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        ) : (
          <></>
        );
      })}
    </Box>
  );
};

export default GanttChart;

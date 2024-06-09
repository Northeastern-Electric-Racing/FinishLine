import { Box } from '@mui/material';
import { Dispatch } from 'react';
import { Project, Team, WbsElement, WorkPackage } from 'shared';
import { filterGanttProjects, GanttFilters } from '../../utils/gantt.utils';
import GanttChartTeamSection from './GanttChartTeamSection';

interface GanttChartProps {
  startDate: Date;
  endDate: Date;
  teamsList: Team[];
  defaultGanttFilters: GanttFilters;
  searchText: string;
  addNewWorkPackage: (workPackage: WorkPackage) => void;
  addNewProject: (project: Project) => void;
  getNewProjectNumber: (carNumber: number) => number;
  allWbsElements: WbsElement[];
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: Dispatch<React.SetStateAction<Map<string, boolean>>>;
  removeAddedProjects: (projects: Project[]) => void;
  removeAddedWorkPackages: (workPackages: WorkPackage[]) => void;
}

const GanttChart = ({
  startDate,
  endDate,
  teamsList,
  defaultGanttFilters,
  searchText,
  addNewWorkPackage,
  addNewProject,
  getNewProjectNumber,
  allWbsElements,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  removeAddedProjects,
  removeAddedWorkPackages
}: GanttChartProps) => {
  return (
    <Box>
      {teamsList.map((team: Team) => {
        const { projects } = team;

        const filteredProjects = filterGanttProjects(projects, defaultGanttFilters, searchText, team);

        return filteredProjects ? (
          <GanttChartTeamSection
            startDate={startDate}
            endDate={endDate}
            team={team}
            filteredProjects={filteredProjects}
            addNewWorkPackage={addNewWorkPackage}
            addNewProject={addNewProject}
            getNewProjectNumber={getNewProjectNumber}
            allWbsElements={allWbsElements}
            showWorkPackagesMap={showWorkPackagesMap}
            setShowWorkPackagesMap={setShowWorkPackagesMap}
            removeAddedProjects={removeAddedProjects}
            removeAddedWorkPackages={removeAddedWorkPackages}
          />
        ) : (
          <></>
        );
      })}
    </Box>
  );
};

export default GanttChart;

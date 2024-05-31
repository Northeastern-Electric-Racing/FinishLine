import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import {
  applyChangesToEvent,
  GanttChange,
  RequestEventChange,
  transformProjectPreviewToProject
} from '../../utils/gantt.utils';
import { useState } from 'react';
import AddProjectModal from './GanttChartComponents/AddProjectModal';
import useId from '@mui/material/utils/useId';
import { Project, ProjectPreview, Team, WbsElementStatus, wbsPipe, WorkPackage } from 'shared';
import { projectWbsPipe } from '../../utils/pipes';

interface GanttChartTeamSectionProps {
  startDate: Date;
  endDate: Date;
  saveChanges: (eventChanges: GanttChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  team: Team;
  projects: ProjectPreview[];
  highlightedChange?: RequestEventChange;
  getNewProjectNumber: (carNumber: number) => number;
  addProject: (project: ProjectPreview) => void;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
}

const GanttChartTeamSection = ({
  startDate,
  endDate,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  team,
  projects,
  getNewProjectNumber,
  highlightedChange,
  addProject,
  addWorkPackage,
  getNewWorkPackageNumber
}: GanttChartTeamSectionProps) => {
  const theme = useTheme();
  const [ganttChanges, setGanttChanges] = useState<GanttChange[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const id = useId() || 'id';
  const [projectsState, setProjectsState] = useState<ProjectPreview[]>(projects);

  const createChange = (change: GanttChange) => {
    setGanttChanges([...ganttChanges, change]);
  };

  const handleSave = () => {
    saveChanges(ganttChanges);
    setGanttChanges([]);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    projectsState.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });

    setIsEditMode(true);
  };

  // Sorting the work packages of each project based on their start date
  projectsState.forEach((project) => {
    project.workPackages.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  });

  const handleAddWorkPackage = (workPackage: WorkPackage) => {
    const project = projectsState.find((project) => wbsPipe(project.wbsNum) === projectWbsPipe(workPackage.wbsNum));
    if (!project) return;
    workPackage.wbsNum.workPackageNumber = project.workPackages.length + 1;
    project.workPackages = [...project.workPackages, workPackage];
    setProjectsState([...projectsState]);
    addWorkPackage({ ...workPackage });
  };

  const handleAddProject = (project: ProjectPreview) => {
    setProjectsState([...projectsState, project]);
    addProject(project);
  };

  const createChangeHandler = (change: GanttChange) => {
    const parentProject = projectsState.find((project) => wbsPipe(project.wbsNum) === projectWbsPipe(change.element.wbsNum));
    if (!parentProject) return;

    const newProject: Project = applyChangesToEvent(
      [change],
      transformProjectPreviewToProject(parentProject, team),
      parentProject
    ) as Project;

    const index = projectsState.findIndex((project) => wbsPipe(project.wbsNum) === projectWbsPipe(newProject.wbsNum));
    projectsState[index] = newProject;
    setProjectsState([...projectsState]);
    createChange(change);
  };

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
        <AddProjectModal
          showModal={showAddProjectModal}
          handleClose={() => setShowAddProjectModal(false)}
          addProject={(project) => {
            const newProject: ProjectPreview = {
              id: id + projects.length + 1,
              name: project.name,
              wbsNum: {
                carNumber: project.carNumber,
                projectNumber: getNewProjectNumber(project.carNumber),
                workPackageNumber: 0
              },
              status: WbsElementStatus.Inactive,
              workPackages: []
            };

            handleAddProject(newProject);

            projects.push(newProject);

            handleEdit();

            createChange({
              id,
              type: 'create-project',
              element: transformProjectPreviewToProject(newProject, team)
            });
          }}
        />
        <Typography variant="h6" fontWeight={400}>
          {team.teamName}
        </Typography>

        {isEditMode ? (
          <Box display={'flex'} alignItems="center">
            <Chip label="Save" onClick={handleSave} sx={{ marginRight: '10px' }} />
            <Chip
              label="Cancel"
              onClick={() => {
                setIsEditMode(false);
                setGanttChanges([]);
              }}
              sx={{ marginRight: '10px' }}
            />
            <Chip label="Create Project" onClick={() => setShowAddProjectModal(true)} />
          </Box>
        ) : (
          <IconButton onClick={handleEdit}>
            <Edit />
          </IconButton>
        )}
      </Box>
      <Box key={team.teamId} sx={{ my: 0, width: 'fit-content', pl: 2 }}>
        <GanttChartSection
          start={startDate}
          end={endDate}
          isEditMode={isEditMode}
          projects={projectsState}
          createChange={createChangeHandler}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={highlightedChange}
          addWorkPackage={handleAddWorkPackage}
          teamName={team.teamName}
          getNewWorkPackageNumber={getNewWorkPackageNumber}
        />
      </Box>
    </Box>
  );
};

export default GanttChartTeamSection;

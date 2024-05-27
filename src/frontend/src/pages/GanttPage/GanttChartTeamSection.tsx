import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import { EventChange, GanttTask, RequestEventChange, applyChangesToEvents, GanttTaskData } from '../../utils/gantt.utils';
import { useState } from 'react';
import AddProjectModal from './AddProjectModal';
import useId from '@mui/material/utils/useId';

interface GanttChartTeamSectionProps {
  startDate: Date;
  endDate: Date;
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  teamName: string;
  projectTasks: GanttTask[];
  highlightedChange?: RequestEventChange;
  getNewProjectNumber: (carNumber: number) => number;
  addProject: (project: GanttTask) => void;
  addWorkPackage: (workPackage: GanttTask) => void;
}

const GanttChartTeamSection = ({
  startDate,
  endDate,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  teamName,
  projectTasks,
  getNewProjectNumber,
  highlightedChange,
  addProject,
  addWorkPackage
}: GanttChartTeamSectionProps) => {
  const theme = useTheme();
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const id = useId() || 'id';

  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };

  const handleSave = () => {
    saveChanges(eventChanges);
    setEventChanges([]);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    projectTasks.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });

    setIsEditMode(true);
  };

  // Sorting the work packages of each project based on their start date
  projectTasks.forEach((task) => {
    task.workPackages.sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  const handleAddWorkPackage = (workPackage: GanttTaskData) => {
    addWorkPackage({ ...workPackage, teamName });
  };

  const displayedProjects = isEditMode ? applyChangesToEvents(projectTasks, eventChanges) : projectTasks;

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
            const newProject: GanttTask = {
              id: id + projectTasks.length + 1,
              name: project.name,
              start: new Date(),
              carNumber: project.carNumber,
              projectNumber: getNewProjectNumber(project.carNumber),
              end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
              workPackages: [],
              teamName,
              type: 'project'
            };

            addProject(newProject);

            projectTasks.push(newProject);

            handleEdit();

            createChange({
              id,
              eventId: newProject.id,
              type: 'create-project'
            });
          }}
        />
        <Typography variant="h6" fontWeight={400}>
          {teamName}
        </Typography>

        {isEditMode ? (
          <Box display={'flex'} alignItems="center">
            <Chip label="Save" onClick={handleSave} sx={{ marginRight: '10px' }} />
            <Chip
              label="Cancel"
              onClick={() => {
                setIsEditMode(false);
                setEventChanges([]);
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
      <Box key={teamName} sx={{ my: 0, width: 'fit-content', pl: 2 }}>
        <GanttChartSection
          start={startDate}
          end={endDate}
          isEditMode={isEditMode}
          projects={displayedProjects}
          createChange={createChange}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={highlightedChange}
          addWorkPackage={handleAddWorkPackage}
        />
      </Box>
    </Box>
  );
};

export default GanttChartTeamSection;

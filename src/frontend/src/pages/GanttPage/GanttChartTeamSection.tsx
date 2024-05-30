import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import { EventChange, RequestEventChange } from '../../utils/gantt.utils';
import { useState } from 'react';
import AddProjectModal from './GanttChartComponents/AddProjectModal';
import useId from '@mui/material/utils/useId';
import { ProjectPreview, WbsElementStatus, WorkPackage } from 'shared';

interface GanttChartTeamSectionProps {
  startDate: Date;
  endDate: Date;
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  teamName: string;
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
  teamName,
  projects,
  getNewProjectNumber,
  highlightedChange,
  addProject,
  addWorkPackage,
  getNewWorkPackageNumber
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
    projects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });

    setIsEditMode(true);
  };

  // Sorting the work packages of each project based on their start date
  projects.forEach((project) => {
    project.workPackages.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  });

  const handleAddWorkPackage = (workPackage: WorkPackage) => {
    addWorkPackage({ ...workPackage });
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

            addProject(newProject);

            projects.push(newProject);

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
          projects={projects}
          createChange={createChange}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={highlightedChange}
          addWorkPackage={handleAddWorkPackage}
          teamName={teamName}
          getNewWorkPackageNumber={getNewWorkPackageNumber}
        />
      </Box>
    </Box>
  );
};

export default GanttChartTeamSection;

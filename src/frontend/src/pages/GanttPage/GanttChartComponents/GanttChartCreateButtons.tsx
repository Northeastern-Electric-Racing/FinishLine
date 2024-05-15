import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { projectWbsPipe } from '../../../utils/pipes';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';
import { validateWBS } from 'shared';
import { GanttTask } from '../../../utils/gantt.utils';

interface GanttChartCreateButtonsProps {
  tasks: GanttTask[];
}

const GanttChartCreateButtons: React.FC<GanttChartCreateButtonsProps> = ({ tasks }) => {
  const history = useHistory();
  const [showPopUp, setShowPopUp] = useState(false);
  const projects = tasks.filter((task) => task.type === 'project');
  console.log('projects', projects);
  const [selectedProjectWBS, setSelectedProjectWBS] = useState<string>('');

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedProjectWBS(event.target.value);
  };

  const buildURLForCreateWorkPackage = () => {
    return `${routes.WORK_PACKAGE_NEW}?wbs=${projectWbsPipe(validateWBS(selectedProjectWBS))}&crId=null`;
  };

  return (
    <Box sx={{ mt: '1em', position: 'fixed', right: '2%' }}>
      <NERButton variant="contained" onClick={() => history.push(routes.PROJECTS_NEW)}>
        Create Project
      </NERButton>
      <NERButton variant="contained" onClick={() => setShowPopUp(true)} sx={{ mx: 1 }}>
        Create Work Package
      </NERButton>
      <NERModal
        open={showPopUp}
        title={'Create Work Package'}
        onHide={() => setShowPopUp(false)}
        onSubmit={() => history.push(buildURLForCreateWorkPackage())}
        submitText="Continue"
      >
        <Typography sx={{ fontSize: '1em', marginBottom: '1.5em' }}>
          Choose a Project you want to create a Work Package for
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Project Name</InputLabel>
          <Select value={selectedProjectWBS} label="Project Name" onChange={handleChange}>
            {projects.map((project) => (
              <MenuItem value={project.id}>{project.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </NERModal>
    </Box>
  );
};

export default GanttChartCreateButtons;

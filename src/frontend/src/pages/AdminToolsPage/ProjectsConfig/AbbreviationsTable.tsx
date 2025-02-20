import { Box, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import CreateCarModal from './CreateCarFormModal';
import { useAllProjects } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

const AbbreviationsTable: React.FC = () => {
  const { data: projects, isLoading: projectsIsLoading, isError: projectsIsError, error: projectsError } = useAllProjects();
  const [openModal, setCreateModalShow] = useState(false);

  if (!projects || projectsIsLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Box>
      <Typography variant="subtitle1">Project Name Abbreviations</Typography>
      <AdminToolTable columns={[{ name: 'Project Name' }, { name: 'Abbreviation' }, { name: ' ' }]} rows={[]} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setCreateModalShow(true)}>
          New Abbreviation
        </NERButton>
      </Box>
    </Box>
  );
};

export default AbbreviationsTable;

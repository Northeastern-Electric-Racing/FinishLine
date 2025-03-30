import { Box, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { useAllProjects } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const AbbreviationsTable: React.FC = () => {
  const { data: projects, isLoading: projectsIsLoading, isError: projectsIsError, error: projectsError } = useAllProjects();

  if (!projects || projectsIsLoading) {
    return <LoadingIndicator />;
  }
  if (projectsIsError) {
    return <ErrorPage message={projectsError?.message} />;
  }

  return (
    <Box>
      <Typography variant="subtitle1">Project Name Abbreviations</Typography>
      <AdminToolTable columns={[{ name: 'Project Name' }, { name: 'Abbreviation' }]} rows={[]} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => {}}>
          New Abbreviation
        </NERButton>
      </Box>
    </Box>
  );
};

export default AbbreviationsTable;

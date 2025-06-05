import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { useAllProjects, useDeleteProjectAbbreviation } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import SetAbbreviationModal from './SetAbbreviationModal';
import { useState } from 'react';
import { ProjectPreview, wbsPipe } from 'shared';
import { Delete } from '@mui/icons-material';
import NERModal from '../../../components/NERModal';

const AbbreviationsTable: React.FC = () => {
  const { data: projects, isLoading: projectsIsLoading, isError: projectsIsError, error: projectsError } = useAllProjects();
  const { mutateAsync } = useDeleteProjectAbbreviation();
  const [openModal, setOpenModal] = useState(false);
  const [abbreviationToDelete, setAbbreviationToDelete] = useState<ProjectPreview>();

  if (!projects || projectsIsLoading) {
    return <LoadingIndicator />;
  }
  if (projectsIsError) {
    return <ErrorPage message={projectsError?.message} />;
  }

  const projectTableRows = projects
    .filter((project) => !!project.abbreviation)
    .map((project) => (
      <TableRow>
        <TableCell align="left" sx={{ border: '2px solid black' }}>
          {`${wbsPipe(project.wbsNum)} - ${project.name}`}
        </TableCell>
        <TableCell sx={{ border: '2px solid black' }}>{project.abbreviation}</TableCell>
        <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              setAbbreviationToDelete(project);
            }}
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    ));

  return (
    <Box>
      <SetAbbreviationModal
        open={openModal}
        handleClose={() => {
          setOpenModal(false);
        }}
      />
      <Typography variant="h6">Project Name Abbreviations</Typography>
      <AdminToolTable columns={[{ name: 'Project Name' }, { name: 'Abbreviation' }, { name: '' }]} rows={projectTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          Set Abbreviation
        </NERButton>
      </Box>
      <NERModal
        open={!!abbreviationToDelete}
        title="Warning!"
        onHide={() => setAbbreviationToDelete(undefined)}
        submitText="Delete"
        onSubmit={() => {
          mutateAsync(wbsPipe(abbreviationToDelete!.wbsNum));
          setAbbreviationToDelete(undefined);
        }}
      >
        <Typography gutterBottom>Are you sure you want to delete this project's abbreviaiton?</Typography>
      </NERModal>
    </Box>
  );
};

export default AbbreviationsTable;

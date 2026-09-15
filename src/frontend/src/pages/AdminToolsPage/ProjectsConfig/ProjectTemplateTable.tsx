import { useHistory } from 'react-router-dom';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { isAdmin, ProjectTemplate } from 'shared';
import { NERButton } from '../../../components/NERButton';
import NERModal from '../../../components/NERModal';
import { routes } from '../../../utils/routes';
import NERTable from '../../../components/NERTable';
import { useState } from 'react';
import { Delete } from '@mui/icons-material';
import { useAllProjectTemplates, useDeleteProjectTemplate } from '../../../hooks/wbs-templates.hooks';

const ProjectTemplateTable: React.FC = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();
  const { data, isLoading, isError, error } = useAllProjectTemplates();
  const [templateToDelete, setTemplateToDelete] = useState<ProjectTemplate>();
  const { mutateAsync } = useDeleteProjectTemplate();

  if (isLoading || !data) {
    return <LoadingIndicator />;
  }

  if (isError) {
    <ErrorPage message={error?.message} />;
  }

  let projectTemplates = data;

  // for God knows what reason, the API returns an object instead of an array when there's only one project template
  // under certain circumstances
  if (!Array.isArray(data)) {
    projectTemplates = [data];
  }

  const projectTemplateRows = projectTemplates.map((template, index) => (
    <TableRow
      key={template.projectTemplateId}
      onClick={() => history.push(`${routes.PROJECT_TEMPLATE_EDIT}?id=${template.projectTemplateId}`)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell sx={{ borderBottom: index === projectTemplates.length - 1 ? 'none' : 'default' }}>
        {template.templateName}
      </TableCell>
      <TableCell sx={{ borderBottom: index === projectTemplates.length - 1 ? 'none' : 'default' }}>
        {template.templateNotes}
      </TableCell>
      <TableCell sx={{ borderBottom: index === projectTemplates.length - 1 ? 'none' : 'default' }}>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            setTemplateToDelete(template);
          }}
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <NERTable columns={[{ name: 'Name' }, { name: 'Description' }, { name: '' }]} rows={projectTemplateRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        {isAdmin(currentUser.role) && (
          <NERButton variant="contained" size="small" onClick={() => history.push(routes.PROJECT_TEMPLATE_NEW)}>
            New Project Template
          </NERButton>
        )}
      </Box>
      <NERModal
        open={!!templateToDelete}
        title="Warning!"
        onHide={() => setTemplateToDelete(undefined)}
        submitText="Delete"
        onSubmit={() => {
          mutateAsync(templateToDelete!.projectTemplateId);
          setTemplateToDelete(undefined);
        }}
      >
        <Typography gutterBottom>
          Are you sure you want to delete the project template <i>{templateToDelete?.templateName}</i>?
        </Typography>
        <Typography gutterBottom>This will also delete all the work package templates within it.</Typography>
        <Typography fontWeight="bold">This action cannot be undone!</Typography>
      </NERModal>
    </Box>
  );
};

export default ProjectTemplateTable;

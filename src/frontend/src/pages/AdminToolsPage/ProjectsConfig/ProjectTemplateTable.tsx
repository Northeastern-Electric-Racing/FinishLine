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
import AdminToolTable from '../AdminToolTable';
import { useState } from 'react';
import { Delete } from '@mui/icons-material';
import { useAllProjectTemplates, useDeleteProjectTemplate } from '../../../hooks/wbs-templates.hooks';

const ProjectTemplateTable: React.FC = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();
  const { data: projectTemplates, isLoading, isError, error } = useAllProjectTemplates();
  const [templateToDelete, setTemplateToDelete] = useState<ProjectTemplate>();
  const { mutateAsync } = useDeleteProjectTemplate();

  if (isLoading || !projectTemplates) {
    return <LoadingIndicator />;
  }

  if (isError) {
    <ErrorPage message={error?.message} />;
  }

  const projectTemplateRows = projectTemplates.map((template) => (
    <TableRow
      key={template.projectTemplateId}
      onClick={() => history.push(`${routes.WORK_PACKAGE_TEMPLATE_EDIT}?id=${template.projectTemplateId}`)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {template.templateName}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>{template.templateNotes}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
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
      <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }]} rows={projectTemplateRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        {isAdmin(currentUser.role) && (
          <NERButton variant="contained" size="small" onClick={() => history.push(routes.WORK_PACKAGE_TEMPLATE_NEW)}>
            New Work Package Template
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
          Are you sure you want to delete the work package template <i>{templateToDelete?.templateName}</i>?
        </Typography>
        <Typography gutterBottom>
          This will also delete all templates blocked by this one. If you would like to delete this template only, first
          remove all references to it from all other templates' "Blocked By" sections.
        </Typography>
        <Typography fontWeight="bold">This action cannot be undone!</Typography>
      </NERModal>
    </Box>
  );
};

export default ProjectTemplateTable;

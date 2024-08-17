import { TableRow, TableCell, Box, IconButton, Typography, Tooltip, Grid } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { isAdmin } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { WorkPackageTemplate } from 'shared';
import { routes } from '../../../utils/routes';
import { Delete, Folder } from '@mui/icons-material';
import { useAllWorkPackageTemplates, useDeleteWorkPackageTemplate } from '../../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';
import { groupProjectLevelTemplates } from '../../../utils/work-package.utils';

const WorkPackageTemplateTable = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();

  const {
    data: allWorkPackageTemplates,
    isLoading: workPackageTemplatesIsLoading,
    isError: workPackageTemplatesIsError,
    error: workPackageTemplatesError
  } = useAllWorkPackageTemplates();

  const [templateToDelete, setTemplateToDelete] = useState<WorkPackageTemplate>();

  const { mutateAsync } = useDeleteWorkPackageTemplate();

  if (!allWorkPackageTemplates || workPackageTemplatesIsLoading) return <LoadingIndicator />;
  if (workPackageTemplatesIsError) return <ErrorPage message={workPackageTemplatesError.message} />;

  const individualTemplates = groupProjectLevelTemplates(allWorkPackageTemplates);

  const workPackageTemplateRows = individualTemplates.map((workPackageTemplate) => (
    <TableRow
      key={workPackageTemplate.templateName} // REVISIT
      onClick={() => {
        if ('workPackageTemplateId' in workPackageTemplate)
          history.push(`${routes.WORK_PACKAGE_TEMPLATE_EDIT}?id=${workPackageTemplate.workPackageTemplateId}`);
        else history.push(`${routes.PROJECT_LEVEL_TEMPLATE_EDIT}?templateName=${workPackageTemplate.templateName}`);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        <Grid container gap={1}>
          <Grid item>
            <Typography>{workPackageTemplate.templateName}</Typography>
          </Grid>
          <Grid item>
            {'smallTemplates' in workPackageTemplate && (
              <Tooltip title="Project-Level Template">
                <Folder />
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>{workPackageTemplate.templateNotes}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            //setTemplateToDelete(workPackageTemplate); REVISIT
          }}
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }]} rows={workPackageTemplateRows} />

      {isAdmin(currentUser.role) && (
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }} gap={1}>
          <Tooltip title="A template used to create a single work package" placement="top" arrow>
            <NERButton variant="contained" size="small" onClick={() => history.push(routes.WORK_PACKAGE_TEMPLATE_NEW)}>
              New Work Package Template
            </NERButton>
          </Tooltip>
          <Tooltip
            title="A template used to create multiple work packages at once, including blockers"
            placement="top"
            arrow
          >
            <NERButton variant="contained" size="small" onClick={() => history.push(routes.PROJECT_LEVEL_TEMPLATE_NEW)}>
              New Project-Level Template
            </NERButton>
          </Tooltip>
        </Box>
      )}
      <NERModal
        open={!!templateToDelete}
        title="Warning!"
        onHide={() => setTemplateToDelete(undefined)}
        submitText="Delete"
        onSubmit={() => {
          mutateAsync(templateToDelete!.workPackageTemplateId);
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

export default WorkPackageTemplateTable;

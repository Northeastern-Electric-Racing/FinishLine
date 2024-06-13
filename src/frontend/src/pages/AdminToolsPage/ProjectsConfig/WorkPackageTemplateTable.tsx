import { TableRow, TableCell, Box, IconButton, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { isAdmin } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { WorkPackageTemplate } from 'shared';
import { routes } from '../../../utils/routes';
import { Delete } from '@mui/icons-material';
import { useAllWorkPackageTemplates, useDeleteWorkPackageTemplate } from '../../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';

const WorkPackageTemplateTable = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();

  const {
    data: workPackageTemplates,
    isLoading: workPackageTemplatesIsLoading,
    isError: workPackageTemplatesIsError,
    error: workPackageTemplatesError
  } = useAllWorkPackageTemplates();

  const [templateToDelete, setTemplateToDelete] = useState<WorkPackageTemplate>();

  const { mutateAsync } = useDeleteWorkPackageTemplate();

  if (!workPackageTemplates || workPackageTemplatesIsLoading) return <LoadingIndicator />;
  if (workPackageTemplatesIsError) return <ErrorPage message={workPackageTemplatesError.message} />;

  const workPackageTemplateRows = workPackageTemplates.map((workPackageTemplateId) => (
    <TableRow
      key={workPackageTemplateId.workPackageTemplateId}
      onClick={() =>
        history.push(
          `${routes.WORK_PACKAGE_TEMPLATE_EDIT}?workPackageTemplateId=${workPackageTemplateId.workPackageTemplateId}`
        )
      }
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {workPackageTemplateId.templateName}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        {workPackageTemplateId.templateNotes}
      </TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            setTemplateToDelete(workPackageTemplateId);
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

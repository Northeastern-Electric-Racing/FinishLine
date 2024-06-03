import { TableRow, TableCell, Box, IconButton, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { isAdmin } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAllWorkPackageTemplates, useDeleteWorkPackageTemplate } from '../../../hooks/work-packages.hooks';
import { Delete } from '@mui/icons-material';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';
import { WorkPackageTemplate } from 'shared';

const WorkPackageTemplateTable = () => {
  const currentUser = useCurrentUser();
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

  const workPackageTemplateRows = workPackageTemplates.map((workPackageTemplate) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {workPackageTemplate.templateName}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>{workPackageTemplate.templateNotes}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <IconButton onClick={() => setTemplateToDelete(workPackageTemplate)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <Box>
        <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }, { name: '' }]} rows={workPackageTemplateRows} />
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
          {isAdmin(currentUser.role) && <NERButton variant="contained">New Work Package Template</NERButton>}
        </Box>
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
        <Typography>
          Are you sure you want to delete the work package template <i>{templateToDelete?.templateName}</i>?
        </Typography>
        <Typography>This will also delete all templates blocked by this one.</Typography>
        <Typography fontWeight="bold">This action cannot be undone!</Typography>
      </NERModal>
    </>
  );
};

export default WorkPackageTemplateTable;

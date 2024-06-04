import { TableRow, TableCell, Box, MenuItem, ListItemIcon } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { isAdmin, isGuest } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAllWorkPackageTemplates } from '../../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { projectWbsPipe } from '../../../utils/pipes';
import { useState } from 'react';
import { WorkPackageTemplate } from 'shared';

const WorkPackageTemplateTable = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();

  const [clickedWorkPackageTemplate, setClickedWorkPackageTemplate] = useState<WorkPackageTemplate>();
  
  const {
    data: workPackageTemplates,
    isLoading: workPackageTemplatesIsLoading,
    isError: workPackageTemplatesIsError,
    error: workPackageTemplatesError
  } = useAllWorkPackageTemplates();

  if (!workPackageTemplates || workPackageTemplatesIsLoading) return <LoadingIndicator />;
  if (workPackageTemplatesIsError) return <ErrorPage message={workPackageTemplatesError.message} />;

  const workPackageTemplateRows = workPackageTemplates.map((workPackageTemplateId) => (
    <TableRow onClick={() => history.push(`${routes.WORK_PACKAGE_TEMPLATE_EDIT}?id=${workPackageTemplateId}`)}
    sx={{ cursor: 'pointer' }}>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {workPackageTemplateId.templateName}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        {workPackageTemplateId.templateNotes}
      </TableCell>
    </TableRow>
  ));

  /*
  const buildURLForCreateWorkPackageTemplate = () => {
    return `${routes.WORK_PACKAGE_TEMPLATE_NEW}?wbs=${projectWbsPipe(project.wbsNum)}&crId=null`;
  };
  */

  return (
    <Box>
      <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }]} rows={workPackageTemplateRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        {isAdmin(currentUser.role) && (
          <NERButton
            variant="contained"
            size="small"
            onClick={() => history.push(routes.WORK_PACKAGE_TEMPLATE_NEW)}
          >
            New Work Package Template
          </NERButton>
        )}
      </Box>
    </Box>
  );
};

export default WorkPackageTemplateTable;

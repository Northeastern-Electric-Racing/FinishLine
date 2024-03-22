import { TableRow, TableCell, Box } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { isAdmin } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../hooks/users.hooks';

const WorkPackageTemplateTable = () => {
  const currentUser = useCurrentUser();
  const workPackageTemplate1 = {
    workPackageTemplateId: 'id',
    templateName: 'Template 1',
    templateNotes: 'This is template #1',
    workPackageName: 'WPName'
  };
  const workPackageTemplate2 = {
    workPackageTemplateId: 'id',
    templateName: 'Template 2',
    templateNotes: 'This is template #2',
    workPackageName: 'WPName'
  };
  const workPackageTemplate3 = {
    workPackageTemplateId: 'id',
    templateName: 'Template 3',
    templateNotes: 'This is template #3',
    workPackageName: 'WPName'
  };
  const workPackageTemplates = [workPackageTemplate1, workPackageTemplate2, workPackageTemplate3];

  const workPackageTemplateRows = workPackageTemplates.map((workPackageTemplateId) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {workPackageTemplateId.templateName}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        {workPackageTemplateId.templateNotes}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }]} rows={workPackageTemplateRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        {isAdmin(currentUser.role) && <NERButton variant="contained">New Work Package Template</NERButton>}
      </Box>
    </Box>
  );
};

export default WorkPackageTemplateTable;

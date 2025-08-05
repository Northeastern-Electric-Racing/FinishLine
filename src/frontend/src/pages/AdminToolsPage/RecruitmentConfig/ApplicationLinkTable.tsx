import { TableCell, TableRow, Box, Typography, Table as MuiTable, TableHead, TableBody, Link, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditIcon from '@mui/icons-material/Edit';
import ErrorPage from '../../ErrorPage';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import UpdateApplicationLinkModal from './UpdateApplicationLinkModal';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';

const ApplicationLinkTable: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (!organization || organizationIsLoading) {
    return <LoadingIndicator />;
  }
  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }
  const url = organization.applicationLink;

  const applicationLinkRows = [
    <TableRow>
      <TableCell sx={{ borderBottom: 'none' }}>
        <Typography>Application Link</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '500px' }}>
          <Typography marginTop={'4px'}>
            <Link
              href={url}
              target="_blank"
              sx={{
                color: 'white',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {url}
            </Link>
          </Typography>
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setShowModal(true)}>
            <EditIcon />
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Links Config
      </Typography>
      <AdminToolTable columns={[{ name: 'Link Name' }, { name: 'URL' }]} rows={applicationLinkRows} />
      <UpdateApplicationLinkModal open={showModal} onHide={() => setShowModal(false)} currentApplicationLink={url} />
    </Box>
  );
};

export default ApplicationLinkTable;

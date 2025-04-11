import { TableCell, TableRow, Box, Typography, Table as MuiTable, TableHead, TableBody, Link, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditIcon from '@mui/icons-material/Edit';
import ErrorPage from '../../ErrorPage';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import UpdateApplicationLinkModal from './UpdateApplicationLinkModal';
import { useState } from 'react';

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

  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Links Config
      </Typography>
      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0 0 0',
                width: '30%'
              }}
            >
              Link Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0 10px 0 0',
                width: '70%'
              }}
            >
              URL
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              sx={{
                minHeight: '50px',
                alignItems: 'center',
                borderBottom: 'none',
                borderRight: '1px solid'
              }}
            >
              <Typography>Application Link</Typography>
            </TableCell>
            <TableCell
              sx={{
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: 'none'
              }}
            >
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
        </TableBody>
      </MuiTable>
      <UpdateApplicationLinkModal open={showModal} onHide={() => setShowModal(false)} currentApplicationLink={url} />
    </Box>
  );
};

export default ApplicationLinkTable;

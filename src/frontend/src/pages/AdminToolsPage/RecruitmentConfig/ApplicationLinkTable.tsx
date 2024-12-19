import { TableCell, TableRow, Box, Typography, Table as MuiTable, TableHead, TableBody } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
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
                borderRadius: '10px 10px 0px 0px'
              }}
            >
              Application Link
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              sx={{
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: 'none'
              }}
            >
              <Typography
                sx={{
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => setShowModal(true)}
              >
                {organization.applicationLink}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </MuiTable>
      <UpdateApplicationLinkModal
        open={showModal}
        onHide={() => setShowModal(false)}
        currentApplicationLink={organization.applicationLink}
      />
    </Box>
  );
};

export default ApplicationLinkTable;

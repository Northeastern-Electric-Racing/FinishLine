import { TableCell, TableRow, Box, Typography } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import AdminToolTable from '../AdminToolTable';
import React from 'react';

const ApplicationLinkTable: React.FC = () => {
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

  const applicationLinks = [organization.applicationLink];
  const applicationLinkTableRows = applicationLinks.map((applicationLink) => {
    return (
      <TableRow>
        <TableCell align="left" sx={{ border: '2px solid black' }}>
          {applicationLink}
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Links Config
      </Typography>
      <AdminToolTable columns={[{ name: 'Links' }]} rows={applicationLinkTableRows} />
    </Box>
  );
};

export default ApplicationLinkTable;

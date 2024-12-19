import { TableCell, TableRow, Box, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import AdminToolTable from '../AdminToolTable';
import React, { useState } from 'react';
import EditLinkModal from './EditLinkModal';

const ApplicationLinkTable: React.FC = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };

  if (!organization || organizationIsLoading) {
    return <LoadingIndicator />;
  }
  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  const applicationLinks = [organization.applicationLink];
  const applicationLinkTableRows = applicationLinks.map((applicationLink) => (
    <TableRow key={applicationLink}>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography>{applicationLink}</Typography>
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setShowModal(true)}>
            <EditIcon />
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Links Config
      </Typography>
      <EditLinkModal open={showModal} onHide={handleClose} currentApplicationLink={organization.applicationLink} />
      <AdminToolTable columns={[{ name: 'Links' }]} rows={applicationLinkTableRows} />
    </Box>
  );
};

export default ApplicationLinkTable;

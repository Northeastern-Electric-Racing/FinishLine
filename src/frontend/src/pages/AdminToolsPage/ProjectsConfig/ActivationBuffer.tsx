import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import EditActivationBufferModal from './EditActivationBufferModal';

const ActivationBuffer: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !organization) return <LoadingIndicator />;

  return (
    <Box>
      <EditActivationBufferModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        activationBufferDays={organization.activationBufferDays}
      />
      <Box display="flex" alignItems="center" gap={1}>
        <Typography>Activation Buffer: {organization.activationBufferDays} days</Typography>
        <IconButton onClick={() => setShowModal(true)}>
          <EditIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ActivationBuffer;

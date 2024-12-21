/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Box, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentOrganization, useSetWorkspaceId } from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Organization } from 'shared';
import HelpIcon from '@mui/icons-material/Help';

interface AdminToolsWorkspaceIdViewProps {
  organization: Organization;
}

const AdminToolsWorkspaceId: React.FC = () => {
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return <AdminToolsWorkspaceIdView organization={organization} />;
};

const AdminToolsWorkspaceIdView: React.FC<AdminToolsWorkspaceIdViewProps> = ({ organization }) => {
  const toast = useToast();
  const { mutateAsync, isLoading } = useSetWorkspaceId();
  const [workspaceId, setWorkspaceId] = useState(organization.slackWorkspaceId ?? '');

  const slackWorkspaceId = async () => {
    try {
      await mutateAsync(workspaceId);
      toast.success('Successfully updated the slack workspace id');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom color={'#ef4345'} borderBottom={1} borderColor={'white'}>
        {organization.name} Slack Workspace Id
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center'
        }}
      >
        <Link color={'#ffffff'} href={'https://slack.com/help/articles/221769328-Locate-your-Slack-URL-or-ID'}>
          <HelpIcon sx={{ mr: 2, height: 50 }} />
        </Link>
        <TextField value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} />
        <Box>
          <NERButton variant="contained" disabled={isLoading} onClick={slackWorkspaceId}>
            Update
          </NERButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminToolsWorkspaceId;

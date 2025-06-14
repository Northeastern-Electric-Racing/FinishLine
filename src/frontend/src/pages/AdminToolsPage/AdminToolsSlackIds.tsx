/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Box, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useToast } from '../../hooks/toasts.hooks';
import {
  useCurrentOrganization,
  useSetSlackSponsorshipNotificationChannelId,
  useSetWorkspaceId
} from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Organization } from 'shared';
import HelpIcon from '@mui/icons-material/Help';

interface AdminToolsWorkspaceIdViewProps {
  organization: Organization;
}

const AdminToolsSlackIds: React.FC = () => {
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();
  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return <AdminToolsSlackIdsView organization={organization} />;
};

const AdminToolsSlackIdsView: React.FC<AdminToolsWorkspaceIdViewProps> = ({ organization }) => {
  const toast = useToast();
  const { mutateAsync: setWorkspaceIdMutateAsync, isLoading } = useSetWorkspaceId();
  const { mutateAsync: setSponsorshipChannelIdMutateAsync } = useSetSlackSponsorshipNotificationChannelId();
  const [workspaceId, setWorkspaceId] = useState(organization.slackWorkspaceId ?? '');
  const [sponsorshipChannelId, setSponsorshipChannelId] = useState(
    organization.sponsorshipNotificationsSlackChannelId ?? ''
  );

  if (isLoading) return <LoadingIndicator />;

  const handleSubmitWorkspaceId = async () => {
    try {
      await setWorkspaceIdMutateAsync(workspaceId);
      toast.success('Successfully updated the slack workspace id');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleSubmitSponsorshipChannelId = async () => {
    try {
      await setSponsorshipChannelIdMutateAsync(sponsorshipChannelId);
      toast.success('Successfully updated the sponsorship notification channel ID.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom color={'#ef4345'} borderBottom={1} borderColor={'white'}>
        {organization.name} Slack Workspace & Channel Ids
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 30
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link
            color={'#ffffff'}
            href={'https://slack.com/help/articles/221769328-Locate-your-Slack-URL-or-ID'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpIcon sx={{ mr: 2, height: 50 }} />
          </Link>
          <TextField
            label="Workspace ID"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            sx={{ mr: 2 }}
          />
          <NERButton variant="contained" disabled={isLoading} onClick={handleSubmitWorkspaceId}>
            Update
          </NERButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link
            color={'#ffffff'}
            href={'https://help.socialintents.com/article/148-how-to-find-your-slack-team-id-and-slack-channel-id'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpIcon sx={{ mr: 2, height: 50 }} />
          </Link>
          <TextField
            label="Sponsorship Channel ID"
            value={sponsorshipChannelId}
            onChange={(e) => setSponsorshipChannelId(e.target.value)}
            sx={{ mr: 2 }}
          />
          <NERButton variant="contained" disabled={isLoading} onClick={handleSubmitSponsorshipChannelId}>
            Update
          </NERButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminToolsSlackIds;

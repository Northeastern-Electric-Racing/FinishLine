/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Box, Grid, IconButton, Link, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useToast } from '../../hooks/toasts.hooks';
import {
  useCreateNotificationChannel,
  useCurrentOrganization,
  useDeleteNotificationChannel,
  useNotificationChannels,
  useSetSlackSponsorshipNotificationChannelId,
  useSetWorkspaceId
} from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Organization, TeamBase } from 'shared';
import HelpIcon from '@mui/icons-material/Help';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAllTeamPreviews } from '../../hooks/teams.hooks';
import NERTable from '../../components/NERTable';
import EditTeamSlackIdFormModal from './TeamConfig/EditTeamSlackIdFormModal';

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
  const {
    data: allTeams,
    isLoading: allTeamsIsLoading,
    isError: allTeamsIsError,
    error: allTeamsError
  } = useAllTeamPreviews();
  const [clickedTeam, setClickedTeam] = useState<TeamBase>();

  const {
    data: notificationChannels,
    isLoading: notificationChannelsIsLoading,
    isError: notificationChannelsIsError,
    error: notificationChannelsError
  } = useNotificationChannels();
  const { mutateAsync: createNotificationChannelMutateAsync, isLoading: isCreatingNotificationChannel } =
    useCreateNotificationChannel();
  const { mutateAsync: deleteNotificationChannelMutateAsync } = useDeleteNotificationChannel();
  const [newNotificationChannelId, setNewNotificationChannelId] = useState('');

  if (!allTeams || allTeamsIsLoading) return <LoadingIndicator />;

  if (allTeamsIsError) {
    return <ErrorPage message={allTeamsError.message} />;
  }

  if (!notificationChannels || notificationChannelsIsLoading) return <LoadingIndicator />;

  if (notificationChannelsIsError) {
    return <ErrorPage message={notificationChannelsError.message} />;
  }

  if (isLoading) return <LoadingIndicator />;

  const teamTableRows = allTeams.map((team, index) => (
    <TableRow
      onClick={() => {
        setClickedTeam(team);
      }}
      sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
    >
      <TableCell sx={{ borderBottom: index === allTeams.length - 1 ? 'none' : 'default' }}>{team.teamName}</TableCell>
      <TableCell sx={{ borderBottom: index === allTeams.length - 1 ? 'none' : 'default' }}>{team.slackId}</TableCell>
    </TableRow>
  ));

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

  const handleAddNotificationChannelId = async () => {
    const trimmedId = newNotificationChannelId.trim();
    if (!trimmedId) return;
    try {
      await createNotificationChannelMutateAsync(trimmedId);
      setNewNotificationChannelId('');
      toast.success('Successfully added the notification channel.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleRemoveNotificationChannelId = async (slackChannelId: string) => {
    try {
      await deleteNotificationChannelMutateAsync(slackChannelId);
      toast.success('Successfully removed the notification channel.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
      <Box>
        <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
          Team Slack IDs
        </Typography>
        <Grid container columnSpacing={2}>
          <Grid item xs={12} md={6} sx={{ marginTop: '24px' }}>
            <NERTable columns={[{ name: 'Team Name' }, { name: 'Slack Channel ID' }]} rows={teamTableRows} />
          </Grid>
        </Grid>
        {clickedTeam && (
          <EditTeamSlackIdFormModal
            open={!!clickedTeam}
            handleClose={() => {
              setClickedTeam(undefined);
            }}
            team={clickedTeam}
          />
        )}
      </Box>
      <Box>
        <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
          Notification Channels
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Slack channels that events can notify in addition to team channels.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 500 }}>
          {notificationChannels.map((channel) => (
            <Box key={channel.slackChannelId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ flex: 1 }}>
                {channel.name ? `${channel.name} (${channel.slackChannelId})` : channel.slackChannelId}
              </Typography>
              <IconButton
                size="small"
                color="error"
                aria-label="remove notification channel"
                onClick={() => handleRemoveNotificationChannelId(channel.slackChannelId)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link
              color={'#ffffff'}
              href={'https://help.socialintents.com/article/148-how-to-find-your-slack-team-id-and-slack-channel-id'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HelpIcon sx={{ height: 30 }} />
            </Link>
            <TextField
              size="small"
              label="Slack Channel ID"
              value={newNotificationChannelId}
              onChange={(e) => setNewNotificationChannelId(e.target.value)}
              sx={{ flex: 1 }}
            />
            <NERButton variant="contained" disabled={isCreatingNotificationChannel} onClick={handleAddNotificationChannelId}>
              Add
            </NERButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminToolsSlackIds;

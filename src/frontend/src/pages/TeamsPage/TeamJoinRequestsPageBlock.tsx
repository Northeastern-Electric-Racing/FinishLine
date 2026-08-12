/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { isAdmin, Team } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import NERModal from '../../components/NERModal';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import { usePendingTeamJoinRequests, useReviewTeamJoinRequest } from '../../hooks/teams.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { fullNamePipe } from '../../utils/pipes';

interface TeamJoinRequestsPageBlockProps {
  team: Team;
}

const TeamJoinRequestsPageBlock: React.FC<TeamJoinRequestsPageBlockProps> = ({ team }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const [denyingRequestId, setDenyingRequestId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState('');

  const {
    data: joinRequests,
    isLoading: joinRequestsIsLoading,
    isError: joinRequestsIsError,
    error: joinRequestsError
  } = usePendingTeamJoinRequests(team.teamId);
  const { mutateAsync: reviewRequest, isLoading: reviewIsLoading } = useReviewTeamJoinRequest();

  // only admins and the team head can review join requests -- team leads cannot
  const canReviewJoinRequests = isAdmin(user.role) || user.userId === team.head.userId;

  if (!canReviewJoinRequests) return null;

  if (joinRequestsIsError) return <ErrorPage message={joinRequestsError?.message} />;
  if (joinRequestsIsLoading || !joinRequests) return <LoadingIndicator />;

  const handleApprove = async (teamJoinRequestId: string) => {
    try {
      await reviewRequest({ teamJoinRequestId, approved: true });
      toast.success('Join request approved');
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleOpenDeny = (teamJoinRequestId: string) => {
    setDenialReason('');
    setDenyingRequestId(teamJoinRequestId);
  };

  const handleDeny = async () => {
    if (!denyingRequestId) return;
    try {
      await reviewRequest({ teamJoinRequestId: denyingRequestId, approved: false, denialReason: denialReason || undefined });
      toast.success('Join request denied');
      setDenyingRequestId(null);
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  return (
    <PageBlock title="Pending Join Requests">
      {joinRequests.length === 0 ? (
        <Typography color="text.secondary">No pending join requests</Typography>
      ) : (
        <Grid container spacing={2}>
          {joinRequests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.teamJoinRequestId}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '10px',
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Typography fontWeight="bold">{fullNamePipe(request.user)}</Typography>
                <Box display="flex" gap={1}>
                  <NERButton
                    variant="contained"
                    size="small"
                    disabled={reviewIsLoading}
                    onClick={() => handleApprove(request.teamJoinRequestId)}
                  >
                    Approve
                  </NERButton>
                  <NERButton
                    variant="outlined"
                    size="small"
                    disabled={reviewIsLoading}
                    onClick={() => handleOpenDeny(request.teamJoinRequestId)}
                  >
                    Deny
                  </NERButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      <NERModal
        open={!!denyingRequestId}
        onHide={() => setDenyingRequestId(null)}
        title="Deny Join Request"
        submitText="Deny"
        onSubmit={handleDeny}
        cancelText="Cancel"
      >
        <Typography sx={{ mb: 2 }}>You may optionally provide a reason the requesting member will see.</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Reason (optional)"
          value={denialReason}
          onChange={(e) => setDenialReason(e.target.value)}
        />
      </NERModal>
    </PageBlock>
  );
};

export default TeamJoinRequestsPageBlock;

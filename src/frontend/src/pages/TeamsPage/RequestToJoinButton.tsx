/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Chip, Typography } from '@mui/material';
import { isGuest, TeamPreview } from 'shared';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useCreateTeamJoinRequest, useMyTeamJoinRequests } from '../../hooks/teams.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';

interface RequestToJoinButtonProps {
  team: TeamPreview;
}

const RequestToJoinButton: React.FC<RequestToJoinButtonProps> = ({ team }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const { data: joinRequests, isLoading: joinRequestsIsLoading } = useMyTeamJoinRequests();
  const { mutateAsync, isLoading: createIsLoading } = useCreateTeamJoinRequest(team.teamId);

  const isAlreadyOnTeam =
    user.userId === team.head.userId ||
    team.leads.some((lead) => lead.userId === user.userId) ||
    team.members.some((member) => member.userId === user.userId);

  // guests who haven't finished onboarding yet (PNMs, or currently going through the checklist)
  // aren't "new members" yet and shouldn't be able to request a team -- current members (of any
  // role) and guests who've reached the new member dashboard both can
  const isPreOnboardingGuest = isGuest(user.role) && user.onboardedTeamTypeIds.length === 0;

  if (isAlreadyOnTeam || team.dateArchived || isPreOnboardingGuest) return null;

  if (joinRequestsIsLoading || !joinRequests) return <LoadingIndicator />;

  const latestRequest = joinRequests
    .filter((request) => request.team.teamId === team.teamId)
    .reduce<
      (typeof joinRequests)[number] | undefined
    >((latest, request) => (!latest || request.dateRequested > latest.dateRequested ? request : latest), undefined);

  const handleRequest = async () => {
    try {
      await mutateAsync();
      toast.success(`Request sent to join ${team.teamName}`);
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  if (latestRequest?.status === 'PENDING') {
    return <Chip label="Request Pending" color="warning" />;
  }

  if (latestRequest?.status === 'DENIED') {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <NERButton variant="contained" disabled={createIsLoading} onClick={handleRequest}>
          Request to Join
        </NERButton>
        <Typography variant="caption" color="error">
          Previous request denied{latestRequest.denialReason ? `: ${latestRequest.denialReason}` : ''}
        </Typography>
      </Box>
    );
  }

  return (
    <NERButton variant="contained" disabled={createIsLoading} onClick={handleRequest}>
      Request to Join
    </NERButton>
  );
};

export default RequestToJoinButton;

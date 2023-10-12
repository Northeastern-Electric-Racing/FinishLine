/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSetTeamHead, useSetTeamMembers } from '../../hooks/teams.hooks';
import { isAdmin, isHead, Team, User } from 'shared';
import { fullNamePipe } from '../../utils/pipes';
import { Cancel, Edit, Save } from '@mui/icons-material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import DetailDisplay from '../../components/DetailDisplay';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useToast } from '../../hooks/toasts.hooks';

interface TeamMembersPageBlockProps {
  team: Team;
}

const userToAutocompleteOption = (user: User): { label: string; id: string } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: `${user.userId}` };
};

const TeamMembersPageBlock: React.FC<TeamMembersPageBlockProps> = ({ team }) => {
  const auth = useAuth();
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [isEditingHead, setIsEditingHead] = useState(false);
  const [members, setMembers] = useState(team.members.map(userToAutocompleteOption));
  const [head, setHead] = useState(userToAutocompleteOption(team.head));

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const { isLoading: setTeamMembersIsLoading, mutateAsync: setTeamMembersMutateAsync } = useSetTeamMembers(team.teamId);
  const { isLoading: setTeamHeadIsLoading, mutateAsync: setTeamHeadMutateAsync } = useSetTeamHead(team.teamId);

  const toast = useToast();

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allUsersIsLoading || setTeamMembersIsLoading || setTeamHeadIsLoading || !users) return <LoadingIndicator />;

  const hasPerms = auth.user && (isAdmin(auth.user.role) || auth.user.userId === team.head.userId);

  const memberOptions = users
    .filter((user) => user.userId !== team.head.userId && !team.leads.map((lead) => lead.userId).includes(user.userId))
    .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
    .map(userToAutocompleteOption);

  const headOptions = users
    .filter((user) => memberOptions.some((option) => parseInt(option.id) === user.userId) && isHead(user.role))
    .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
    .map(userToAutocompleteOption);

  const submitHead = async () => {
    try {
      await setTeamHeadMutateAsync(parseInt(head.id));
      setIsEditingHead(false);
    } catch (error) {
      error instanceof Error && toast.error(error.message);
    }
  };

  const submitMembers = async () => {
    try {
      await setTeamMembersMutateAsync(members.map((member) => parseInt(member.id)));
      setIsEditingMembers(false);
    } catch (error) {
      error instanceof Error && toast.error(error.message);
    }
  };

  const EditingHeadView = () => (
    <Grid container spacing={1}>
      <Grid item>
        <Typography sx={{ fontWeight: 'bold' }} display="inline">
          Head:
        </Typography>
      </Grid>
      <Grid item xs={true} mt={-1}>
        <NERAutocomplete
          id="head-autocomplete"
          options={headOptions}
          onChange={(_event, newValue) => newValue && setHead(newValue)}
          filterSelectedOptions
          size="small"
          placeholder="Select a User"
          value={head}
        />
      </Grid>
      <Grid container xs={3} md={2} lg={1}>
        <Grid item>
          <IconButton children={<Save />} onClick={submitHead} />
        </Grid>
        <Grid item>
          <IconButton children={<Cancel />} onClick={() => setIsEditingHead(false)} />
        </Grid>
      </Grid>
    </Grid>
  );

  const EditingMembersView = () => (
    <Box>
      <Typography sx={{ fontWeight: 'bold' }} display="inline">
        Members:
      </Typography>
      <Grid container direction={'row'}>
        <Grid item xs={9} md={10} lg={11}>
          <Autocomplete
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            multiple
            id="tags-standard"
            options={memberOptions}
            value={members}
            onChange={(_event, newValue) => setMembers(newValue)}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select A User" />}
          />
        </Grid>
        <Grid container xs={3} md={2} lg={1}>
          <Grid item>
            <IconButton children={<Save />} onClick={submitMembers} />
          </Grid>
          <Grid item>
            <IconButton children={<Cancel />} onClick={() => setIsEditingMembers(false)} />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  const NonEditingHeadView = () => (
    <Grid container>
      <Grid item>
        <DetailDisplay label="Head" content={fullNamePipe(team.head)} />
      </Grid>
      <Grid item mt={-1}>
        {hasPerms && <IconButton children={<Edit />} onClick={() => setIsEditingHead(true)} />}
      </Grid>
    </Grid>
  );

  const NonEditingLeadsView = () => (
    <DetailDisplay label="Leads" content={team.leads.map((lead) => fullNamePipe(lead)).join(', ')} />
  );

  const NonEditingMembersView = () => (
    <Grid container>
      <Grid item xs={11} lg="auto" style={{ maxWidth: 'fit-content' }}>
        <DetailDisplay label="Members" content={team.members.map((member) => fullNamePipe(member)).join(', ')} />
      </Grid>
      <Grid item xs={1} mt={-1}>
        {hasPerms && <IconButton children={<Edit />} onClick={() => setIsEditingMembers(true)} />}
      </Grid>
    </Grid>
  );

  return (
    <PageBlock title={'People'}>
      {isEditingHead ? <EditingHeadView /> : <NonEditingHeadView />}
      <NonEditingLeadsView />
      {isEditingMembers ? <EditingMembersView /> : <NonEditingMembersView />}
    </PageBlock>
  );
};

export default TeamMembersPageBlock;

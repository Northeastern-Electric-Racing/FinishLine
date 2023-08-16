/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, FormControl, FormLabel, Grid, IconButton, TextField } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSetTeamHead, useSetTeamMembers } from '../../hooks/teams.hooks';
import { isAdmin, isHead, Team, User } from 'shared';
import { fullNamePipe } from '../../utils/pipes';
import { Edit } from '@mui/icons-material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import DetailDisplay from '../../components/DetailDisplay';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';
import NERAutocomplete from '../../components/NERAutocomplete';

interface TeamMembersPageBlockProps {
  team: Team;
}

const userToAutocompleteOption = (user: User): { label: string; id: number } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
};

const TeamMembersPageBlock: React.FC<TeamMembersPageBlockProps> = ({ team }) => {
  const auth = useAuth();
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [members, setMembers] = useState(team.members.map(userToAutocompleteOption));
  const [head, setHead] = useState({
    id: `${userToAutocompleteOption(team.head).id}`,
    label: userToAutocompleteOption(team.head).label
  });

  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const {
    isLoading: setTeamMembersIsLoading,
    isError: setTeamMembersIsError,
    error: setTeamMembersError,
    mutateAsync: setTeamMembersMutateAsync
  } = useSetTeamMembers(team.teamId);
  const {
    isLoading: setTeamHeadIsLoading,
    isError: setTeamHeadIsError,
    error: setTeamHeadError,
    mutateAsync: setTeamHeadMutateAsync
  } = useSetTeamHead(team.teamId);

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (setTeamMembersIsError) return <ErrorPage message={setTeamMembersError?.message} />;
  if (setTeamHeadIsError) return <ErrorPage message={setTeamHeadError?.message} />;
  if (allUsersIsLoading || setTeamMembersIsLoading || setTeamHeadIsLoading || !users) return <LoadingIndicator />;

  const handleSubmit = async () => {
    try {
      await setTeamMembersMutateAsync(members.map((member) => member.id));
      await setTeamHeadMutateAsync(+head.id);
      setIsEditingMembers(false);
    } catch (error) {
      alert(error);
    }
  };

  const hasPerms = auth.user && (isAdmin(auth.user.role) || auth.user.userId === team.head.userId);

  const memberOptions = users
    .filter((user) => user.userId !== team.head.userId && !team.leads.map((lead) => lead.userId).includes(user.userId))
    .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
    .map(userToAutocompleteOption);

  const headOptions = users
    .filter((user) => memberOptions.some((option) => option.id === user.userId) && isHead(user.role))
    .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
    .map((user) => ({ id: `${userToAutocompleteOption(user).id}`, label: userToAutocompleteOption(user).label }));

  const editButtons = (
    <div style={{ display: 'flex' }}>
      <NERFailButton
        onClick={() => {
          setIsEditingMembers(false);
          setMembers(team.members.map(userToAutocompleteOption));
        }}
      >
        Cancel
      </NERFailButton>
      <NERSuccessButton sx={{ ml: 2 }} onClick={handleSubmit}>
        Save
      </NERSuccessButton>
    </div>
  );

  const editingView = (
    <PageBlock title={'People'} headerRight={editButtons}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Head</FormLabel>
            <NERAutocomplete
              id="head-autocomplete"
              options={headOptions}
              onChange={(_event, newValue) => newValue && setHead(newValue)}
              filterSelectedOptions
              size="small"
              placeholder="Select a User"
              value={head}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            multiple
            id="tags-standard"
            options={memberOptions}
            value={members}
            onChange={(_event, newValue) => setMembers(newValue)}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Members" placeholder="Select A User" />
            )}
          />
        </Grid>
      </Grid>
    </PageBlock>
  );

  const nonEditingView = (
    <PageBlock
      title={'People'}
      headerRight={hasPerms ? <IconButton onClick={() => setIsEditingMembers(true)} children={<Edit />} /> : null}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DetailDisplay label="Head" content={fullNamePipe(team.head)} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Leads" content={team.leads.map((lead) => fullNamePipe(lead)).join(', ')} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Members" content={team.members.map((member) => fullNamePipe(member)).join(', ')} />
        </Grid>
      </Grid>
    </PageBlock>
  );
  return isEditingMembers ? editingView : nonEditingView;
};

export default TeamMembersPageBlock;
